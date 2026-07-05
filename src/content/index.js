import {
  creator,
  javascript,
  typescript,
  html,
  css,
  reactjs,
  redux,
  tailwind,
  nodejs,
  mongodb,
  postgres,
  git,
  figma,
  shopify,
  chatWebImg,
  cueblocks,
  smartdata,
  kegelKlockImg,
  soundHealerImg,
  memoriesTimelineImg,
  wellnessImg,
  tradingDashboardImg,
} from "../assets";

// navLinks lives in ./navigation.js — see the note there. This module pulls in
// every image asset, so anything eagerly rendered must not import from it.

const technologies = [
  {
    name: "HTML 5",
    icon: html,
  },
  {
    name: "CSS 3",
    icon: css,
  },
  {
    name: "JavaScript",
    icon: javascript,
  },
  {
    name: "TypeScript",
    icon: typescript,
  },
  {
    name: "React JS",
    icon: reactjs,
  },
  {
    name: "Redux Toolkit",
    icon: redux,
  },
  {
    name: "Tailwind CSS",
    icon: tailwind,
  },
  {
    name: "Node JS",
    icon: nodejs,
  },
  {
    name: "MongoDB",
    icon: mongodb,
  },
  {
    name: "Postgres",
    icon: postgres,
  },
  {
    name: "git",
    icon: git,
  },
  {
    name: "figma",
    icon: figma,
  },
  {
    name: "shopify",
    icon: shopify,
  },
];

const experiences = [
  {
    title: "Freelance Full Stack Developer",
    // TODO: swap for the real NirvanaSage logo once available (src/assets/company/)
    company_name: "NirvanaSage",
    icon: creator,
    iconBg: "#383E56",
    date: "sep 2020 - jan 2022",
    technologies: [
      "React",
      "Node.js",
      "Express",
      "Firebase",
      "Django",
      "Python",
      "Three.js",
      "GSAP",
    ],
    points: [
      "Built multiple applications for the healthcare and wellness industry, including a web platform for diet plans, fitness routines and meditation techniques.",
      "Developed a Sound Healing program that uses signal processing to generate therapeutic audio for patients with depression, anxiety and stress, reaching 80% accuracy in voice analysis.",
      "Built a 3D brain visualization with Three.js that turns diagnoses and treatment records into visual reports, letting doctors pinpoint problem areas with 60% accuracy.",
      "Improved UI/UX by 70% using AI-assisted design workflows, working directly with the founder to shape the product.",
    ],
    // Folded in from what used to be a standalone Testimonials section. One quote does
    // not carry a section of its own, but it carries a lot of weight sitting next to
    // the role it is about.
    testimonial: {
      quote:
        "A talented professional who turned a challenging sound application into reality. Special thanks to Jashan for his patience and consistent effort over two years of collaboration.",
      name: "Suneet Joshi",
      designation: "Founder, NirvanaSage",
    },
  },
  {
    title: "Web Developer",
    company_name: "Cue Blocks",
    icon: cueblocks,
    iconBg: "#383E56",
    date: "feb 2022 - nov 2022",
    technologies: [
      "React.js",
      "JavaScript",
      "Shopify Apps",
      "Responsive UI",
      "Cross-browser",
    ],
    points: [
      "Developed and maintained web applications using React.js and other related technologies.",
      "Implemented responsive design and ensured cross-browser compatibility.",
      "Together with my senior colleagues, I have successfully developed a customized Shopify app that aims to provide our customers with exceptional additional services and elevate their overall shopping experience.",
      "This app not only enhances existing projects but also offers a more productive, customized and efficient code to customer's Store.",
    ],
  },
  {
    title: "Senior Software Associate",
    company_name: "SmartData",
    icon: smartdata,
    iconBg: "#383E56",
    date: "nov 2022 - Present",
    technologies: [
      "React.js",
      "Node.js",
      "FHIR",
      "HIPAA",
      "PHI",
      "Code Review",
    ],
    points: [
      "Developing and maintaining Healthcare Platforms using React.js and nodeJS with taking-care of FHIR, HIPAA and PHI.",
      "Optimizing application for maximum speed and scalability.",
      "Developing Front-end with server-side logic.",
      "Collaborating with cross-functional teams including designers, project managers, and other developers to create high-quality Healthcare platforms.",
      "Participating in code reviews and providing constructive feedback to other developers.",
    ],
  },
];

// Cards lead with what the thing is and what was interesting about building it,
// rather than "Web-based platform that allows users to...".
//
// `highlights` is the part an interviewer reads, so everything in it is drawn from
// this repo — the old descriptions, the tech tags, and the experience bullets above.
// Nothing is inferred beyond that. Where a project has only one honest highlight it
// gets one; padding it out is how a portfolio starts sounding generated. Kegel Klock is
// the exception to "drawn from this repo": its highlights come from the live site.
//
// TODO (you, not me): the two cards marked `needsDepth` are the ones where only you
// know the interesting decision — a schema you would redo, a bug that took a week, why
// you picked Firebase over your own backend. Two sentences each turns them from
// screenshots into interview questions.
const projects = [
  {
    name: "Kegel Klock",
    featured: true,
    description:
      "A doctor-designed pelvic floor programme that runs the exercise session for you, a timer dashboard, daily reminders and audio coaching.",
    highlights: [
      "It has the programme steps over 1 to 12 weeks depending on severity, so each user gets their own schedule rather than one fixed plan.",
      "Installable PWA: a service worker and the Notifications API carry the 1-4 daily reminders. Stripe for subscriptions.",
    ],
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "pwa", color: "green-text-gradient" },
      { name: "stripe", color: "pink-text-gradient" },
    ],
    image: kegelKlockImg,
    link: "https://kegelklock.com/",
    source_code_link: null,
  },
  {
    name: "Sound Healer",
    featured: true,
    description:
      "Generates personalised therapeutic audio intended to help users shift their mental state.",
    highlights: [
      "Built for NirvanaSage over a two-year engagement, working directly with the founder.",
      "Signal processing generates the audio for depression, anxiety and stress; the voice-analysis step reached 80% accuracy.",
      "Per-user sound profiles driven through the browser Audio API over a REST backend.",
    ],
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "restapi", color: "green-text-gradient" },
      { name: "audioapi", color: "pink-text-gradient" },
    ],
    image: soundHealerImg,
    link: "https://joyful-soul-jd.netlify.app/login?email=test@yopmail.com&password=Test@123",
    source_code_link: null,
  },
  {
    name: "Memories Timeline",
    featured: true,
    description:
      "Upload a set of photos and revisit them as a scroll-driven journey — a boat sailing downriver past each memory.",
    highlights: [
      "The whole timeline is scroll-driven: GSAP maps scroll position onto the boat's path and onto when each memory reveals.",
      "Images are uploaded by the user through a REST API rather than bundled with the build.",
    ],
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "restapi", color: "green-text-gradient" },
      { name: "gsap", color: "pink-text-gradient" },
    ],
    image: memoriesTimelineImg,
    link: "https://memories-timeline.netlify.app/",
    source_code_link: "https://github.com/JashanDhiman/memories-timeline",
  },
  {
    name: "Trading Dashboard",
    featured: true,
    needsDepth: true,
    description:
      "Dashboard for tracking trading activity and reading market trends.",
    highlights: [
      "Implemented a gRPC-based data service using Protocol Buffers and HTTP/2, gaining hands-on experience with strongly typed contracts, efficient binary serialization, low-latency communication, and service-to-service communication.",    ],
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "firebase", color: "green-text-gradient" },
      { name: "tailwind", color: "pink-text-gradient" },
    ],
    image: tradingDashboardImg,
    link: "https://nubra-dashboard.vercel.app",
    source_code_link: "https://github.com/JashanDhiman/trading-dashboard",
  },
  {
    name: "Chat Web App",
    description:
      "Google sign-in, user-created rooms, and end-to-end encrypted messages.",
    highlights: [
      "Google OAuth for identity, so there are no passwords to store.",
      "End-to-end encrypted messages over a Firebase realtime backend.",
    ],
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "firebase", color: "green-text-gradient" },
      { name: "tailwind", color: "pink-text-gradient" },
    ],
    image: chatWebImg,
    link: "https://chat-web-app-36298.web.app/",
    source_code_link: "https://github.com/JashanDhiman/chat-app",
  },
  {
    name: "Wellness App",
    needsDepth: true,
    description:
      "Calculates fitness and diet metrics, and collects wellness material like yoga and exercise routines.",
    highlights: [
      "Server-rendered Django templates rather than a JavaScript frontend.",
    ],
    tags: [
      { name: "django", color: "blue-text-gradient" },
      { name: "html-css", color: "green-text-gradient" },
      { name: "templates", color: "pink-text-gradient" },
    ],
    image: wellnessImg,
    link: "https://jashandhiman.pythonanywhere.com/",
    source_code_link: "https://github.com/JashanDhiman/wellness_clone",
  },
];

export { technologies, experiences, projects };
