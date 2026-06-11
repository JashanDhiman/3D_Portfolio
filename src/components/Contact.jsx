import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import SectionWrapper from "../hoc/SectionWrapper";
import { slideIn } from "../utils/motion";
import emailjs from "@emailjs/browser";
import { toast } from "./toast/toast";
import { isValidEmail } from "../utils/extra";
import SendIcon from "./SendIcon";
import PlaneFlight from "./PlaneFlight";

const labelClass =
 "mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-secondary/80";

const fieldClass =
 "w-full rounded-lg border border-white/[0.07] bg-[#1b1b2b] px-4 py-3.5 text-[14px] font-medium text-white placeholder:text-secondary/70 outline-none transition-all duration-300 focus:border-[#22d3ee]/60 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]";

// Reduced-motion path only: how long "Transmitted" holds before the button rearms.
// The animated path rearms when the plane finishes its run instead.
const RESET_DELAY = 2200;
// Backstop in case rAF never completes (e.g. the tab is hidden mid-flight).
// Must stay comfortably above PlaneFlight's own run time.
const FLIGHT_TIMEOUT = 7000;

const BUTTON_LABEL = {
 idle: "Execute_Send",
 sending: "Transmitting...",
 sent: "Transmitted",
};

const Contact = () => {
 const formRef = useRef();
 const iconRef = useRef();
 const resetTimer = useRef();
 const [form, setFrom] = useState({
  name: "",
  email: "",
  message: "",
 });
 // idle -> sending -> sent -> idle
 const [status, setStatus] = useState("idle");
 // screen coords the plane launches from, set once the send succeeds
 const [flight, setFlight] = useState(null);
 const reduceMotion = useReducedMotion();
 const loading = status === "sending";

 useEffect(() => () => clearTimeout(resetTimer.current), []);

 const handleChange = (e) => {
  const { value, name } = e.target;
  setFrom({ ...form, [name]: value });
 };

 const finishFlight = () => {
  clearTimeout(resetTimer.current);
  setFlight(null);
  setStatus("idle");
 };

 const handleSubmit = (e) => {
  e.preventDefault();
  if (status !== "idle") return;
  if (!form.name || !form.email || !form.message) {
   toast.error("Please fill in all fields");
   return;
  }
  if (!isValidEmail(form.email)) {
   toast.error("Please enter a valid email address");
   return;
  }

  setStatus("sending");
  emailjs
   .send(
    "service_vtxajoz",
    "template_gb9f9h2",
    {
     form_name: form.name,
     to_name: "Jashan Dhiman",
     from_email: form.email,
     to_email: "jashandhiman.hulk@gmail.com",
     message: form.message,
    },
    "E9ss36pzD78Bw-IJE"
   )
   .then(
    () => {
     // grab the icon's spot before React swaps it out, so the overlay plane
     // picks up exactly where the button's plane left off
     const rect = iconRef.current?.getBoundingClientRect();
     setStatus("sent");
     toast.success("Thank you, I will get back to you soon!");
     setFrom({
      name: "",
      email: "",
      message: "",
     });

     if (reduceMotion || !rect) {
      resetTimer.current = setTimeout(() => setStatus("idle"), RESET_DELAY);
      return;
     }
     setFlight({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
     resetTimer.current = setTimeout(finishFlight, FLIGHT_TIMEOUT);
    },
    (error) => {
     setStatus("idle");
     console.log(error);
     toast.error("something went wrong");
    }
   );
 };

 return (
  <div className="overflow-hidden">
   {flight && <PlaneFlight origin={flight} onDone={finishFlight} />}

   <motion.div variants={slideIn("left", "tween", 0.2, 1)} className="w-full max-w-[520px]">
    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[#804dee]">
     <span className="text-[#804dee]/60">/</span>
     Communication
    </p>
    <h3 className="mt-4 text-[42px] font-black leading-[1.08] text-white sm:text-[52px]">
     Initialize
     <span className="block text-[#22d3ee]">Connection</span>
    </h3>

    <form ref={formRef} onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
     <label className="block">
      <span className={labelClass}>User.Identification</span>
      <input
       type="text"
       name="name"
       value={form.name}
       onChange={handleChange}
       placeholder="John Doe"
       aria-label="Name"
       required
       className={fieldClass}
      />
     </label>

     <label className="block">
      <span className={labelClass}>User.Network_Address</span>
      <input
       type="email"
       name="email"
       value={form.email}
       onChange={handleChange}
       placeholder="john@example.com"
       aria-label="Email"
       required
       className={fieldClass}
      />
     </label>

     <label className="block">
      <span className={labelClass}>Payload.Content</span>
      <textarea
       rows={5}
       name="message"
       value={form.message}
       onChange={handleChange}
       placeholder="How can we collaborate?"
       aria-label="Message"
       required
       className={`${fieldClass} min-h-[120px] resize-y`}
      />
     </label>

     <button
      type="submit"
      disabled={status !== "idle"}
      aria-label="Send Message"
      aria-live="polite"
      className="group relative mt-2 flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-[#9b5cf6] via-[#6b46d4] to-[#2b1e5c] py-4 text-[13px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_12px_32px_-14px_rgba(128,77,238,0.9)] transition-all duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee] disabled:cursor-not-allowed disabled:hover:brightness-100"
     >
      {/* launch flash, clipped to the button */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
       <AnimatePresence>
        {status === "sent" && !reduceMotion && (
         <motion.span
          key="sweep"
          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          initial={{ x: "-120%" }}
          animate={{ x: "260%" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
         />
        )}
       </AnimatePresence>
      </span>

      <span className="relative">{BUTTON_LABEL[status]}</span>

      {/* fixed-size slot: keeps the button from reflowing once the plane leaves,
          and hands its screen position to the overlay flight */}
      <span ref={iconRef} className="relative flex h-4 w-4 items-center justify-center">
       <AnimatePresence>
        {status !== "sent" && (
         <motion.span
          key="plane"
          className="absolute inset-0"
          initial={{ x: -24, opacity: 0 }}
          animate={
           loading && !reduceMotion ? { x: [0, 5, 0], opacity: 1 } : { x: 0, opacity: 1 }
          }
          transition={
           loading && !reduceMotion
            ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
            : { type: "spring", stiffness: 320, damping: 22 }
          }
          // the overlay plane takes over from here, so this one just blinks out
          exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.2 : 0 } }}
         >
          <span
           className={`block transition-transform duration-300 ${status === "idle" ? "group-hover:translate-x-1" : ""
            }`}
          >
           <SendIcon />
          </span>
         </motion.span>
        )}
       </AnimatePresence>
      </span>
     </button>
    </form>
   </motion.div>
  </div>
 );
};

export default SectionWrapper(Contact, "contact");
