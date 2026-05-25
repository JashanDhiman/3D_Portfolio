//import React, { Suspense, lazy } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { styles } from "../../styles";

//const ComputersCanvas = lazy(() => import("./canvas/Computers"));

const CUE_LABEL = "Decrypt Scroll";
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>#%*";

// Cycles the label through random glyphs, then "decrypts" it left to right.
const ScrollCue = () => {
  const [label, setLabel] = useState(CUE_LABEL);
  const scrambleRef = useRef(null);

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

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    scramble();
    const loop = setInterval(scramble, 5200);

    return () => {
      clearInterval(loop);
      if (scrambleRef.current) clearInterval(scrambleRef.current);
    };
  }, [scramble]);

  return (
    <a
      href="#about"
      aria-label="Scroll to about section"
      onMouseEnter={scramble}
      className="group absolute inset-x-0 bottom-10 hidden sm:flex flex-col items-center gap-3"
    >
      <span
        aria-hidden="true"
        className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-secondary/70 transition-colors duration-300 group-hover:text-[#00cea8]"
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

const Hero = () => {
  return (
    <section id="hero-section" className="relative w-full h-auto sm:h-screen mx-auto">
      <div className={`${styles.paddingX} relative pt-[120px] sm:pt-0 sm:absolute sm:inset-0 sm:top-[120px] max-w-7xl mx-auto flex flex-col justify-start pb-10 sm:pb-0`}>
        <div className="w-full max-w-3xl lg:max-w-4xl">
          {/* status badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00cea8] shadow-[0_0_10px_#00cea8] animate-[exp-pulse_1.8s_ease-in-out_infinite]" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-secondary">
              System: Online <span className="text-[#804dee]">//</span> Full-Stack Developer
            </span>
          </div>

          <h1 className={`${styles.heroHeadText} text-white`}>
            Architecting
            <br />
            <span className="bg-gradient-to-r from-[#bf61ff] via-[#7aa2f7] to-[#00cea8] bg-clip-text text-transparent">
              Scalable Futures.
            </span>
          </h1>

          {/* developer manifest */}
          <div className="mt-6 max-w-xl overflow-x-auto rounded-r-2xl border-l-2 border-[#915eff] bg-[#0d0920]/70 px-5 py-4 shadow-card backdrop-blur-sm sm:px-6 sm:py-5">
            <pre className="font-mono text-[11px] leading-[1.9] text-secondary sm:text-[13px]">
              <code>
                <span className="text-[#bf61ff]">const</span>{" "}
                <span className="font-semibold text-[#7aa2f7]">developer</span> = {"{"}
                {"\n  "}
                <span className="text-white-100">name</span>:{" "}
                <span className="font-semibold text-[#00cea8]">&quot;Jashan&quot;</span>,
                {"\n  "}
                <span className="text-white-100">role</span>:{" "}
                <span className="font-semibold text-[#00cea8]">&quot;Full-Stack Developer&quot;</span>,
                {"\n  "}
                <span className="text-white-100">focus</span>: [
                <span className="font-semibold text-[#00cea8]">&quot;React&quot;</span>,{" "}
                <span className="font-semibold text-[#00cea8]">&quot;Node.js&quot;</span>,{" "}
                <span className="font-semibold text-[#00cea8]">&quot;UX&quot;</span>],
                {"\n  "}
                <span className="text-white-100">mission</span>:{" "}
                <span className="font-semibold text-[#00cea8]">
                  &quot;Build intuitive, scalable apps.&quot;
                </span>
                {"\n"}
                {"};"}
              </code>
            </pre>
          </div>

          {/* calls to action */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#work"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#804dee] to-[#bf61ff] px-6 py-3 text-[15px] font-bold text-white shadow-[0_10px_30px_-14px_rgba(128,77,238,0.9)] transition-shadow duration-300 hover:shadow-[0_14px_36px_-12px_rgba(191,97,255,0.95)]"
            >
              Explore Codebase
              <ArrowIcon />
            </a>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <ScrollCue />

      {/*<div className="absolute inset-x-0 bottom-0 w-full h-[350px] sm:h-full">
        <Suspense fallback={null}>
          <ComputersCanvas />
        </Suspense>
      </div>*/}
    </section>
  );
};

export default Hero;
