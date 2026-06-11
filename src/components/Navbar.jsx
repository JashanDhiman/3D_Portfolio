import { useEffect, useState } from "react";
import { styles } from "../styles";
import { navLinks } from "../content/navigation";
import { logo, menu, close } from "../assets";

const linkClass =
 "rounded transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22d3ee]";

const Navbar = () => {
 const [active, setActive] = useState("");
 const [toggle, setToggle] = useState(false);

 // A disclosure that can be opened by keyboard should be closeable by keyboard.
 useEffect(() => {
  if (!toggle) return undefined;
  const onKeyDown = (e) => {
   if (e.key === "Escape") setToggle(false);
  };
  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
 }, [toggle]);

 return (
  // <header> gives the page a banner landmark, and the nav gets a name so screen-reader
  // users can tell it apart from the footer's navigation in a landmark list.
  <header className={`${styles.paddingX} w-full flex items-center py-5 fixed top-0 z-20 bg-primary`}>
   <nav aria-label="Main" className="w-full flex justify-between items-center max-w-7xl mx-auto">
    {/* Was a react-router <Link to="">, which existed only to run scrollTo(0,0) —
        the app has no routes. A plain anchor to the hero does the same thing, works
        with JavaScript disabled, and let react-router-dom leave the bundle. */}
    <a
     href="#hero-section"
     className={`flex items-center gap-2 ${linkClass}`}
     onClick={() => setActive("")}
     aria-label="Back to top"
    >
     {/* Above the fold, so eager — but it is a 2 KB 72px WebP now rather than the
         1.46 MB 1024px PNG that used to sit in the critical path. */}
     <img src={logo} alt="Jashan Dhiman" width={36} height={36} decoding="async" className="w-9 h-9 object-contain" />
    </a>

    <ul className="list-none hidden sm:flex flex-row gap-8">
     {navLinks.map((link) => (
      <li key={link.id} className="text-[18px] font-medium">
       {/* onClick belongs on the anchor, not the <li>. On the list item it only fired
           because a click bubbled up from the link, which meant it depended on the
           thing it was meant to be handling. */}
       <a
        href={`#${link.id}`}
        onClick={() => setActive(link.title)}
        aria-current={active === link.title ? "true" : undefined}
        className={`${active === link.title ? "text-white" : "text-secondary"} ${linkClass}`}
       >
        {link.title}
       </a>
      </li>
     ))}
    </ul>

    <div className="sm:hidden flex flex-1 justify-end items-center">
     {/* Was an <img onClick>: not focusable, not operable by keyboard, and
         aria-expanded is not valid on an image. A real button fixes all three. */}
     <button
      type="button"
      onClick={() => setToggle(!toggle)}
      aria-label={toggle ? "Close menu" : "Open menu"}
      aria-expanded={toggle}
      aria-controls="mobile-nav"
      className="flex h-[28px] w-[28px] items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22d3ee]"
     >
      <img src={toggle ? close : menu} alt="" width={28} height={28} className="w-[28px] h-[28px] object-contain" />
     </button>

     <div
      id="mobile-nav"
      className={`${!toggle ? "hidden" : "flex"} p-6 black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[160px] z-10 rounded-xl`}
     >
      <ul className="list-none flex justify-end items-start flex-col gap-4">
       {navLinks.map((link) => (
        <li key={link.id} className="font-poppins font-medium text-[16px]">
         <a
          href={`#${link.id}`}
          onClick={() => {
           setToggle(false);
           setActive(link.title);
          }}
          aria-current={active === link.title ? "true" : undefined}
          className={`${active === link.title ? "text-white" : "text-secondary"} ${linkClass}`}
         >
          {link.title}
         </a>
        </li>
       ))}
      </ul>
     </div>
    </div>
   </nav>
  </header>
 );
};

export default Navbar;
