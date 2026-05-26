import React, { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getEarthTarget } from "../../utils/earthTarget";
import SendIcon from "./SendIcon";

// The plane leaves the submit button, curves into orbit around the Earth model,
// laps it, then spirals into the surface. Driven by rAF writing transforms
// straight to the DOM — 60fps of React state would be wasteful here.
const LAUNCH = 480; // ms: button -> orbit entry
const ORBIT = 2400; // ms: laps around the planet (~1.6s per lap)
const IMPACT = 600; // ms: spiral down into the surface
const FLASH = 420; // ms: impact ring lingers after the plane is gone

const TURNS = 1.5;
const TILT = (-18 * Math.PI) / 180; // tips the orbit ring so it reads as 3D
const ORBIT_RX = 1.38; // orbit radii, in multiples of the planet's screen radius
const ORBIT_RY = 0.44;
const THETA0 = Math.PI; // enter the ring on its left edge, facing the form
const TRAIL = 9;
const TRAIL_GAP = 45; // ms each trail dot lags behind the plane

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeIn = (t) => t * t * t;
// only a mild decay on the launch: the plane should still carry speed into the
// orbit rather than coasting to a stop at the entry point
const easeOut = (t) => 1 - (1 - t) ** 2;
const quad = (a, b, c, t) => (1 - t) ** 2 * a + 2 * (1 - t) * t * b + t ** 2 * c;

const PlaneFlight = ({ origin, onDone }) => {
 const planeRef = useRef(null);
 const trailRefs = useRef([]);
 const flashRef = useRef(null);
 const doneRef = useRef(onDone);
 doneRef.current = onDone;

 useLayoutEffect(() => {
  const found = getEarthTarget();
  // No planet on screen yet (canvas still loading) — fall back to a straight exit.
  const orbiting = Boolean(found) && found.radius > 8;
  const planet = found || { x: window.innerWidth + 160, y: origin.y, radius: 0 };

  const orbitPoint = (angle, radiusScale) => {
   const ux = Math.cos(angle) * planet.radius * ORBIT_RX * radiusScale;
   const uy = Math.sin(angle) * planet.radius * ORBIT_RY * radiusScale;
   return {
    x: planet.x + ux * Math.cos(TILT) - uy * Math.sin(TILT),
    y: planet.y + ux * Math.sin(TILT) + uy * Math.cos(TILT),
    // -1 = far side of the ring (drawn small + dim), 1 = near side
    depth: Math.sin(angle),
   };
  };

  const entry = orbiting ? orbitPoint(THETA0, 1) : { x: planet.x, y: planet.y, depth: 1 };
  // control point level with the button, so the launch reads as a flat shot
  // that only bends once it is clear of the form
  const ctrl = { x: origin.x + (entry.x - origin.x) * 0.62, y: origin.y };
  const duration = orbiting ? LAUNCH + ORBIT + IMPACT : LAUNCH;

  const sample = (t) => {
   if (t <= LAUNCH) {
    const p = easeOut(clamp01(t / LAUNCH));
    return {
     x: quad(origin.x, ctrl.x, entry.x, p),
     y: quad(origin.y, ctrl.y, entry.y, p),
     depth: 1 + (entry.depth - 1) * p,
     shrink: 1,
    };
   }
   if (!orbiting) return { ...entry, shrink: 1 };
   if (t <= LAUNCH + ORBIT) {
    // linear: an orbit should hold a steady angular speed, and easing here made
    // the middle of the lap whip past too fast to follow
    const p = clamp01((t - LAUNCH) / ORBIT);
    return { ...orbitPoint(THETA0 + p * TURNS * Math.PI * 2, 1), shrink: 1 };
   }
   const p = clamp01((t - LAUNCH - ORBIT) / IMPACT);
   const shrink = 1 - easeIn(p);
   return { ...orbitPoint(THETA0 + TURNS * Math.PI * 2 + p * Math.PI * 0.7, shrink), shrink };
  };

  const place = (node, at, sizeScale, alpha) => {
   const p = sample(at);
   const near = p.depth * 0.5 + 0.5; // 0 behind the planet, 1 in front of it
   node.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) scale(${(0.55 + 0.45 * near) * sizeScale
    })`;
   node.style.opacity = `${(0.4 + 0.6 * near) * alpha}`;
  };

  const draw = (elapsed) => {
   const fade = clamp01((duration - elapsed) / 140);

   if (planeRef.current) {
    const here = sample(elapsed);
    const ahead = sample(elapsed + 16);
    const heading = (Math.atan2(ahead.y - here.y, ahead.x - here.x) * 180) / Math.PI;
    const near = here.depth * 0.5 + 0.5;
    const scale = (0.55 + 0.45 * near) * (0.25 + 0.75 * here.shrink);
    planeRef.current.style.transform = `translate3d(${here.x}px, ${here.y}px, 0) translate(-50%, -50%) rotate(${heading}deg) scale(${scale})`;
    planeRef.current.style.opacity = `${(0.4 + 0.6 * near) * fade}`;
   }

   trailRefs.current.forEach((node, i) => {
    if (!node) return;
    const at = elapsed - (i + 1) * TRAIL_GAP;
    if (at <= 0) {
     node.style.opacity = "0";
     return;
    }
    const falloff = 1 - i / TRAIL;
    place(node, at, falloff * 0.9, falloff * 0.55 * fade);
   });
  };

  if (flashRef.current && orbiting) {
   const size = planet.radius * 2;
   flashRef.current.style.left = `${planet.x}px`;
   flashRef.current.style.top = `${planet.y}px`;
   flashRef.current.style.width = `${size}px`;
   flashRef.current.style.height = `${size}px`;
  }

  draw(0); // paint the first frame before the browser does, so nothing pops at 0,0

  let raf = 0;
  let start = 0;
  let flashed = false;

  const tick = (now) => {
   if (!start) start = now;
   const elapsed = now - start;
   draw(Math.min(elapsed, duration));

   if (orbiting && !flashed && elapsed >= duration - 90) {
    flashed = true;
    flashRef.current?.classList.add("plane-impact");
   }
   if (elapsed >= duration + (orbiting ? FLASH : 0)) {
    doneRef.current?.();
    return;
   }
   raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
 }, [origin]);

 return createPortal(
  <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
   <span
    ref={flashRef}
    className="absolute rounded-full border border-[#22d3ee]/70 opacity-0 shadow-[0_0_40px_10px_rgba(34,211,238,0.35)]"
   />

   {Array.from({ length: TRAIL }, (_, i) => (
    <span
     key={i}
     ref={(node) => (trailRefs.current[i] = node)}
     className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-[#22d3ee] opacity-0 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
    />
   ))}

   <span
    ref={planeRef}
    className="absolute left-0 top-0 text-white opacity-0 drop-shadow-[0_0_6px_rgba(155,92,246,0.9)]"
   >
    <SendIcon className="h-5 w-5" />
   </span>
  </div>,
  document.body
 );
};

export default PlaneFlight;
