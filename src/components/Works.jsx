import { styles } from "../styles";
import { github, externalLink } from "../assets";
import SectionWrapper from "../hoc/SectionWrapper";
import { projects } from "../content";
import { fadeIn, textVariant } from "../utils/motion";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";

// These were <div onClick={() => window.open(...)}>: invisible to keyboard users, not
// announced as links, and no middle-click or open-in-new-tab. They are anchors now.
const IconLink = ({ href, icon, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer noopener"
    className="black-gradient flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee]"
  >
    <img src={icon} alt="" width={20} height={20} loading="lazy" decoding="async" className="h-1/2 w-1/2 object-contain" />
    <span className="sr-only">{children}</span>
  </a>
);

// Deliberately the same object shape SectionWrapper uses. framer-motion pools
// IntersectionObservers by serialised options, so matching them means every card joins
// the single observer the sections already share rather than allocating its own — the
// cost of a per-card trigger is one extra observe() call, not one extra observer.
const CARD_VIEWPORT = { once: true, amount: "some", margin: "0px 0px -100px 0px" };

export const ProjectCard = ({
  name,
  description,
  highlights,
  tags,
  image,
  source_code_link,
  link,
}) => {
  return (
    // Each card watches for its own arrival instead of inheriting the section's single
    // reveal. Stacked full-width, this section is nearly five viewports tall on a phone,
    // so one section-level trigger meant the last cards finished animating four screens
    // before anyone scrolled to them.
    //
    // The old index * 0.25 delay went with it: staggering off the section's arrival only
    // works when the whole group arrives together. With a per-card trigger that delay
    // would run down while the card was already on screen. Cards sharing a row still
    // arrive on the same scroll position and animate together, so the wrapped desktop
    // layout still reads as a row rising as one.
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={CARD_VIEWPORT}
      variants={fadeIn("up", "spring", 0, 0.75)}
    >
      <Tilt
        tiltMaxAngleX={10}
        tiltMaxAngleY={10}
        scale={1}
        transitionSpeed={450}
        className="flex h-full w-full flex-col rounded-2xl bg-tertiary p-5 sm:w-[360px]"
      >
        <div className="relative h-[230px] w-full">
          {/* Intrinsic dimensions match the exported WebP so the browser can reserve the
              box before the bytes land; below the fold, so lazy. */}
          <img
            src={image}
            alt={`${name} screenshot`}
            width={900}
            height={435}
            loading="lazy"
            decoding="async"
            className="h-full w-full rounded-2xl object-cover"
          />
          <div className="card-img_hover absolute inset-0 m-3 flex justify-end gap-2">
            {link && (
              <IconLink href={link} icon={externalLink}>
                {`Open ${name}`}
              </IconLink>
            )}
            {source_code_link && (
              <IconLink href={source_code_link} icon={github}>
                {`${name} source on GitHub`}
              </IconLink>
            )}
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-[24px] font-bold text-white">{name}</h3>
          <p className="mt-2 text-[14px] text-secondary">{description}</p>
        </div>

        {highlights?.length > 0 && (
          <ul className="mt-4 space-y-2.5">
            {highlights.map((point) => (
              <li key={point} className="flex gap-2.5 text-[13px] leading-relaxed text-white-100/85">
                <span
                  aria-hidden="true"
                  className="mt-[6px] h-1.5 w-1.5 shrink-0 rotate-45 rounded-[2px] bg-gradient-to-br from-[#00cea8] to-[#bf61ff]"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        {/* mt-auto pins the tags to the bottom so cards of differing text length still
            line their tag rows up */}
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {tags?.map((tag) => (
            <p key={tag.name} className={`text-[14px] ${tag.color}`}>
              #{tag.name}
            </p>
          ))}
        </div>
      </Tilt>
    </motion.div>
  );
};

const Works = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>What I have built</p>
        <h2 className={styles.sectionHeadText}>Projects.</h2>
      </motion.div>
      <div className="flex w-full">
        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className="mt-3 max-w-3xl text-[17px] leading-[30px] text-secondary"
        >
          A mix of client work and things I wanted to understand properly. Each one lists
          what was actually interesting to build rather than a feature tour, live demos and
          source are linked on every card that has them.
        </motion.p>
      </div>
      <div className="mt-20 flex flex-wrap items-stretch gap-7">
        {projects.map((project) => (
          <ProjectCard key={project.name} {...project} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(Works, "projects");
