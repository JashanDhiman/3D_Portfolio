import { useEffect, useState } from "react";

// Document-scroll progress — the same 0→1 scale framer-motion's useScroll reports — at
// the moment a section's bottom edge meets the bottom of the viewport, i.e. the last
// instant that section is still fully on screen.
//
// scrollYProgress only reaches 1 at the bottom of the *document*, which here is the
// bottom of the footer. Anything keyed to 1 therefore finishes its move while the
// section it belongs to has already scrolled away behind unrelated content, and the
// taller the footer grows the further out of sync the two drift.

const measure = (id) => {
  const element = document.getElementById(id);
  if (!element) return 1;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return 1;

  // getBoundingClientRect is viewport-relative; adding scrollY makes it document-relative.
  const documentBottom = element.getBoundingClientRect().bottom + window.scrollY;
  const scrollAtEnd = documentBottom - window.innerHeight;

  // Kept strictly above zero so callers can scale a keyframe range by this value
  // without the range collapsing — a section ending above the fold would otherwise
  // measure exactly 0 and leave the caller with a degenerate input range.
  return Math.min(1, Math.max(0.01, scrollAtEnd / maxScroll));
};

// Returns 1 until the element exists. The sections below the hero are lazily imported,
// so #contact is not in the document on the first render; degrading to the plain
// whole-document behaviour for those few hundred milliseconds is the honest fallback.
const useSectionEndProgress = (id) => {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    let frame = 0;

    const remeasure = () => {
      // Coalesce to one measurement a frame: a ResizeObserver can fire repeatedly
      // during a resize drag and each measurement forces a layout read.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setProgress((current) => {
          const next = measure(id);
          // Sub-pixel churn would otherwise re-render the scene every frame of a
          // resize for a difference nobody can see.
          return Math.abs(next - current) < 0.0005 ? current : next;
        });
      });
    };

    remeasure();

    // Observing the root element covers both things that move the target: the page
    // growing as lazy chunks, images and fonts land — which is also the moment the
    // section first appears in the document — and the viewport being resized.
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.documentElement);
    window.addEventListener("resize", remeasure);
    // Mobile browsers change innerHeight when the URL bar collapses, without the
    // document itself resizing.
    window.addEventListener("orientationchange", remeasure);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("orientationchange", remeasure);
    };
  }, [id]);

  return progress;
};

export default useSectionEndProgress;
