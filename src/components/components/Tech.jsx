import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { styles } from "../../styles";
import SectionWrapper from "../../hoc/SectionWrapper";
import { technologies } from "../../constants";
import { textVariant } from "../../utils/motion";
import { setTechSlots, clearTechSlots } from "../../utils/techSlots";

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

 useEffect(() => {
  let raf = 0;

  const tick = () => {
   const grid = gridRef.current;
   if (grid) {
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
   }
   raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => {
   cancelAnimationFrame(raf);
   clearTechSlots();
  };
 }, []);

 return (
  <>
   <div ref={gridRef} className="mt-20 flex flex-row flex-wrap justify-center gap-10">
    {technologies.map((tech, i) => (
     <div className="w-28 flex flex-col items-center" key={tech.name}>
      {/* Empty on purpose: the 3D ball flies in and docks over this box. */}
      <div
       ref={(node) => (slotRefs.current[i] = node)}
       className="w-28 h-28"
       aria-hidden="true"
      />
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
