import { styles } from "../styles";
import SocialLinks from "./SocialLinks";

// The page previously just stopped after the contact form, leaving no terminal
// landing point and no way out except scrolling back up.
const Footer = () => (
 <footer className={`${styles.paddingX} relative z-0 border-t border-white/[0.07] py-6`}>
  <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
   <SocialLinks variant="footer" />

   <p className="text-[11px] text-secondary/80 sm:text-right">
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
  </div>
 </footer>
);

export default Footer;
