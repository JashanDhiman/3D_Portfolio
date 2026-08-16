import { useCallback, useEffect, useRef, useState } from "react";
import { styles } from "../styles";
import { availability } from "../content/social";
import SocialLinks from "./SocialLinks";

const CUE_LABEL = "Decrypt Scroll";
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>#%*";

// Cycles the label through random glyphs, then "decrypts" it left to right.
const ScrollCue = () => {
  const [label, setLabel] = useState(CUE_LABEL);
  const scrambleRef = useRef(null);
  const cueRef = useRef(null);

  const scramble = useCallback(() => {
    if (scrambleRef.current) clearInterval(scrambleRef.current);

    let frame = 0;
    scrambleRef.current = setInterval(() => {
      frame += 1;
      const revealed = frame / 2.5;

      setLabel(
        CUE_LABEL.split("")
          .map((char, index) =>
            char === " " || index < revealed ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          )
          .join("")
      );

      if (revealed >= CUE_LABEL.length) {
        clearInterval(scrambleRef.current);
        scrambleRef.current = null;
        setLabel(CUE_LABEL);
      }
    }, 40);
  }, []);

  // The scramble runs a 40ms interval that calls setLabel, so ~25 React renders a
  // second. It used to re-arm every 5.2s for the lifetime of the page, which meant it
  // was still re-rendering while the visitor read the experience timeline three screens
  // below. An IntersectionObserver ties it to the cue actually being on screen.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const node = cueRef.current;
    if (!node) return undefined;

    let loop = 0;

    const stop = () => {
      if (loop) {
        clearInterval(loop);
        loop = 0;
      }
      if (scrambleRef.current) {
        clearInterval(scrambleRef.current);
        scrambleRef.current = null;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!loop) {
          scramble();
          loop = setInterval(scramble, 5200);
        }
      } else {
        stop();
        setLabel(CUE_LABEL); // leave it readable rather than frozen mid-scramble
      }
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
      stop();
    };
  }, [scramble]);

  return (
    <a
      ref={cueRef}
      href="#about"
      aria-label="Scroll to about section"
      onMouseEnter={scramble}
      className="group w-fit m-auto absolute inset-x-0 bottom-10 hidden sm:flex flex-col items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22d3ee]"
    >
      <span
        aria-hidden="true"
        className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-secondary/80 transition-colors duration-300 group-hover:text-[#00cea8]"
      >
        {label}
      </span>
      <span className="relative h-16 w-px bg-gradient-to-b from-[#915eff]/0 via-[#915eff]/50 to-[#00cea8]/40 transition-opacity duration-300 group-hover:via-[#915eff]">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-5 animate-[hero-beam_2.8s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-[#915eff] to-[#00cea8] shadow-[0_0_12px_2px_rgba(0,206,168,0.5)]"
        />
      </span>
    </a>
  );
};

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
    <path
      d="M5 12h13m0 0-5-5m5 5-5 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// The section was h-screen with its content absolutely positioned inside, which silently
// clipped anything that did not fit: at a 1280x860 laptop the contact links fell off the
// bottom edge and the scroll cue landed on top of the code block. min-h-screen with the
// content in normal flow fills the viewport when there is room and grows when there is
// not, so nothing can be cut off at any height.
const Hero = () => {
  return (
    <section id="hero-section" className="relative mx-auto w-full">
      <div className={`${styles.paddingX} mx-auto flex max-w-7xl flex-col justify-center pb-16 pt-28 sm:min-h-screen sm:pb-28`}>
        {/* lg:max-w-5xl rather than 4xl: at the 80px desktop heading size the first line
            overran a 4xl (896px) box by a hair and wrapped, orphaning a word. The prose
            and the code block below carry their own narrower max-w-xl, so widening this
            wrapper only gives the headline room. */}
        <div className="w-full max-w-3xl lg:max-w-5xl">
          {/* status badge
              max-w-full + flex-wrap + min-w-0 are load-bearing, not decoration. As a
              plain inline-flex this label could not wrap, so its ~37 characters set a
              min-content width wider than a 390px phone. That widened the whole hero
              column, which in turn let the heading, the prose and the code block spill
              off the right edge and pushed the navbar's menu button off screen entirely.
              Tighter tracking on small screens buys the rest of the room. */}
          <div className="inline-flex max-w-full flex-wrap items-center gap-x-2.5 gap-y-1 rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00cea8] shadow-[0_0_10px_#00cea8] animate-[exp-pulse_1.8s_ease-in-out_infinite]" />
            <span className="min-w-0 text-[10px] font-bold uppercase tracking-[0.12em] text-secondary sm:text-[11px] sm:tracking-[0.2em]">
              {/* Braced so it reads as deliberate content: a bare // in JSX children is
                  also what a forgotten comment looks like, which is what
                  react/jsx-no-comment-textnodes exists to catch. */}
              Jashan Dhiman <span className="text-[#804dee]">{"//"}</span> Full-Stack Developer
            </span>
          </div>

          {/* This used to read "Architecting / Scalable Futures." — which is true of most
              developers and therefore says nothing about this one. Leading with the
              regulated-healthcare work instead, because almost nobody else's portfolio
              can say it. */}
          {/* Both lines are ~20 characters so they set as two balanced lines at the 80px
              desktop size. "I build software that / handles real patient data." was one
              word too long and wrapped to three, orphaning "data." on its own line. */}
          <h1 className={`${styles.heroHeadText} text-white`}>
            Building
            <br />
            <span className="bg-gradient-to-r from-[#bf61ff] via-[#7aa2f7] to-[#00cea8] bg-clip-text text-transparent">
              healthcare platforms.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-[28px] text-secondary sm:text-[17px] sm:leading-[30px]">
            React and Node.js on HIPAA-compliant healthcare platforms, FHIR, PHI, and the
            boundaries data isn&apos;t allowed to cross.
          </p>

          {/* developer manifest — four lines that a recruiter can actually use, rather
              than name/role/mission, which the badge and heading already covered */}
          <div className="mt-6 max-w-xl overflow-x-auto rounded-r-2xl border-l-2 border-[#915eff] bg-[#0d0920]/70 px-5 py-4 shadow-card backdrop-blur-sm sm:px-6 sm:py-5">
            <pre className="font-mono text-[11px] leading-[1.9] text-secondary sm:text-[13px]">
              <code>
                <span className="text-[#bf61ff]">const</span>{" "}
                <span className="font-semibold text-[#7aa2f7]">engineer</span> = {"{"}
                {"\n  "}
                <span className="text-white-100">focus</span>:{" "}
                <span className="font-semibold text-[#00cea8]">&quot;Healthcare platforms&quot;</span>,
                {"\n  "}
                <span className="text-white-100">stack</span>: [
                <span className="font-semibold text-[#00cea8]">&quot;React&quot;</span>,{" "}
                <span className="font-semibold text-[#00cea8]">&quot;Node.js&quot;</span>,{" "}
                <span className="font-semibold text-[#00cea8]">&quot;TypeScript&quot;</span>,{" "}
                <span className="font-semibold text-[#00cea8]">&quot;Postgres&quot;</span>],
                {"\n  "}
                <span className="text-white-100">domain</span>: [
                <span className="font-semibold text-[#00cea8]">&quot;FHIR&quot;</span>,{" "}
                <span className="font-semibold text-[#00cea8]">&quot;HIPAA&quot;</span>,{" "}
                <span className="font-semibold text-[#00cea8]">&quot;PHI&quot;</span>],
                {"\n  "}
                <span className="text-white-100">current</span>:{" "}
                <span className="font-semibold text-[#00cea8]">
                  &quot;Senior Software Associate @SmartData&quot;
                </span>
                ,{"\n"}
                {"};"}
              </code>
            </pre>
          </div>

          {/* calls to action — this used to point at #work, which resolved to the
              experience timeline rather than the projects grid */}
          {/*<div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#804dee] to-[#bf61ff] px-6 py-3 text-[15px] font-bold text-white shadow-[0_10px_30px_-14px_rgba(128,77,238,0.9)] transition-shadow duration-300 hover:shadow-[0_14px_36px_-12px_rgba(191,97,255,0.95)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee]"
            >
              View Projects
              <ArrowIcon />
            </a>
          </div>*/}

          {/* Above the fold on purpose: a visitor who only reads the hero should
              still leave with a way to check the code or get in touch. */}
          <SocialLinks className="mt-6" />

          {availability && (
            <p className="mt-5 text-[12px] font-semibold tracking-wide text-secondary/80">
              {availability}
            </p>
          )}
        </div>
      </div>

      {/* scroll cue */}
      <ScrollCue />
    </section>
  );
};

export default Hero;
