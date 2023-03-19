import { BrowserRouter } from "react-router-dom";
import About from "./components/components/About";
import Stars from "./components/components/canvas/Stars";
import Contact from "./components/components/Contact";
import Experience from "./components/components/Experience";
import Feedbacks from "./components/components/Feedbacks";
import Hero from "./components/components/Hero";
import Navbar from "./components/components/Navbar";
import Tech from "./components/components/Tech";
import Works from "./components/components/Works";

const App = () => {
 return (
  <BrowserRouter>
   <div className="relative z-0 bg-primary">
    <div className="bg-hero-pattern bg-cover bg-no-repeat bg-center">
     <Navbar />
     <Hero />
    </div>
    <About />
    <Experience />
    <Tech />
    <Works />
    <Feedbacks />
    <div className="realative z-0">
     <Contact />
     <Stars />
    </div>
   </div>
  </BrowserRouter>
 );
};

export default App;
