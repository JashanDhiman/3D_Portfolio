import { styles } from "../styles";
import { navLinks } from "../content/navigation";
import SocialLinks from "./SocialLinks";

// The page previously just stopped after the contact form, leaving no terminal
// landing point and no way out except scrolling back up.
const Footer = () => (
 <footer className={`${styles.paddingX} relative z-0 border-t border-white/[0.07] py-10`}>
  <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
   <div>
    <p className="text-[15px] font-bold text-white">Jashan Dhiman</p>
    <p className="mt-1 text-[13px] text-secondary">
     Full-Stack Developer — React, Node.js, healthcare platforms
    </p>
    <SocialLinks variant="footer" className="mt-5" />
   </div>

   <nav aria-label="Footer">
    <ul className="flex list-none flex-wrap gap-x-6 gap-y-2">
     {navLinks.map((link) => (
      <li key={link.id}>
       <a
        href={`#${link.id}`}
        className="text-[13px] font-medium text-secondary transition-colors duration-300 hover:text-white"
       >
        {link.title}
       </a>
      </li>
     ))}
    </ul>
   </nav>
  </div>

  <p className="mx-auto mt-10 max-w-7xl text-[11px] text-secondary/80">
   Built with React, Three.js and Vite. Source on{" "}
   <a
    href="https://github.com/JashanDhiman/3D_Portfolio"
    target="_blank"
    rel="noreferrer noopener"
    className="underline decoration-white/20 underline-offset-2 transition-colors hover:text-white"
   >
    GitHub
   </a>
   .
  </p>
 </footer>
);

export default Footer;
