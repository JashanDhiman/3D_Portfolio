// Where to reach me. Every consumer skips entries that are null, so an unknown
// value degrades to "link absent" rather than "link broken" — a dead link on a
// page a recruiter is skimming is worse than no link at all.
//
// github and email are taken from this repository. The two nulls need your real
// URLs; fill them in and they appear in the hero and the footer automatically.
export const social = {
  github: "https://github.com/JashanDhiman",
  email: "jashandhiman.hulk@gmail.com",

  // TODO: e.g. "https://www.linkedin.com/in/your-handle"
  linkedin: "https://www.linkedin.com/in/jashan-dhiman-07aa3820b/",

  // TODO: drop the PDF in public/ and point at it, e.g. "/jashan-dhiman-resume.pdf"
  resumeUrl: "https://drive.google.com/file/d/1phOPbfd9a7mZf2i7BEk9z51ATWEjWhPD/view?usp=sharing",
};

// Shown next to the hero links when set, e.g. "Mohali, India · open to remote".
export const availability = null;
