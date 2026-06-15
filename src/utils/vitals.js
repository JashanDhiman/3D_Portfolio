// Lightweight, dependency-free field measurement.
//
// The `web-vitals` package is small and good, but everything needed here is a couple of
// PerformanceObservers and the navigation entry — and a page whose selling point is that
// it counts its own bytes should not add a dependency to count them.
//
// Nothing is sent anywhere. There is no analytics endpoint behind this, and inventing one
// would mean shipping a beacon to a URL that does not exist. Instead the numbers land on
// `window.__perf`, so they can be read from the console on the real deployed site:
//
//   __perf.report()      // metrics, custom marks and device inputs
//   ?perf=1 in the URL   // also prints that report when the page is backgrounded
//
// Custom marks matter more than the standard metrics here. Lab tools will tell you the
// LCP; only the app can say when the WebGL gate opened, which quality tier it picked,
// whether it declined and why, and how long the model actually took.

const state = {
  metrics: {},
  marks: {},
  device: {},
  longTasks: { count: 0, totalMs: 0 },
};

const round = (n) => Math.round(n * 10) / 10;

// Records a moment relative to navigation start, plus optional context.
export const mark = (name, detail) => {
  state.marks[name] = { at: round(performance.now()), ...(detail === undefined ? {} : { detail }) };
};

// Each observer is registered separately and defensively: an unsupported entry type
// throws, and one missing metric must not take the rest of the instrumentation with it.
const observe = (type, callback, extra = {}) => {
  try {
    const observer = new PerformanceObserver((list) => callback(list.getEntries()));
    observer.observe({ type, buffered: true, ...extra });
    return observer;
  } catch {
    return null;
  }
};

export const initVitals = () => {
  if (typeof window === "undefined" || typeof PerformanceObserver === "undefined") return;
  if (window.__perf) return; // guard against double-init in StrictMode

  state.device = {
    dpr: window.devicePixelRatio,
    cores: navigator.hardwareConcurrency ?? null,
    memoryGB: navigator.deviceMemory ?? null,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    // Chromium-only and only present on some connections; null is a normal answer.
    connection: navigator.connection?.effectiveType ?? null,
  };

  observe("paint", (entries) => {
    for (const entry of entries) {
      if (entry.name === "first-contentful-paint") state.metrics.fcp = round(entry.startTime);
    }
  });

  // LCP fires repeatedly as bigger candidates appear; the last one before interaction is
  // the real answer, so keep overwriting.
  observe("largest-contentful-paint", (entries) => {
    const last = entries[entries.length - 1];
    if (last) {
      state.metrics.lcp = round(last.startTime);
      state.metrics.lcpElement = last.element?.tagName?.toLowerCase() ?? null;
    }
  });

  // CLS is a sum of shift scores, excluding shifts within 500ms of a real interaction.
  observe("layout-shift", (entries) => {
    let cls = state.metrics.cls ?? 0;
    for (const entry of entries) if (!entry.hadRecentInput) cls += entry.value;
    state.metrics.cls = Math.round(cls * 1000) / 1000;
  });

  observe("first-input", (entries) => {
    const first = entries[0];
    if (first) state.metrics.fid = round(first.processingStart - first.startTime);
  });

  // Not INP — INP is a high percentile over the whole visit and needs more bookkeeping
  // than this is worth. This is the single worst interaction latency seen, named so it
  // cannot be mistaken for the real metric.
  observe("event", (entries) => {
    let worst = state.metrics.worstInteractionMs ?? 0;
    for (const entry of entries) worst = Math.max(worst, entry.duration);
    state.metrics.worstInteractionMs = round(worst);
  }, { durationThreshold: 40 });

  // Main-thread blocking. Not Total Blocking Time (which is scoped to the FCP..TTI
  // window); this is every long task, which is the number that matters for whether
  // scrolling feels stuck.
  observe("longtask", (entries) => {
    for (const entry of entries) {
      state.longTasks.count += 1;
      state.longTasks.totalMs = round(state.longTasks.totalMs + entry.duration);
    }
  });

  // Navigation timings are read here rather than at init: this module is evaluated
  // before DOMContentLoaded, so domContentLoadedEventEnd was still 0 and got reported
  // as a real measurement of zero. Reading the entry when the report is requested means
  // every field is whatever it actually is by then.
  const navigationMetrics = () => {
    const nav = performance.getEntriesByType("navigation")[0];
    if (!nav) return {};
    return {
      ttfb: round(nav.responseStart),
      domContentLoaded: nav.domContentLoadedEventEnd ? round(nav.domContentLoadedEventEnd) : null,
      loadComplete: nav.loadEventEnd ? round(nav.loadEventEnd) : null,
      // The navigation entry's transferSize covers the HTML document alone, not the
      // subresources. Named accordingly, because "transferredKB" next to a 2 would read
      // as a claim that the whole page weighs 2 KB.
      documentKB: nav.transferSize ? Math.round(nav.transferSize / 1024) : null,
    };
  };

  const report = () => ({
    metrics: { ...navigationMetrics(), ...state.metrics },
    longTasks: { ...state.longTasks },
    marks: { ...state.marks },
    device: { ...state.device },
  });

  window.__perf = { report, mark };

  const verbose =
    new URLSearchParams(window.location.search).has("perf") ||
    /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

  if (verbose) {
    // pagehide rather than unload: unload is unreliable and blocks the back/forward
    // cache. This is the last moment the numbers are complete.
    window.addEventListener(
      "pagehide",
      () => {
        const r = report();
        console.groupCollapsed(
          `%cperf%c LCP ${r.metrics.lcp ?? "?"}ms · CLS ${r.metrics.cls ?? 0} · long tasks ${r.longTasks.count}`,
          "background:#804dee;color:#fff;padding:2px 6px;border-radius:3px",
          ""
        );
        console.table(r.metrics);
        console.table(r.marks);
        console.table(r.device);
        console.groupEnd();
      },
      { once: true }
    );
  }
};
