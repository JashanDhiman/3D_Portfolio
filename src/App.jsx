import React, { Suspense, lazy } from "react";
import { BrowserRouter } from "react-router-dom";
const About = lazy(() => import("./components/components/About"));
const StarsCanvas = lazy(() => import("./components/components/canvas/Stars"));
const Contact = lazy(() => import("./components/components/Contact"));
const Experience = lazy(() => import("./components/components/Experience"));
const Feedbacks = lazy(() => import("./components/components/Feedbacks"));
import Hero from "./components/components/Hero";
import Navbar from "./components/components/Navbar";
const Tech = lazy(() => import("./components/components/Tech"));
const Works = lazy(() => import("./components/components/Works"));
import { ToastProvider, useToast } from "./components/toast/ToastContext";
import { registerToast } from "./components/toast/toast";

function ToastRegistrar() {
 const { showToast } = useToast();
 registerToast(showToast);
 return null;
}

const App = () => {
 return (
  <BrowserRouter>
   <ToastProvider>
    <ToastRegistrar />
    <div className="relative z-0 bg-primary">
     <div className="bg-hero-pattern bg-cover bg-no-repeat bg-center">
      <Navbar />
      <Hero />
     </div>
      <Suspense fallback={null}>
        <About />
        <Experience />
        <Tech />
        <Works />
        <Feedbacks />
      </Suspense>
      <div className="realative z-0">
        <Suspense fallback={null}>
          <Contact />
          <StarsCanvas />
        </Suspense>
      </div>
    </div>
   </ToastProvider>
  </BrowserRouter>
 );
};

export default App;
