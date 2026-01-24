import React, { Suspense, lazy } from "react";
const BallCanvas = lazy(() => import("./canvas/Ball"));
import SectionWrapper from "../../hoc/SectionWrapper";
import { technologies } from "../../constants";

const Tech = () => {
 return (
  <div className="flex flex-row flex-wrap justify-center gap-10">
   {technologies.map((tech) => (
    <div className="w-28 h-28 flex flex-col items-center" key={tech.name}>
     <Suspense fallback={null}>
      <BallCanvas icon={tech.icon} />
     </Suspense>
     <p className="text-white text-[12px] mt-2 text-center">{tech.name}</p>
    </div>
   ))}
  </div>
 );
};

export default SectionWrapper(Tech, "tech");
