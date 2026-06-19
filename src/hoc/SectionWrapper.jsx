import { MotionConfig, motion } from "framer-motion";

import { styles } from "../styles";
import { staggerContainer } from "../utils/motion";

// `className` lets a single section override the shared rhythm — currently only
// Contact uses it, to buy back enough vertical space that it and the footer land
// on one laptop screen together.
const SectionWrapper = (Component, idName, className = "") =>
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
      // `amount` is handed to IntersectionObserver as a raw threshold, and a threshold
      // is a fraction of *the observed element*, not of the viewport. The most of an
      // element that can ever be on screen is one viewportful, so anything taller than
      // 1/amount viewports can never reach the threshold: whileInView never fires and
      // every child stays parked in its `hidden` variant at opacity 0.
      //
      // amount: 0.25 put that ceiling at four viewports. Projects is 4.7 of them on a
      // 390x844 phone — measured peak ratio 0.213 against a 0.25 threshold — so the
      // whole section rendered as blank space while the desktop layout, which wraps the
      // same cards into two rows, was well under the limit and looked fine. Experience
      // at 4.35 viewports was one timeline entry away from the same failure.
      //
      // "some" is threshold 0: it fires on the first visible pixel regardless of height.
      // The negative bottom margin keeps the original intent — don't reveal a section
      // until it has actually arrived — without making that depend on how tall it is.
      amount: "some",
      margin: "0px 0px -100px 0px",
     }}
     className={`${styles.padding} max-w-7xl mx-auto relative z-0 scroll-mt-24 ${className}`}
    >
     <Component />
    </motion.section>
   </MotionConfig>
  );
 };

export default SectionWrapper;
