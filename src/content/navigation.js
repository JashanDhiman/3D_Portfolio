// Deliberately its own module, separate from constants/index.js.
//
// constants/index.js imports every image asset and carries every project and experience
// string. The navbar and footer are both eagerly rendered, so importing navLinks from
// there dragged that whole graph into the entry chunk — about 23 KB a first-paint bundle
// has no use for. Keeping the nav data asset-free means the eager path pays for the nav
// data and nothing else.
//
// Every id here must match a SectionWrapper id in src/components/.
export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "projects",
    title: "Projects",
  },
  {
    id: "notes",
    title: "Notes",
  },
  {
    id: "experience",
    title: "Experience",
  },
  {
    id: "contact",
    title: "Contact",
  },
];
