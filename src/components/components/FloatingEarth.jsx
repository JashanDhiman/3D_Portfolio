import React, { Suspense } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import EarthCanvas from "../components/canvas/Earth";

/**
 * FloatingEarth - Scroll-linked 3D Earth using Framer Motion.
 * 
 * Strategy:
 * - Responsive 0 -> 1 scroll progress for the whole page.
 * - Transform 'x' and 'scale' using non-linear interpolation.
 * - Uses 'right: 0' and 'width: 50%' for Hero alignment.
 * - Moves 'x' offset to center the model during mid-scroll.
 */
const FloatingEarth = () => {
  const { scrollYProgress } = useScroll();

  // Mapping scroll progress (0 to 1) to styling values
  // These arrays correspond to: [Top, Middle, Contact/Bottom]
  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [1, 0.1, 0.1, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [1, 0.7, 0.7, 1]);

  // X-translation: 0% is right-half, -50% is perfectly centered
  // (Since container is 50% width and right-aligned)
  const x = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], ["0%", "-50%", "-50%", "0%"]);

  // Z-index handling
  const zIndex = useTransform(scrollYProgress, (p) => (p < 0.2 || p > 0.8 ? 10 : 1));

  const containerStyle = {
    position: "fixed",
    top: 0,
    right: 0,
    width: "50%",
    height: "100vh",
    pointerEvents: "none",
  };

  return (
    <motion.div
      style={{
        ...containerStyle,
        opacity,
        scale,
        x,
        zIndex,
      }}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <div className="w-full h-full flex items-center justify-center">
          <EarthCanvas />
        </div>
      </Suspense>
    </motion.div>
  );
};

export default FloatingEarth;
