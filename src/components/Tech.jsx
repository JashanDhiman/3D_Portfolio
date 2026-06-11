import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { styles } from "../styles";
import SectionWrapper from "../hoc/SectionWrapper";
import { technologies } from "../content";
import { textVariant } from "../utils/motion";
import { setTechSlots, clearTechSlots } from "../utils/techSlots";

// The balls themselves are not rendered here — they live in the persistent
// background scene (SceneCanvas) so they can orbit the Earth while this section
// is away. All this section does is reserve the layout and publish, every frame,
// where each ball should land and how far through the arrival it should be.

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

const Tech = () => {
 const gridRef = useRef(null);
 const slotRefs = useRef([]);
 const offsets = useRef([]); // slot centre relative to the grid box
 const slotSize = useRef(112);
 const [docked, setDocked] = useState(false);

 // Slot offsets only change on layout, so measure them on resize and read just
 // the grid's rect per frame — one forced layout instead of one per ball.
 useLayoutEffect(() => {
  const measure = () => {
   const grid = gridRef.current;
   if (!grid) return;
   const box = grid.getBoundingClientRect();
   offsets.current = slotRefs.current.map((slot) => {
    if (!slot) return { dx: 0, dy: 0 };
    const r = slot.getBoundingClientRect();
    return {
     dx: r.left - box.left + r.width / 2,
     dy: r.top - box.top + r.height / 2,
    };
   });
   const first = slotRefs.current[0];
   if (first) slotSize.current = first.getBoundingClientRect().width;
  };

  measure();
  window.addEventListener("resize", measure);
  return () => window.removeEventListener("resize", measure);
 }, []);

 // Publishing slot positions means reading the grid's rect, and reading a rect
 // forces layout. That is affordable once per frame while the section is in play
 // and pure waste the rest of the time — this loop used to run for the lifetime of
 // the page, forcing a layout on every frame even with the section a full page
 // away, interleaved with the background scene's own render. An observer starts it
 // a viewport early (so the balls are already flying by the time the grid appears)
 // and stops it once the section is well clear.
 useEffect(() => {
  const grid = gridRef.current;
  if (!grid) return;

  let raf = 0;

  const tick = () => {
   const box = grid.getBoundingClientRect();
   const vh = window.innerHeight;
   const ramp = vh * 0.55; // how much scrolling the launch and the exit each take

   // 1 while the section is parked in view, easing to 0 as it enters or leaves.
   const entering = clamp01((vh - box.top) / ramp);
   const leaving = clamp01(box.bottom / ramp);
   const progress = Math.min(entering, leaving);

   setTechSlots(
    progress > 0
     ? offsets.current.map((o) => ({ x: box.left + o.dx, y: box.top + o.dy }))
     : [],
    slotSize.current,
    progress
   );

   // Labels fade with a plain class swap once the balls are mostly home —
   // React must not re-render on every frame of this loop.
   setDocked(progress > 0.6);
   raf = requestAnimationFrame(tick);
  };

  const start = () => {
   if (!raf) raf = requestAnimationFrame(tick);
  };

  const stop = () => {
   if (!raf) return;
   cancelAnimationFrame(raf);
   raf = 0;
   // Hand the balls back to their orbit; without this they would freeze
   // wherever they were when the loop stopped.
   clearTechSlots();
   setDocked(false);
  };

  // One viewport of slack on each side: the ramp above only produces a non-zero
  // progress once the section is genuinely on approach, so this never clips the
  // animation — it just avoids paying for it while the section is far off screen.
  const observer = new IntersectionObserver(
   ([entry]) => (entry.isIntersecting ? start() : stop()),
   { rootMargin: "100% 0px" }
  );
  observer.observe(grid);

  return () => {
   observer.disconnect();
   stop();
  };
 }, []);

 return (
  <>
   <motion.div variants={textVariant()}>
    <p className={styles.sectionSubText}>What I work with</p>
    <h2 className={styles.sectionHeadText}>Tech stack.</h2>
   </motion.div>

   <div ref={gridRef} className="mt-20 flex flex-row flex-wrap justify-center gap-10">
    {technologies.map((tech, i) => (
     <div className="w-28 flex flex-col items-center" key={tech.name}>
      <div ref={(node) => (slotRefs.current[i] = node)} className="w-28 h-28">
       {/* The 3D ball docks over this box — but only when there is a scene. On a phone,
           without WebGL, or under reduced motion there is none, and this grid used to
           render as thirteen empty squares with captions floating under them. The flat
           icon is the real content; CSS hides it only once the scene reports itself
           live, so the enhanced path looks unchanged. */}
       <img
        src={tech.icon}
        alt={tech.name}
        width={112}
        height={112}
        loading="lazy"
        decoding="async"
        className="tech-flat-icon h-full w-full object-contain p-3"
       />
      </div>
      <p
       className={`text-white text-[12px] mt-2 text-center transition-opacity duration-700 ${
        docked ? "opacity-100" : "opacity-0"
       }`}
      >
       {tech.name}
      </p>
     </div>
    ))}
   </div>
  </>
 );
};

export default SectionWrapper(Tech, "tech");
