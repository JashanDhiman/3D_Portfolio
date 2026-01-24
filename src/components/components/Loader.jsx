import { Html, useProgress } from "@react-three/drei";
import React from "react";

const Loader = () => {
 const { progress } = useProgress();
 return (
  <Html>
   <span className="canvas-loader"></span>
   <p
    style={{
     fontSize: 14,
     color: "#f1f1f1",
     fontWeight: 800,
     marginTop: 40,
    }}
   >
    {progress.toFixed(2)}%
   </p>
  </Html>
 );
};

export default Loader;
