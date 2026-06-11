import { MotionConfig, motion } from "framer-motion";

import { styles } from "../styles";
import { staggerContainer } from "../utils/motion";

const SectionWrapper = (Component, idName) =>
 function HOC() {
  return (
   // reducedMotion="user" makes every Framer Motion animation inside a section honour
   // prefers-reduced-motion: transforms are dropped, opacity still fades. Previously
   // only the scroll cue and the contact plane checked the setting, so a visitor who
   // asked for less motion still got every section sliding in.
   //
   // It lives here rather than in App because SectionWrapper is already inside the
   // lazily-loaded framer-motion chunk. Importing MotionConfig at the app root would
   // pull all ~29 KB gzipped of it onto the critical path to configure it.
   <MotionConfig reducedMotion="user">
    <motion.section
     // The id used to sit on a `.hash-span` child whose only job was a
     // margin-top:-100px / padding-bottom:100px hack to offset the fixed navbar.
     // scroll-margin-top is the platform feature for exactly that, so the anchor can
     // live on the section itself where it belongs.
     id={idName || undefined}
     variants={staggerContainer()}
     initial="hidden"
     whileInView="show"
     viewport={{
      once: true,
      amount: 0.25,
     }}
     className={`${styles.padding} max-w-7xl mx-auto relative z-0 scroll-mt-24`}
    >
     <Component />
    </motion.section>
   </MotionConfig>
  );
 };

export default SectionWrapper;
