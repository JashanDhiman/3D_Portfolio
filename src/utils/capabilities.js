// Capability checks for the optional 3D layer.
//
// Feature detection rather than user-agent sniffing: a user agent tells you what
// a browser calls itself, not whether it can hand out a WebGL context. Locked-down
// corporate builds, blocklisted GPUs, headless crawlers and VMs all report a
// perfectly normal UA and then fail to create a context.

// Probes for a real context and releases it again. Browsers cap the number of
// simultaneously live WebGL contexts, so leaving the probe open would spend one of
// the few the actual scene needs.
export const canUseWebGL = () => {
  if (typeof window === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return false;

    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    // Some environments throw rather than returning null.
    return false;
  }
};

// The backdrop continuously rotates a planet and orbits thirteen balls around it.
// That is exactly the kind of ambient motion this query exists to suppress, so a
// visitor who asked for less of it gets the static backdrop instead.
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Coarse starting guess at how much GPU and thermal headroom a device has. Again no
// user-agent parsing — these are signals that actually correlate with capability:
//
//   "off"    phones. A full-viewport WebGL scene at native DPR is the worst possible
//            trade there: it is the slowest hardware, the tightest thermal envelope
//            and the one place where battery is precious, and on a 6-inch screen the
//            content is the whole point. They get the CSS backdrop.
//   "low"    few cores or little memory: render, but at DPR 1 and no MSAA.
//   "medium" the default assumption when signals are unremarkable or unavailable.
//   "high"   plenty of both: DPR up to 1.75 with MSAA.
//
// This is only the opening bid. PerformanceMonitor in the scene measures real frame
// times and steps the resolution down if this guess turns out to be optimistic, so a
// throttled laptop or a busy tab self-corrects.
export const deviceTier = () => {
  if (typeof window === "undefined") return "off";

  const cores = navigator.hardwareConcurrency || 4;
  // Chromium-only, in GiB, and deliberately coarse. 0 means "not reported".
  const memory = navigator.deviceMemory || 0;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 820px)").matches;

  // Coarse pointer alone would catch touchscreen laptops; requiring a narrow
  // viewport too keeps this to actual handsets.
  if (coarsePointer && narrow) return "off";
  if (cores <= 4 || (memory && memory <= 4)) return "low";
  if (cores >= 8 && (!memory || memory >= 8)) return "high";
  return "medium";
};

// Defers work until the browser reports itself idle, with a timeout so it still runs
// on a page that never goes fully quiet. Returns its own cleanup.
export const whenIdle = (fn, timeout = 2500) => {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  // Safari has no requestIdleCallback; a short macrotask delay at least lets the
  // hero paint and the critical requests start before this competes with them.
  const id = window.setTimeout(fn, 300);
  return () => window.clearTimeout(id);
};
