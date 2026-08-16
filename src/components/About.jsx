import { motion } from "framer-motion";

import { styles } from "../styles";
import { fadeIn, textVariant } from "../utils/motion";
import SectionWrapper from "../hoc/SectionWrapper";

// The four "Web Developer / Backend Developer / Healthcare Platforms / Shopify Custom
// Apps" cards that used to sit here have been removed. They were an icon and a job
// title each, they all shared the same alt text, and they occupied the most valuable
// screen on the site — directly below the hero — to say less than the hero already had.
// Everything they gestured at is stated concretely below or evidenced in Projects.
const About = () => {
 return (
  <>
   <motion.div variants={textVariant()}>
    <p className={styles.sectionSubText}>Introduction</p>
    <h2 className={styles.sectionHeadText}>About.</h2>
   </motion.div>

   <motion.div variants={fadeIn("", "", 0.1, 1)} className="mt-4 max-w-3xl space-y-5">
    <p className="text-[17px] leading-[30px] text-secondary">
     I&apos;m a full-stack developer working mostly in React and Node.js. Right now I build
     healthcare platforms, where FHIR, HIPAA and PHI handling are part of the day-to-day
     rather than an afterthought, which mostly means being careful about what data crosses
     which boundary, and being able to explain why.
    </p>
    {/*<p className="text-[17px] leading-[30px] text-secondary">
     Before that: Shopify apps at an agency, and freelance product work for a wellness
     startup — a 3D brain visualisation for clinicians, and a sound-therapy app built on
     signal processing. I like problems where the constraint is real, whether that is
     regulated data or a frame budget.
    </p>*/}
   </motion.div>
  </>
 );
};

export default SectionWrapper(About, "about");
