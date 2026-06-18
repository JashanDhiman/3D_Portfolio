import { Suspense, useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useScroll, useTransform } from "framer-motion";
import { Stars } from "./Stars";
import { Earth } from "./Earth";
import TechBalls from "./TechBalls";
import { setEarthTarget, clearEarthTarget } from "../../utils/earthTarget";
import useSectionEndProgress from "../../hooks/useSectionEndProgress";
import { mark } from "../../utils/vitals";

const AnimatedEarth = ({ x, scale }) => {
  const groupRef = useRef();
  const { camera, size } = useThree();
  // radius of the model at scale 1, measured once the gltf has loaded
  const unitRadius = useRef(0);
  const center = useRef(new THREE.Vector3());
  const edge = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());

  useEffect(() => clearEarthTarget, []);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    group.position.x = x.get();
    const s = scale.get();
    group.scale.set(s, s, s);

    if (!unitRadius.current && group.children.length && s) {
      const sphere = new THREE.Box3()
        .setFromObject(group)
        .getBoundingSphere(new THREE.Sphere());
      if (sphere.radius > 0) unitRadius.current = sphere.radius / s;
    }
    if (!unitRadius.current) return;

    // Project the centre and one edge point so overlays get both position and
    // on-screen radius in CSS pixels (the canvas is fixed inset-0, so canvas
    // pixels and viewport coordinates are the same thing).
    group.getWorldPosition(center.current);
    right.current.setFromMatrixColumn(camera.matrixWorld, 0);
    edge.current
      .copy(center.current)
      .addScaledVector(right.current, unitRadius.current * s);

    center.current.project(camera);
    edge.current.project(camera);

    const cx = (center.current.x * 0.5 + 0.5) * size.width;
    const cy = (-center.current.y * 0.5 + 0.5) * size.height;
    const ex = (edge.current.x * 0.5 + 0.5) * size.width;
    const ey = (-edge.current.y * 0.5 + 0.5) * size.height;

    setEarthTarget(cx, cy, Math.hypot(ex - cx, ey - cy));
  });

  return (
    <group ref={groupRef}>
      <Earth />
    </group>
  );
};

// Opening render settings per device tier. DPR is the single biggest lever here: this
// canvas is full-viewport, so cost scales with its square. The old fixed dpr={[1, 2]}
// meant 8.3 megapixels a frame with MSAA on top on any 1080p 2x display, forever,
// which is what made interaction feel heavy on ordinary laptops.
//
// MSAA is only worth its bandwidth once resolution is already low; at high DPR the
// extra samples buy very little on a scene of this kind.
const QUALITY = {
  high: { dpr: 1.75, antialias: true },
  medium: { dpr: 1.25, antialias: false },
  low: { dpr: 1, antialias: false },
};

// Rendered inside the scene's own Suspense boundary, so it mounts only once the
// suspending children in there — chiefly the Earth's .glb — have resolved. That is the
// moment the planet is genuinely on screen, which is when SceneBackdrop can safely
// cross-fade its CSS stand-in away.
const ReadySignal = ({ onReady }) => {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
};

// A WebGL context can be taken away at any time — the GPU resets, the driver recovers
// from a hang, or the browser reclaims contexts because too many tabs wanted one. When
// that happens the canvas keeps its layout box and simply stops painting, so without
// this the page would sit behind an invisible dead layer. Reporting it lets
// SceneBackdrop bring its CSS stand-in back, which is what its comment already claimed
// would happen.
const ContextLossGuard = ({ onLost }) => {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    // Deliberately not calling preventDefault: that asks the browser to restore the
    // context, and we would rather hand the background back to CSS than rebuild a
    // scene on hardware that just failed.
    const handleLost = () => onLost?.();
    canvas.addEventListener("webglcontextlost", handleLost);
    return () => canvas.removeEventListener("webglcontextlost", handleLost);
  }, [gl, onLost]);

  return null;
};

const SceneCanvas = ({ tier = "medium", onReady, onContextLost }) => {
  const quality = QUALITY[tier] ?? QUALITY.medium;
  // Never ask for more pixels than the display actually has — rendering at 1.75x on a
  // 1x monitor is pure waste.
  const [dpr, setDpr] = useState(() =>
    Math.min(quality.dpr, window.devicePixelRatio || 1)
  );
  const [isMobile, setIsMobile] = useState(false);
  const demotions = useRef(0);

  // What the resolution actually settled at, and how many times the frame-time monitor
  // had to step it down to get there. The tier heuristic is a guess from core count and
  // memory; this is the only way to find out in the field how often that guess is wrong.
  useEffect(() => {
    mark("scene:dpr", { value: dpr, demotions: demotions.current, tier });
  }, [dpr, tier]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 500px)");
    setIsMobile(mediaQuery.matches);
    const handleMediaQueryChange = (event) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  const { scrollYProgress } = useScroll();

  // The planet's closing move belongs to the contact form, so it has to end where the
  // form ends. Keying it to scrollYProgress === 1 tied it to the bottom of the document
  // instead, which meant the swing only completed once the footer was fully on screen
  // and the form long gone — and every line added to the footer pushed it later still.
  const contactEnd = useSectionEndProgress("contact");

  // Scroll mapping, as fractions of the journey down to the end of the contact form
  // rather than of the whole document. useTransform clamps past the last stop, so the
  // Earth simply holds its final pose while the footer scrolls in underneath it.
  // 0: Hero (Top) - Right
  // 0.1: About section - Scale Down
  // 0.9: last section - Scale Down
  // 1: end of the contact form - Right, Scale Up
  const stops = [0, 0.1 * contactEnd, 0.9 * contactEnd, contactEnd];
  const earthX = useTransform(scrollYProgress, stops, [isMobile ? 0 : 7, 0, 0, isMobile ? 0 : 7]);
  const earthScale = useTransform(scrollYProgress, stops, [isMobile ? 0.6 : 1, isMobile ? 0.4 : 0.6, isMobile ? 0.4 : 0.6, isMobile ? 0.6 : 1]);

  // The fixed full-viewport wrapper, the CSS backdrop underneath and the
  // capability gate in front all live in SceneBackdrop, which is the only thing
  // that mounts this component.
  return (
    <div className="w-full h-full">
      <Canvas
        // `shadows` removed: it switched on the shadow map, but BallMesh sets
        // castShadow/receiveShadow false and neither light casts, so it configured a
        // feature nothing in the scene uses.
        frameloop="always"
        dpr={dpr}
        // preserveDrawingBuffer dropped: it forces the driver to retain the
        // backbuffer after compositing, and nothing here ever reads the canvas
        // back (no screenshots, no toDataURL).
        gl={{ antialias: quality.antialias }}
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [0, 0, 15],
        }}
        aria-label="3D background with stars and earth"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />

          {/* Stars background */}
          <Stars />

          {/* Floating Earth model */}
          <AnimatedEarth x={earthX} scale={earthScale} />

          <ReadySignal onReady={onReady} />
          <ContextLossGuard onLost={onContextLost} />

          {/* Tech balls: orbit the Earth, dock onto the Tech grid as it scrolls in.
              Own Suspense boundary so the icon textures cannot blank the scene. */}
          <Suspense fallback={null}>
            <TechBalls x={earthX} scale={earthScale} />
          </Suspense>

          {/* OrbitControls removed. It sat inside a pointer-events-none wrapper so it
              could never receive input, and min/maxPolarAngle were both PI/2 with zoom
              disabled, so there was no degree of freedom left to control even if it
              could. It was installing listeners and running an update() every frame to
              do nothing. Rotation is driven in Earth/Stars instead. */}
        </Suspense>

        {/* The tier above is a guess from core count and memory; this measures what
            actually happens. If frames come in slow it steps resolution down until
            they do not. Degrade-only on purpose: stepping back up on recovery makes
            DPR oscillate, and a scene that visibly breathes is worse than one that
            settled slightly soft. */}
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => {
            demotions.current += 1;
            setDpr((d) => Math.max(1, Math.round((d - 0.25) * 100) / 100));
          }}
          onFallback={() => {
            demotions.current += 1;
            setDpr(1);
          }}
        />
        {/* <Preload all /> removed: besides gl.compile() it spins up a CubeCamera and
            renders the entire scene six times into a cube target, synchronously in a
            layout effect — a long task landing exactly when the hero should be going
            interactive. This scene resolves to about three shader programs and has no
            envmap consumer, so there was nothing to warm up. */}
      </Canvas>
    </div>
  );
};

export default SceneCanvas;
