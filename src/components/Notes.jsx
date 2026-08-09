import { motion } from "framer-motion";

import { styles } from "../styles";
import SectionWrapper from "../hoc/SectionWrapper";
import { notes } from "../content/notes";
import { social } from "../content/social";
import { textVariant, fadeIn } from "../utils/motion";

// Progressive disclosure with <details>/<summary> rather than useState. It is
// keyboard operable, exposed to screen readers as a real disclosure widget, findable
// by the browser's own in-page search, and works before any JavaScript runs — none of
// which a div with an onClick gets for free.
const Row = ({ label, children }) => (
 <div className="mt-5">
  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary/80">{label}</p>
  <p className="mt-2 text-[14px] leading-relaxed tracking-wide text-white-100/90">{children}</p>
 </div>
);

const Chevron = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  aria-hidden="true"
  className="h-4 w-4 shrink-0 text-secondary transition-transform duration-300 group-open:rotate-180"
 >
  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
 </svg>
);

const NoteCard = ({ note, index }) => (
 <motion.div variants={fadeIn("up", "spring", index * 0.15, 0.6)}>
  <details
   open={index === 0}
   className="group rounded-[26px] bg-[linear-gradient(120deg,rgba(0,206,168,0.35),rgba(128,77,238,0.4),rgba(191,97,255,0.2))] p-px"
  >
   <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-[25px] bg-[#0d0920] px-6 py-5 [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee]">
    <div>
     <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#00cea8]">
      {note.label}
     </p>
     <h3 className="mt-2 text-[19px] font-black leading-tight text-white sm:text-[21px]">
      {note.title}
     </h3>
    </div>
    <span className="mt-1">
     <Chevron />
    </span>
   </summary>

   <div className="rounded-b-[25px] bg-[#0d0920] px-6 pb-7">
    <div className="h-px bg-gradient-to-r from-[#804dee]/60 via-white/10 to-transparent" />

    <Row label="The problem">{note.problem}</Row>
    <Row label="How it works">{note.approach}</Row>
    <Row label="Trade-off">{note.tradeoff}</Row>
    {note.detail && <Row label="The detail worth asking about">{note.detail}</Row>}

    <div className="mt-6 flex flex-wrap items-center gap-2">
     {note.files.map((file) => (
      <code
       key={file}
       className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-secondary"
      >
       {file}
      </code>
     ))}
    </div>
   </div>
  </details>
 </motion.div>
);

const Notes = () => (
 <>
  <motion.div variants={textVariant()}>
   <p className={styles.sectionSubText}>How I think about problems</p>
   <h2 className={styles.sectionHeadText}>Engineering notes.</h2>
  </motion.div>

  <motion.p
   variants={fadeIn("", "", 0.1, 1)}
   className="mt-3 max-w-3xl text-[17px] leading-[30px] text-secondary"
  >
   Four decisions from building this site, written up the way I would explain them in a
   review — the problem, the mechanism, and what I gave up. Every file named below is in
   the repository if you would rather read the code than my summary of it.
  </motion.p>

  <div className="mt-12 flex flex-col gap-5">
   {notes.map((note, index) => (
    <NoteCard key={note.id} note={note} index={index} />
   ))}
  </div>

  {social.github && (
   <motion.p variants={fadeIn("", "", 0.2, 1)} className="mt-8 text-[14px] text-secondary">
    The source for this page is on{" "}
    <a
     href="https://github.com/JashanDhiman/3D_Portfolio"
     target="_blank"
     rel="noreferrer noopener"
     className="font-semibold text-white underline decoration-[#804dee]/60 underline-offset-4 transition-colors hover:text-[#00cea8]"
    >
     GitHub
    </a>
    .
   </motion.p>
  )}
 </>
);

export default SectionWrapper(Notes, "notes");
