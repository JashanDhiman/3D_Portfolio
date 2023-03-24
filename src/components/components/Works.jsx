import { styles } from "../../styles";
import { github } from "../../assets";
import SectionWrapper from "../../hoc/SectionWrapper";
import { projects } from "../../constants";
import { fadeIn, textVariant } from "../../utils/motion";
import { motion } from "framer-motion";

export const ProjectCard = ({ index, name, descripition, tags, image, source_code_link }) => {
 return (
  <motion.div variants={fadeIn("up", "spring", index * 0.5, 0.75)}>
   <Tilt options={{ max: 45, scale: 1, speed: 450 }} className="bg-tertiary p-5 rounded-2xl sm:w-[360px] w-full">
    <div className="relative w-full h-[230px]"></div>
   </Tilt>
  </motion.div>
 );
};

const Works = () => {
 return (
  <>
   <motion.div variants={textVariant()}>
    <p className={styles.sectionSubText}>My work</p>
    <h2 className={styles.sectionHeadText}>Projects.</h2>
   </motion.div>
   <div className="w-full flex">
    <motion.p variants={fadeIn("", "", 0.1, 1)} className="mt-3 text-secondary text-[17px] max-w-3xl leading-[30px]">
     Following projects showcases my skills and experience through real-world examples of my work. Each project is briefly described with links to code repositories and live demos in it. It reflects
     my ability to solve complex problems, work with different technologies, and manage projects effectively.
    </motion.p>
   </div>
   <div className="mt-20 flex flex-wrap gap-7">
    {projects.map((project, index) => (
     <ProjectCard key={`project-${index}`} index={index} {...project} />
    ))}
   </div>
  </>
 );
};

export default SectionWrapper(Works, "");
