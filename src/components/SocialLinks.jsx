import { social } from "../content/social";

// Inline SVG rather than image files: these render at 16px, inherit currentColor
// for hover states, and cost no extra requests.
const GithubIcon = () => (
 <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4 shrink-0">
  <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
 </svg>
);

const LinkedinIcon = () => (
 <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4 shrink-0">
  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
 </svg>
);

const MailIcon = () => (
 <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
  <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
  <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
 </svg>
);

const ResumeIcon = () => (
 <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  <path d="M14 3v5h5M8.5 13h7M8.5 16.5h4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
 </svg>
);

// Nulls in `social` are dropped here, so an unset LinkedIn or resume simply does
// not render instead of shipping a link to nowhere.
const buildLinks = () =>
 [
  social.github && {
   key: "github",
   href: social.github,
   label: "GitHub",
   Icon: GithubIcon,
   external: true,
  },
  social.linkedin && {
   key: "linkedin",
   href: social.linkedin,
   label: "LinkedIn",
   Icon: LinkedinIcon,
   external: true,
  },
  social.email && {
   key: "email",
   href: `mailto:${social.email}`,
   label: "Email",
   Icon: MailIcon,
   external: false,
  },
  social.resumeUrl && {
   key: "resume",
   href: social.resumeUrl,
   label: "Resume",
   Icon: ResumeIcon,
   external: true,
  },
 ].filter(Boolean);

const VARIANTS = {
 hero: "gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[13px] font-semibold text-white-100 hover:border-[#804dee]/50 hover:bg-[#804dee]/15 hover:text-white",
 footer: "gap-2 text-[13px] font-semibold text-secondary hover:text-white",
};

const SocialLinks = ({ variant = "hero", className = "" }) => {
 const links = buildLinks();
 if (!links.length) return null;

 return (
  <ul className={`flex list-none flex-wrap items-center ${variant === "hero" ? "gap-3" : "gap-x-6 gap-y-3"} ${className}`}>
   {links.map(({ key, href, label, Icon, external }) => (
    <li key={key}>
     <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      className={`inline-flex items-center transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee] ${VARIANTS[variant]}`}
     >
      <Icon />
      {label}
     </a>
    </li>
   ))}
  </ul>
 );
};

export default SocialLinks;
