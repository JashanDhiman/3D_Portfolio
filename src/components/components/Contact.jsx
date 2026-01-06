import React, { useRef, useState, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { styles } from "../../styles";
import SectionWrapper from "../../hoc/SectionWrapper";
import { slideIn } from "../../utils/motion";
// import EarthCanvas from "./canvas/Earth";
const EarthCanvas = lazy(() => import("./canvas/Earth"));
import emailjs from "@emailjs/browser";
import { toast } from "../toast/toast";
import { isValidEmail } from "../../utils/extra";

const Contact = () => {
 const formRef = useRef();
 const [form, setFrom] = useState({
  name: "",
  email: "",
  message: "",
 });
 const [loading, setLoading] = useState(false);

 const handleChange = (e) => {
  const { value, name } = e.target;
  setFrom({ ...form, [name]: value });
 };

 const handleSubmit = (e) => {
  e.preventDefault();
  if (!form.name || !form.email || !form.message) {
   toast.error("Please fill in all fields");
   return;
  }
  if (!isValidEmail(form.email)) {
   toast.error("Please enter a valid email address");
   return;
  }

  setLoading(true);
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
     setLoading(false);
     toast.success("Thank you, I will get back to you soon!");
     setFrom({
      name: "",
      email: "",
      message: "",
     });
    },
    (error) => {
     setLoading(false);
     console.log(error);
     toast.error("something went wrong");
    }
   );
 };

 return (
  <div className="xl:mt-12 xl:flex-row flex-col-reverse flex gap-10 overflow-hidden">
   <motion.div variants={slideIn("left", "tween", 0.2, 1)} className="flex-[0.75] bg-black-100 p-8 rounded-2xl">
    <p className={styles.sectionSubText}>Get in touch</p>
    <h3 className={styles.sectionHeadText}>Contact Me.</h3>
    <form ref={formRef} onSubmit={handleSubmit} className="mt-12 flex flex-col gap-8">
     <label className="flex flex-col">
      <span className="text-white font-medium mb-4">Your Name</span>
      <input
       type="text"
       name="name"
       value={form.name}
       onChange={handleChange}
       placeholder="What's your name?"
       aria-label="Name"
       required
       className=" bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outlined-none border-none font-medium"
      />
     </label>
     <label className="flex flex-col">
      <span className="text-white font-medium mb-4">Your Email</span>
      <input
       type="email"
       name="email"
       value={form.email}
       onChange={handleChange}
       placeholder="What's your email?"
       aria-label="Email"
       required
       className=" bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outlined-none border-none font-medium"
      />
     </label>
     <label className="flex flex-col">
      <span className="text-white font-medium mb-4">Your Message</span>
      <textarea
       rows={"7"}
       name="message"
       value={form.message}
       onChange={handleChange}
       placeholder="What do you want to say?"
       aria-label="Message"
       required
       className="h-40 bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outlined-none border-none font-medium resize-none"
      />
     </label>
     <button type="submit" className="bg-tertiary py-3 px-8 outline-none w-fit text-white font-bold shadow-md shadow-primary rounded-xl" aria-label="Send Message">
      {loading ? "Sending..." : "Send"}
     </button>
    </form>
   </motion.div>

   <motion.div variants={slideIn("right", "tween", 0.2, 1)} className="xl:flex-1 xl:h-auto md:h-[550px] h-[350px]">
    <Suspense fallback={null}>
     <EarthCanvas />
    </Suspense>
   </motion.div>
  </div>
 );
};

export default SectionWrapper(Contact, "contact");
