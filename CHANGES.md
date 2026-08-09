# Changes — performance, UX and engineering audit

A record of what was changed in this portfolio, why, and what it measurably did.

**Baseline** is commit `c4bf6bd` (*"refactor Tech section to implement 3D tech balls…"*),
the state of the site before this work. Every "before" number below was produced by
building that commit in a git worktree and measuring it with the same tooling as the
"after" — not recalled, and not estimated unless explicitly labelled.

---

## 1. Headline results

### Measured on a cold load, emulated 1.6 Mbps / 150ms RTT, cache disabled

Both conditions are reported, because the two builds behave very differently without a GPU
and comparing across conditions would flatter the result.

**WebGL available** — what a visitor with a working GPU gets:

| | Before | After | |
|---|---|---|---|
| Requests | 55 | **51** | |
| Transferred | **9,031 KB** | **1,120 KB** | **−88%** |
| First Contentful Paint | 828 ms | 868 ms | ≈flat |
| Planet assets finished downloading | **~44 s** | — | |
| Planet actually on screen | not instrumented in the baseline | **7.3 s** | |
| Failed requests / console errors | 0 / 0 | 0 / 0 | |

**WebGL unavailable** — locked-down browsers, blocklisted GPUs, VMs, some crawlers:

| | Before | After | |
|---|---|---|---|
| Requests | 38 | **31** | |
| Transferred | 6,039 KB | **312 KB** | **−95%** |
| First Contentful Paint | 860 ms | 876 ms | ≈flat |
| Outcome | **white page** — uncaught WebGL error blanked the app | full site | |

FCP was never the baseline's problem — text painted early, and then the connection spent
forty more seconds delivering assets nobody could see, on a page that in the second case
had already thrown itself away. What changed is everything *after* first paint.

The "~44 s" is when the baseline's `scene.bin` and its two textures finished transferring;
the baseline had no instrumentation, so the moment it actually rendered is unknown and is
not claimed. The 7.3 s figure is a real `scene:ready` mark, fired when the model resolved.

### Lighthouse — mobile, simulated throttling, identical flags on both

| | Before | After | |
|---|---|---|---|
| **Performance** | **27** | **84** | **+57** |
| Accessibility | 100 | 100 | = |
| Best Practices | 100 | 100 | = |
| SEO | 100 | 100 | = |
| First Contentful Paint | 4.8 s | 3.0 s | −38% |
| **Largest Contentful Paint** | **39.3 s** | **3.6 s** | **−91%** |
| **Total Blocking Time** | **5,770 ms** | **120 ms** | **−98%** |
| Speed Index | 10.2 s | 3.0 s | −71% |
| Cumulative Layout Shift | 0 | 0.035 | small regression, still "good" |

**Read the three 100s carefully.** Accessibility, Best Practices and SEO were *already*
100 before any of this work — while the site had a menu button that keyboards could not
operate, project links that were `<div onClick>`, text at 2.51:1 contrast, no skip link, no
landmarks, and a share card that rendered broken everywhere it was posted. Those scores did
not move because Lighthouse cannot see any of it. It is a smoke test, not an audit.

The CLS regression is real and worth naming: a loading skeleton was added to stop the
footer rendering high and being shoved down, and its reserved height does not exactly match
the content that replaces it. Direct in-page measurement puts CLS at 0.003; Lighthouse's
throttled run says 0.035. Both are inside the "good" threshold of 0.1, and the trade was a
guaranteed large shift for a small one.

### Robustness

| | Before | After |
|---|---|---|
| WebGL unavailable | **white page** — 2,319-byte DOM, `#root` empty, uncaught `Error creating WebGL context` | full site: ~88,800-byte DOM, every section present |
| JavaScript disabled | blank | name, pitch, email and GitHub link render |
| Phones | full-resolution WebGL at native DPR | no GL context created at all |
| `prefers-reduced-motion` | ignored by the scene and by every section animation | scene declines; Framer Motion and CSS keyframes both honour it |
| Lost WebGL context | dead invisible canvas over a blank background | falls back to the CSS backdrop |
| Deep links (`/#projects`) | silently did nothing | scroll to the section |
| Memory across 3 full scroll passes | not measured | heap plateaus ~3.3 MB, DOM nodes constant at 663 — no leak signal |

---

## 2. Build output

| | Before | After |
|---|---|---|
| `dist` total | 24.68 MB (9.60 MB excl. an unused 15 MB model) | **2.08 MB** |
| Bytes blocking first paint | **1,857.5 KB** | **202.8 KB** |
| Entry chunk | 174.66 KB / 59.75 KB gz | 26.5 KB + 138.2 KB cacheable React vendor |
| Largest single critical-path file | **1,464 KB PNG logo** | 138 KB React vendor |
| three.js payload | 853.77 KB / 237.80 gz (one chunk) | 229 KB scene + 611 KB vendor, both lazy |
| All images | **6.87 MB** | **~195 KB** |
| Fonts | 9 weights, third-party, render-blocking | 5 weights, self-hosted, 38.2 KB, non-blocking |
| 3D model | 2,945.9 KB over 4 chained requests | **534.2 KB over 1** |
| Triangles per frame | ~115,000 | **~64,000** |

### What the baseline waterfall actually looked like

The slowest requests on the throttled cold load, before:

```
  2,059.8 KB   43,353 ms   fitness.png          project screenshot, shown at 360x230
  1,464.4 KB   37,633 ms   logo.png             navbar icon, rendered at 36x36
  1,610.8 KB   35,111 ms   planet/scene.bin     could not even start until 8,649 ms
    612.6 KB   26,963 ms   Planet_baseColor.png
    713.4 KB   26,160 ms   Clouds_baseColor.png
    535.6 KB   21,068 ms   memories-timeline.png
      8.1 KB   18,974 ms   shopify.png          8 KB, 19 seconds
```

That last line is the whole problem in one row: an 8 KB icon took nineteen seconds because
nine megabytes were in flight ahead of it. And `scene.bin` could not begin downloading
until 8.6 s in, because the browser had to fetch and parse `scene.gltf` before it learned
the buffer existed — the cost of a 4-file model, not just a large one.

---

## 3. What was changed, and why

### P0 — critical

| Change | Measured effect |
|---|---|
| Swapped the 1,464 KB PNG logo for the 10 KB SVG already in the repo | −1,464 KB off the critical path; that one file had been taking 37.6 s |
| Replaced the 193 KB `.ico` favicon with a 1.4 KB PNG | −192 KB |
| Re-encoded every image to WebP at 2× its display box | 6.87 MB → ~195 KB |
| `icosahedronGeometry` detail 4 → 3 on the tech balls | −49,920 triangles/frame; also 4× cheaper decal construction |
| Removed `<Preload all />` | it was calling `gl.compile()` **and** rendering the whole scene six times through a `CubeCamera`, synchronously, in a layout effect |
| Removed `preserveDrawingBuffer` | forced the driver to retain the backbuffer; nothing ever read the canvas back |
| Gated the Tech grid's rAF loop behind an `IntersectionObserver` | it had been calling `getBoundingClientRect()` every frame for the lifetime of the page, forcing a layout with the section a screen away |
| Moved fonts out of a CSS `@import`, cut 9 weights to 5 | removed a chained blocking round trip |
| Fixed the anchors | `#work` pointed at the experience timeline; the projects grid had `id=""` and was unreachable — including from the hero's only call to action |
| Added an `ErrorBoundary` + WebGL capability probe + CSS backdrop | the white page above |
| Added GitHub/email links to the hero and a new footer | there had been no GitHub profile, LinkedIn, email or resume link anywhere on the site |
| Deleted an unused 15.08 MB model and a 909 KB dead background | −16 MB from the repo |

### P1 — high

| Change | Measured effect |
|---|---|
| Model → single `.glb`, Meshopt + WebP, u16 indices, unused animation dropped | 2,945.9 KB / 4 requests → 534.2 KB / 1 |
| Device tiers + adaptive DPR + `PerformanceMonitor` | replaced a fixed `dpr={[1,2]}` (8.3 Mpx/frame with MSAA, permanently) |
| Scene import gated on `requestIdleCallback` | three.js now starts downloading *at* FCP, not before it |
| Readiness signalled from inside the canvas's Suspense boundary | the CSS stand-in no longer fades out while the model is still downloading |
| Removed `react-router-dom` | ~20 KB gz for zero routes |
| Removed `OrbitControls` | it sat inside `pointer-events-none` with `minPolarAngle === maxPolarAngle`, so it could neither receive input nor rotate anything |
| Removed dead files: `FloatingEarth`, `Computers`, `Loader`, two barrel files | one barrel re-exported the desktop-PC canvas, so a single import from it would have pulled all of three.js into the eager bundle |
| Explicit `manualChunks` | React and three.js now cache independently of app code |
| Rewrote project cards, hero, and section order | projects moved from fifth to second |
| Added the Engineering Notes section | four write-ups drawn from this codebase |
| Removed the four "services" cards | an icon and a job title each, sharing one alt text, occupying the screen directly below the hero |
| Folded the single testimonial into the role it describes | the standalone section rendered a grey "N/A" where an avatar would go |

### P2 — medium

| Change | Measured effect |
|---|---|
| Generated a real 1200×630 OG image; added canonical, `og:url`, `og:image`, JSON-LD `Person`, `robots.txt`, `sitemap.xml` | `twitter:card` had claimed `summary_large_image` with **no image**, so every share rendered broken |
| Raised all sub-AA text opacities | measured: `/60` was 3.63:1 and the form placeholder 2.51:1; everything is now ≥5.39:1 |
| Skip link, `<header>`/`<main>`/`<footer>` landmarks, named navs, focus-visible rings, `aria-current`, Escape-to-close | none of it existed |
| `MotionConfig reducedMotion="user"` + a CSS keyframe block + the scene's own gate | reduced motion needed all three; only two small components had honoured it |
| Menu toggle `<img onClick>` → `<button>`; project card `<div onClick>` → `<a>` | neither was keyboard operable; `aria-expanded` on an `<img>` is invalid |
| `scroll-behavior` moved from `*` to `html`; `.hash-span` hack replaced with `scroll-margin-top` | the hack was an empty `&nbsp;` span per section with `margin-top:-100px` |
| ScrollCue interval tied to viewport visibility | it had re-armed a 40 ms interval — ~25 React renders/second — for the whole session |
| WebGL context-loss handling | made a fallback claim true that had only been written in a comment |
| ESLint added, then its findings fixed | found the two Tech bugs below |
| Flattened `src/components/components/` → `src/components/`; `constants/` → `content/` | |

### P3 — polish

| Change | Measured effect |
|---|---|
| Self-hosted Poppins (latin subset, 5 weights, 38.2 KB) | Lighthouse had measured the third-party stylesheet as **~923 ms of render-blocking**; Performance 78 → 83, Speed Index 5.6 s → 3.0 s |
| Dependency-free field instrumentation (`window.__perf`) | records FCP/LCP/CLS/long tasks plus custom marks: quality tier, gate timing, scene-ready, final DPR and demotion count, and *why* the 3D declined |
| `prefers-reduced-transparency` support | `backdrop-filter` is also expensive to composite |
| Fixed the gh-pages deploy | `npm run deploy:gh` would have 404'd on every asset; base is now derived from `homepage` so they cannot drift |

---

## 4. Changes considered and rejected

Rejecting things with a reason is part of the work.

**Geometry simplification of the planet.** Measured, not assumed. At
`--simplify-error 0.0001` it removed 288 of 47,350 triangles — 0.6%, worthless. At `0.001`
it cut them to 27,474 and the file to 420 KB, but the cloud layer is 34 K of those
triangles and is thin-shell ribbon geometry where nearly every triangle carries a
silhouette edge, not the interior of a smooth surface. 114 KB is not worth buying with the
one thing the hero cannot spend. Kept the geometry; took the frame savings from the balls.

**Replacing Framer Motion's `whileInView` with CSS + IntersectionObserver** (~29 KB gz).
That chunk loads after first paint, so it is not on the critical path, and the change would
mean re-doing the entrance animation on six sections with real regression risk.

**Upgrading three.js from 0.150.** r152 changed colour management. Every material here is
`KHR_materials_unlit`, so the upgrade would visibly alter how the hero renders for no
benefit until KTX2 is adopted.

**Progressive (low-poly-first) model loading.** Needs a second asset and swap logic to
improve on 534 KB that is already one request behind an idle gate.

**Inlining the 31 KB stylesheet** to remove the last render-blocking request (~166 ms). It
would cost separate cacheability on every load. Optimising the metric, not the experience.

**Preloading the two above-the-fold fonts.** Implemented, measured, then reverted — see
below.

---

## 5. Bugs found

### Pre-existing

1. The hero's only CTA and the nav's "Work" link both pointed at the experience timeline;
   the projects grid had `id=""` and could not be linked at all.
2. No WebGL meant a white page — confirmed: 2,319-byte DOM, uncaught error.
3. Deep links to any lazily-loaded section silently did nothing.
4. The Tech grid rendered as **13 empty boxes** on phones, without WebGL, or under reduced
   motion — the slots are blank by design because 3D balls dock over them.
5. The Tech section had no heading at all (found via ESLint: its `styles`, `motion` and
   `textVariant` imports were unused).
6. Three timeline entries shared an empty `id=""` (the library emits it when none is given).
7. The hero clipped its own contact links at 1280×860 — `h-screen` with absolutely
   positioned content.
8. `npm run deploy` would have produced a blank GitHub Pages site.
9. A GitHub Personal Access Token was sitting in plaintext in `.git/config`.
10. The README credited GSAP, which is not a dependency.

### Introduced during this work, then caught

Recorded because the process matters as much as the result.

1. **A new footer imported `navLinks` from the content module**, which imports all 22 image
   assets — pulling 23 KB of project and experience text into the entry chunk. Exactly the
   trap the audit had flagged. Fixed by splitting `content/navigation.js` out.
2. **Claimed geometry simplification "visibly thinned" the clouds** based on comparing two
   screenshots taken at different `--virtual-time-budget` values — so the planet was at a
   different rotation. The conclusion (don't simplify) held for a better reason; the
   evidence was worthless.
3. **Reported a mobile horizontal overflow that did not exist.** Chrome enforces a ~500px
   minimum window width on this machine, so `--window-size=390` laid out at 500px and
   *cropped* the screenshot. Driving CDP with `Emulation.setDeviceMetricsOverride` gave a
   true 390px viewport: `docScrollW === 390`, no overflow.
4. **`domContentLoaded: 0`** — read the navigation entry before that timing existed, and
   reported a real-looking zero.
5. **`transferredKB`** — the navigation entry's `transferSize` is the HTML document alone;
   next to a value of `2` it read as a claim the whole page weighed 2 KB.
6. **The font-fetch script had an off-by-one.** Google writes the subset name in a comment
   *before* each `@font-face`, so splitting on `@font-face` paired every block with the
   next one's label — devanagari files were downloaded as `poppins-*-latin.woff2`. Caught
   because a devanagari `unicode-range` appeared in the output; the corrected files are
   7.5–7.8 KB, matching exactly what Google had served in an earlier waterfall.
7. **Font preloading made real FCP worse** — 852 ms → 956 ms on a throttled connection,
   because 16 KB of fonts competed with the stylesheet and React vendor at the moment those
   gate first paint. Reverted to no preload: 876 ms. Lighthouse's *simulated* throttling
   had reported the opposite.
8. A `sitemap.org` typo in the sitemap namespace (correct is `sitemaps.org`) would have
   made it invalid.
9. A JSX comment placed outside the returned element — a build error.
10. A `dns-prefetch` to the site's own origin, which does nothing.

---

## 6. How to re-measure

```bash
npm run build && npm run preview
npm run lint
```

In the browser console on any deployed build:

```js
__perf.report()   // FCP, LCP, CLS, long tasks, device inputs, scene marks
```

Append `?perf=1` to print the report when the page is backgrounded. The scene marks are the
part no lab tool can produce — which tier was chosen, when the gate opened, when the model
truly resolved, the DPR it settled at and how many times it was demoted, and which gate
closed when the 3D declines (`device-tier`, `reduced-motion`, `no-webgl`).

Representative output, desktop, WebGL via SwiftShader:

```
fcp 436   lcp 436   lcpElement "h1"   cls 0.003
scene:gate-open     381 ms  (tier "high")
scene:import-start  649 ms
scene:ready         899 ms
scene:dpr           { value: 1.25, demotions: 2, tier: "high" }
```

That last line is the adaptive quality system correcting itself: the tier guessed `high`
from 8 cores and 16 GB, then measured frame times disagreed and resolution stepped down
twice. `lcpElement: "h1"` is the other one worth watching — the largest paint is text, not
an image, which is the direct result of evicting the 1.46 MB logo.

---

## 7. Still open

Content, not code:

- `linkedin` and `resumeUrl` are `null` in `src/content/social.js`. They render nothing
  rather than a dead link until set.
- Two project cards are flagged `needsDepth` in `src/content/index.js` — Trading Dashboard
  and Wellness App. Only their author knows the decision worth describing.
- The years-of-experience figure is inconsistent: the meta description says "4 years",
  while the dates in `experiences` imply roughly 5 years 11 months from Sep 2020. That text
  is in the OG description crawlers read.

Known and deliberate:

- The 31 KB stylesheet is still render-blocking (~166 ms) — see §4.
- ~38 KiB of `uses-responsive-images` savings remain; it needs `srcset` variants and a real
  asset pipeline, which this repo does not have.
- If the domain changes, four absolute URLs in `index.html` plus `public/robots.txt` and
  `public/sitemap.xml` need updating together.
