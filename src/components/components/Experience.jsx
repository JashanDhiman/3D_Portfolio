import React from "react";
import "react-vertical-timeline-component/style.min.css";
import { styles } from "../../styles";
import { experiences } from "../../constants";
import SectionWrapper from "../../hoc/SectionWrapper";
import { textVariant } from "../../utils/motion";
import { motion } from "framer-motion";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";

const MONTH_INDEX = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const PRESENT = /^(present|current|now|ongoing|today)$/i;

const parseMoment = (value = "") => {
  const trimmed = value.trim();
  if (PRESENT.test(trimmed)) {
    return { date: new Date(), label: "Present", present: true };
  }

  const match = trimmed.match(/^([a-z]+)\.?\s+(\d{4})$/i);
  const month = match ? MONTH_INDEX[match[1].slice(0, 3).toLowerCase()] : undefined;
  if (month === undefined) return null;

  const short = match[1].slice(0, 3);
  const label = `${short[0].toUpperCase()}${short.slice(1).toLowerCase()} ${match[2]}`;
  return { date: new Date(Number(match[2]), month, 1), label, present: false };
};

const formatSpan = (months) => {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (rest) parts.push(`${rest} mo${rest > 1 ? "s" : ""}`);
  return parts.join(" ") || "1 mo";
};

// "feb 2022 - nov 2022" -> { range: "Feb 2022 — Nov 2022", duration: "10 mos" }
const describeTenure = (raw = "") => {
  const [rawStart, rawEnd] = raw.split(/\s*[-–—]\s*/);
  const start = parseMoment(rawStart);
  const end = parseMoment(rawEnd);
  const fallback = { range: raw, duration: null, present: PRESENT.test((rawEnd || "").trim()) };
  if (!start || !end) return fallback;

  const months =
    (end.date.getFullYear() - start.date.getFullYear()) * 12 +
    (end.date.getMonth() - start.date.getMonth()) +
    1;

  return {
    range: `${start.label} — ${end.label}`,
    duration: months > 0 ? formatSpan(months) : null,
    present: end.present,
  };
};

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-3.5 w-3.5 shrink-0">
    <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-3.5 w-3.5 shrink-0">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 7v5.2l3.2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ExperienceCard = ({ experience }) => {
  const { range, duration, present } = describeTenure(experience.date);
  const accent = present ? "#00cea8" : "#bf61ff";

  return (
    <VerticalTimelineElement
      contentStyle={{
        background: "transparent",
        boxShadow: "none",
        border: "none",
        padding: 0,
      }}
      contentArrowStyle={{ borderRight: "10px solid rgba(128, 77, 238, 0.45)" }}
      date={
        <span className="inline-flex items-center gap-2">
          <span className="text-[13px] font-bold tracking-[0.14em] text-white-100">{range}</span>
          {duration && (
            <span className="text-[11px] font-semibold tracking-[0.14em] text-secondary/80">
              · {duration}
            </span>
          )}
        </span>
      }
      dateClassName="!opacity-100 !py-2 max-[1169px]:!hidden"
      iconStyle={{
        background: `linear-gradient(150deg, ${experience.iconBg} 0%, #0d0920 100%)`,
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: `0 0 0 4px rgba(128,77,238,0.14), 0 0 26px -4px ${accent}`,
      }}
      icon={
        <div className="flex h-full w-full items-center justify-center rounded-full">
          <img
            src={experience.icon}
            alt={experience.company_name}
            className="h-[72%] w-[72%] object-contain"
          />
        </div>
      }
    >
      <div className="group relative rounded-[26px] bg-[linear-gradient(120deg,rgba(0,206,168,0.5),rgba(128,77,238,0.55),rgba(191,97,255,0.3),rgba(0,206,168,0.5))] bg-[length:220%_220%] p-px shadow-[0_8px_24px_-16px_rgba(128,77,238,0.75)] transition-shadow duration-500 hover:animate-[exp-border-flow_5s_linear_infinite] hover:shadow-[0_12px_30px_-16px_rgba(128,77,238,0.9)]">
        <div className="relative overflow-hidden rounded-[25px] bg-[#0d0920] px-6 py-7 transition-transform duration-500 sm:px-7">
          {/* ambient corner glow */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-52 w-52 rounded-full opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: `${accent}33` }}
          />

          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="text-[22px] font-black leading-tight text-white sm:text-[25px]">
                {experience.title}
              </h3>
              {present && (
                <span className="flex items-center gap-1.5 rounded-full border border-[#00cea8]/40 bg-[#00cea8]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#00cea8]">
                  <span className="h-1.5 w-1.5 animate-[exp-pulse_1.8s_ease-in-out_infinite] rounded-full bg-[#00cea8] shadow-[0_0_10px_#00cea8]" />
                  Current
                </span>
              )}
            </div>

            <p className="mt-1.5 bg-gradient-to-r from-[#00cea8] via-[#7aa2f7] to-[#bf61ff] bg-clip-text text-[15px] font-bold tracking-wide text-transparent">
              {experience.company_name}
            </p>

            {/* 1170px is react-vertical-timeline's own breakpoint: below it the
                side date is hidden, so the meta row carries the dates instead. */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary min-[1170px]:hidden">
              <span className="flex items-center gap-1.5">
                <CalendarIcon />
                {range}
              </span>
              {duration && (
                <span className="flex items-center gap-1.5">
                  <ClockIcon />
                  {duration}
                </span>
              )}
            </div>

            <div className="my-5 h-px bg-gradient-to-r from-[#804dee]/60 via-white/10 to-transparent" />

            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary/70">
              Key contributions
            </p>

            <ul className="mt-3.5 space-y-3">
              {experience.points.map((point, index) => (
                <li
                  key={`experience-point-${index}`}
                  className="flex gap-3 text-[14px] leading-relaxed tracking-wide text-white-100/90"
                >
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 rounded-[2px] bg-gradient-to-br from-[#00cea8] to-[#bf61ff]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {experience.technologies?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {experience.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold tracking-wide text-secondary transition-colors duration-300 hover:border-[#804dee]/50 hover:bg-[#804dee]/15 hover:text-white"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </VerticalTimelineElement>
  );
};

const Experience = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>What I have done so far</p>
        <h2 className={styles.sectionHeadText}>Work Experience.</h2>
      </motion.div>
      <div className="mt-20 flex flex-col">
        <VerticalTimeline>
          {experiences.map((experience, index) => (
            <ExperienceCard key={index} experience={experience} />
          ))}
        </VerticalTimeline>
      </div>
    </>
  );
};

export default SectionWrapper(Experience, "work");
