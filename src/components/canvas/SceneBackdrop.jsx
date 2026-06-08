import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import ErrorBoundary from "../ErrorBoundary";
import {
 canUseWebGL,
 deviceTier,
 prefersReducedMotion,
 whenIdle,
} from "../../utils/capabilities";
import { mark } from "../../utils/vitals";

// Owns the page's background layer and decides whether the 3D scene is allowed to
// exist at all. Nothing else imports SceneCanvas, so the three.js chunk has exactly
// one entry point and exactly one gate in front of it.
//
// The site is complete in every state below:
//   declined — phone, no WebGL, reduced motion, or the scene threw: CSS backdrop only
//   loading  — CSS backdrop, while three.js and the model download after first paint
//   live     — canvas on top, backdrop's planet glow cross-faded away
const SceneCanvas = lazy(() => import("./SceneCanvas"));

const SceneBackdrop = () => {
 const [tier, setTier] = useState(null);
 const [ready, setReady] = useState(false);

 useEffect(() => {
  const t = deviceTier();

  // Each branch is recorded, because "the 3D never showed up" is the single most likely
  // field complaint and the only useful first question is which gate closed. A lab tool
  // on a desktop with a GPU will never reproduce any of these.
  const declined =
   t === "off" ? "device-tier" : prefersReducedMotion() ? "reduced-motion" : !canUseWebGL() ? "no-webgl" : null;

  if (declined) {
   mark("scene:declined", declined);
   return undefined;
  }

  // The scene is ~235 KB gzipped of three.js plus a 534 KB model. Starting that
  // during first paint makes it compete with the stylesheet, the fonts and the hero's
  // own work for bandwidth and main thread — which is the "takes too long to become
  // usable" complaint, more than the model's size ever was. Waiting for idle costs
  // nothing visually because the CSS backdrop is already on screen.
  mark("scene:gate-open", t);
  return whenIdle(() => {
   mark("scene:import-start", t);
   setTier(t);
  });
 }, []);

 // The gap between scene:import-start and scene:ready is the honest cost of the 3D
 // layer — chunk download, parse, WebGL init, model fetch and decode — measured on the
 // visitor's actual hardware and connection rather than estimated from file sizes.
 const handleReady = useCallback(() => {
  mark("scene:ready");
  setReady(true);
 }, []);

 // Published as an attribute on <html> so plain CSS can react to it. The Tech grid uses
 // it to hide its flat fallback icons exactly when the 3D balls are there to replace
 // them — see .tech-flat-icon in index.css. An attribute keeps that swap out of React,
 // and means any future component can opt into "is the scene live?" without prop
 // drilling or a context.
 useEffect(() => {
  const root = document.documentElement;
  if (ready) root.dataset.scene = "live";
  else delete root.dataset.scene;
  return () => {
   delete root.dataset.scene;
  };
 }, [ready]);

 // Used for both a render error and a lost WebGL context. Either way the canvas is no
 // longer painting, so unmount it and let the CSS backdrop take the page back — a dead
 // canvas left in place is an invisible layer over a blank background.
 const handleError = useCallback(() => {
  mark("scene:lost");
  setTier(null);
  setReady(false);
 }, []);

 return (
  <div className="fixed inset-0 z-[-1] bg-primary pointer-events-none">
   {/* Pure-CSS backdrop: no bytes, no GPU, cannot fail. Stays mounted underneath the
       canvas so a context loss mid-session degrades to this rather than to black. */}
   <div className="scene-poster absolute inset-0" data-solo={!ready} />

   {tier && (
    <ErrorBoundary label="SceneCanvas" fallback={null} onError={handleError}>
     {/* No fallback here: the backdrop below *is* the loading state. */}
     <Suspense fallback={null}>
      {/* onReady fires from inside the canvas, once the model has actually resolved
          — see SceneCanvas. Signalling from out here would only prove the chunk
          arrived, and would fade the backdrop out while the planet was still
          downloading. */}
      <SceneCanvas tier={tier} onReady={handleReady} onContextLost={handleError} />
     </Suspense>
    </ErrorBoundary>
   )}
  </div>
 );
};

export default SceneBackdrop;
