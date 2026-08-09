# Portfolio — Jashan Dhiman

**Live:** [jd-3d-portfolio.netlify.app](https://jd-3d-portfolio.netlify.app/)

A single-page portfolio with a WebGL background, built so that the 3D is strictly
additive: the content renders, reads and works whether or not the scene ever appears.

If you are here to judge the code rather than the content, the four write-ups in the
**Engineering notes** section of the live site are the intended entry point — they cover
the WebGL↔DOM handoff, the scene architecture, the progressive-enhancement gate, and what
profiling this page actually turned up. Source for each is linked from the note.

---

## The performance story

The site used to take too long to become usable and felt heavy to scroll. The obvious
suspect was the 3D model. The obvious suspect was wrong.

| | Before | After |
|---|---|---|
| Bytes blocking first paint | 1,857 KB | **201 KB** |
| Largest single critical-path asset | 1.46 MB PNG logo (rendered at 36px) | 138 KB React vendor chunk |
| 3D model | 2,946 KB over 4 chained requests | **534 KB over 1** |
| All images | 6.87 MB | **~195 KB** |
| Triangles per frame | ~115,000 | **~64,000** |
| Works without WebGL | no — white page | **yes** |
| Works without JavaScript | no | **yes** (content + contact) |

Measured on the production build, cold, over an emulated 1.6 Mbps connection:

```
FCP / LCP                876 ms      (LCP element is the <h1>, not an image)
CLS                      0.003
3D scene fully present   7,299 ms    — long after the page is usable
requests / transferred   31 / 312 KB / 0 failures
```

Lighthouse (mobile, simulated throttling): **Performance 83 · Accessibility 100 ·
Best Practices 100 · SEO 100**.

Three findings worth naming, because none of them were the model:

- A **1.46 MB PNG** was being rendered into a 36-pixel box in the navbar, on the critical
  path. A 10 KB SVG of the same mark already existed in the repo.
- The tech balls were tessellated to **subdivision 4 — 5,120 triangles each, ×13**. The
  docked size can show about a quarter of that. Because the material is flat-shaded, that
  number is a visual knob as much as a perf one, so it was measured rather than minimised.
- A scene-preload helper was rendering the **whole scene six times through a cube camera,
  synchronously**, at the exact moment the hero should have been going interactive.

Geometry simplification was tried and **rejected**: at a tolerance tight enough to be safe
it removed 0.6% of triangles, and loose enough to matter it started eating the cloud
ribbons, which are thin-shell surfaces where nearly every triangle carries a silhouette
edge. The savings came from the balls and the loading architecture instead.

---

## Architecture

```
HTML + inline background colour        → dark ground before any stylesheet
  ↓
eager bundle (~24 KB + React vendor)   → nav, hero, error boundaries. No three.js,
                                          no router, no animation library
  ↓ first paint
lazy sections, images below the fold
  ↓ requestIdleCallback + capability gate
3D scene: three.js chunk → .glb        → cross-fades over the CSS backdrop only once
                                          the model has genuinely resolved
```

The background is a **pure-CSS gradient backdrop** that is always mounted. WebGL layers
over it only if a probe actually obtains a context, motion is not being suppressed, and a
device tier from core count, reported memory and pointer type suggests the headroom
exists. Phones deliberately never create a context. A lost context, a render error or a
failed chunk all fall back to the same backdrop.

Quality is a **starting guess that self-corrects**: the tier picks a DPR, then
`PerformanceMonitor` steps it down if measured frame times disagree. Degrade-only, because
stepping back up makes resolution visibly oscillate.

Anything updating per frame — the planet's projected screen position, the ball transforms,
the Tech grid's slot positions — is written straight to `object3D` transforms or through a
plain mutable module, never React state. React only hears about state that changes at
human speed.

### Layout

```
src/
  components/          sections + ErrorBoundary
    canvas/            SceneBackdrop (the gate) → SceneCanvas → Earth / Stars / TechBalls
    toast/
  content/             copy and data, no components
  hoc/                 SectionWrapper (section chrome + reduced-motion config)
  utils/               capabilities, vitals, earthTarget, techSlots, motion
```

`content/navigation.js` is separate from `content/index.js` on purpose: the latter imports
every image asset, and the eagerly-rendered navbar and footer must not drag that graph
onto the critical path.

---

## Measuring it yourself

Field instrumentation is built in, dependency-free, and sends nothing anywhere:

```js
__perf.report()   // FCP, LCP, CLS, long tasks, plus custom marks
```

The custom marks are the interesting half — which quality tier was chosen, when the idle
gate opened, when the scene was genuinely ready, what DPR it settled at and how many times
it was demoted, and **why** the 3D declined when it did (`device-tier`, `reduced-motion`,
`no-webgl`). Add `?perf=1` to print the report when the page is backgrounded.

---

## Tech

**React 18** · **Vite 4** · **Tailwind CSS 3** · **three.js** with
**@react-three/fiber** + **drei** · **Framer Motion** (sections and the contact
choreography) · **EmailJS** · **react-vertical-timeline-component** ·
**react-parallax-tilt**

No router: there are no routes, and `react-router-dom` was removed once that was true on
purpose rather than by accident.

## Scripts

```bash
npm install
npm run dev        # dev server
npm run build      # production build → dist/
npm run preview    # serve the production build
npm run lint       # eslint
npm run deploy:gh  # build with the /3D_Portfolio/ base path, then publish to gh-pages
```

The primary deploy is Netlify at a domain root. `deploy:gh` exists because GitHub project
pages serve from a subpath, and a root-relative build 404s on every asset there; the base
is derived from `homepage` in `package.json` so the two cannot drift.

`scripts/fetch-fonts.mjs` regenerates the self-hosted Poppins subsets. Fonts are served
from `/fonts` rather than Google — the third-party stylesheet was render-blocking. They
are deliberately **not** preloaded: on a throttled connection that made real FCP worse by
competing with the render-critical bytes, and `font-display: swap` means text paints in the
fallback regardless.

## Attribution

Planet model from Sketchfab — see `public/planet/license.txt`. Optimised with
[glTF-Transform](https://gltf-transform.dev/) (Meshopt + WebP; Meshopt over Draco because
its decoder already ships inside three-stdlib, where drei's Draco path fetches one from a
Google CDN at runtime).
