//import React, { Suspense, lazy } from "react";
import { styles } from "../../styles";

//const ComputersCanvas = lazy(() => import("./canvas/Computers"));

const Hero = () => {
  return (
    <section className="relative w-full h-auto sm:h-screen mx-auto">
      <div className={`${styles.paddingX} relative pt-[120px] sm:pt-0 sm:absolute sm:inset-0 sm:top-[120px] max-w-7xl mx-auto flex flex-row items-start gap-5 pb-10 sm:pb-0`}>
        <div className="flex flex-col justify-center items-center mt-5">
          <div className="w-5 h-5 rounded-full bg-[#915eff]" />
          <div className="w-1 sm:h-80 h-40 violet-gradient" />
        </div>
        <div>
          <h1 className={`${styles.heroHeadText} text-white`}>
            Hi, I'm <span className="text-[#915eff]">Jashan</span>
          </h1>
          <p className={`${styles.heroSubText} mt-2 text-white-100`}>
            I build intuitive, scalable web applications <br className="sm:block hidden" /> with React and Node Js.
          </p>
        </div>
      </div>
      {/*<div className="absolute inset-x-0 bottom-0 w-full h-[350px] sm:h-full">
        <Suspense fallback={null}>
          <ComputersCanvas />
        </Suspense>
      </div>*/}
    </section>
  );
};

export default Hero;
