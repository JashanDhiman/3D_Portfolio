// Notes about this site's own code.
//
// Every claim here is checkable against files in this repository, which is the whole
// point: the projects section says what was built, this says how it was reasoned about.
// If one of these makes an interviewer ask "wait, how did you do that?", it is working.
export const notes = [
  {
    id: "dom-webgl",
    label: "WebGL ↔ DOM",
    title: "Flying a DOM element around a 3D object",
    problem:
      "Submitting the contact form launches a paper plane that curves into orbit around the planet, laps it, then spirals into the surface. The plane is an HTML element. The planet is a mesh inside a WebGL canvas. Neither one knows where the other is on screen, and the planet is moving — it slides and rescales as you scroll.",
    approach:
      "Each frame the scene projects two points through the camera: the planet's centre, and one point on its edge offset along the camera's right axis. Projecting both yields not just a position but an on-screen radius, in CSS pixels. The plane is then plain requestAnimationFrame maths writing translate3d, sampling a quadratic launch curve into a tilted ellipse for the orbit.",
    tradeoff:
      "Those coordinates travel through a plain mutable module, not React state and not context. They change 60 times a second, and re-rendering a React tree at that rate would cost considerably more than the animation it is driving. The same reasoning appears twice in this codebase — anything updating per-frame writes to object3D transforms or the DOM directly, and React only hears about state that changes at human speed.",
    detail:
      "It also degrades: if the canvas has not drawn yet there is no planet to aim at, so the plane checks for a published target and falls back to a straight exit off-screen rather than flying to 0,0.",
    files: ["src/utils/earthTarget.js", "src/components/PlaneFlight.jsx"],
  },
  {
    id: "tech-balls",
    label: "Scene architecture",
    title: "Thirteen objects with two homes",
    problem:
      "The tech icons should orbit the planet while the skills section is off screen, then fly in and land exactly on that section's grid — matching the real DOM boxes, at the right size, as the page scrolls.",
    approach:
      "The balls do not live in the section. They live in the persistent background scene, so they can exist while the section does not. The section publishes its slot centres in viewport pixels plus a 0-to-1 arrival progress; the scene unprojects each slot onto a fixed z-plane in front of the planet and interpolates from the orbit position. Ball size comes from world-units-per-CSS-pixel, derived from the camera's field of view and distance to that plane, so a ball covers exactly the box it is aiming at at any viewport size.",
    tradeoff:
      "Arrivals are staggered along the golden angle so the swarm peels off one at a time instead of moving as a block, and nothing is random — the layout is deterministic, so it looks the same every load.",
    detail:
      "The fiddliest part is the rotation. Balls spin while parked in orbit and must arrive dead still with their icon square to the camera. Latching the target angle causes a visible snap, because the ball is still tracking a slot that moves as you scroll. So only the whole-turn count is latched, never the angle: the aim stays live, the blend stays smooth.",
    files: [
      "src/components/canvas/TechBalls.jsx",
      "src/utils/techSlots.js",
      "src/components/Tech.jsx",
    ],
  },
  {
    id: "optional-3d",
    label: "Progressive enhancement",
    title: "Making the 3D impossible to break the page on",
    problem:
      "A full-viewport WebGL backdrop is a single point of failure and a battery tax. Locked-down corporate browsers, blocklisted GPUs, VMs and crawlers all report a perfectly ordinary user agent and then fail to hand out a context — and on a phone the scene is the most expensive thing on the least capable hardware.",
    approach:
      "The background is a pure-CSS gradient backdrop that is always mounted. WebGL is layered over it only if a probe actually obtains a context (and releases it again, since browsers cap live contexts), motion is not being suppressed, and a device tier from core count, reported memory and pointer type suggests the headroom exists. The scene chunk is imported at idle, not at first paint, and sits behind an error boundary that falls back to the same backdrop.",
    tradeoff:
      "Phones deliberately never create a context at all. On a six-inch screen the content is the point, and no amount of orbiting geometry is worth the frame budget and the heat.",
    detail:
      "The handover moment matters more than it sounds. The backdrop only cross-fades once a readiness signal fires from inside the canvas's own Suspense boundary, which is the first instant the model has genuinely resolved. Signalling from outside would only prove the JavaScript chunk had arrived, and would fade the stand-in away while the planet was still downloading — a gap with nothing in it.",
    files: [
      "src/components/canvas/SceneBackdrop.jsx",
      "src/utils/capabilities.js",
    ],
  },
  {
    id: "perf-pass",
    label: "Performance",
    title: "The bottleneck was not the 3D model",
    problem:
      "This site used to take too long to become usable and felt heavy to scroll. The obvious suspect was the 3D planet, and the obvious suspect was wrong.",
    approach:
      "Measure first. The model was 2.9 MB across four chained requests — real, but a 1.46 MB PNG logo being rendered into a 36-pixel box sat in the critical path, and unoptimised screenshots outweighed the model roughly two to one. The frame cost was worse: the tech balls were tessellated four subdivision levels deep, 5,120 triangles each where about 1,280 is the most the docked size can show, and a scene-preload helper was quietly rendering the entire scene six times through a cube camera, synchronously, at startup. A layout-reading loop for the skills section ran for the lifetime of the page, forcing a layout every frame with the section a full page away.",
    tradeoff:
      "Geometry simplification was tested and rejected. At a tolerance tight enough to be safe it removed 0.6% of triangles; loose enough to matter, it started eating the cloud ribbons, which are thin-shell surfaces where nearly every triangle carries a silhouette edge rather than the interior of a smooth curve. There was no redundancy to reclaim, so the savings came from the balls and from the loading architecture instead.",
    detail:
      "Result: the bytes that block first paint went from about 1,857 KB to 192 KB, the model from 2,946 KB over four requests to 534 KB over one, and per-frame triangles from roughly 115,000 to 64,000 — with resolution now chosen per device tier and stepped down automatically if measured frame times disagree with that guess.",
    files: [
      "src/components/canvas/Ball.jsx",
      "src/components/canvas/Earth.jsx",
      "vite.config.js",
    ],
  },
];
