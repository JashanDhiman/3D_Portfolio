import { Decal, Float, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { Suspense } from "react";
import CanvasLoader from "../Loader";
import { OrbitControls, Preload } from "@react-three/drei";

// The icosahedron + projected icon decal on its own, so the tech balls living in
// the persistent background scene render identically to this standalone canvas.
// Scale is left to the caller there, which sizes balls to match the DOM grid.
export const BallMesh = ({ decal, scale = 2.75 }) => (
 <mesh castShadow={false} receiveShadow={false} scale={scale}>
  <icosahedronGeometry args={[1, 4]} />
  <meshStandardMaterial color={"#fff8eb"} polygonOffset polygonOffsetFactor={-5} flatShading />
  <Decal map={decal} position={[0, 0, 1]} rotation={[2 * Math.PI, 0, 6.25]} flatShading />
 </mesh>
);

const Ball = ({ imageUrl }) => {
 const [decal] = useTexture([imageUrl]);

 return (
  <Float speed={1.75} rotationIntensity={1} floatIntensity={2}>
   <ambientLight intensity={0.25} />
   <directionalLight position={[0, 0, 0.05]} />
   <BallMesh decal={decal} />
  </Float>
 );
};

const ballCanvas = ({ icon }) => {
 return (
  <Canvas
   frameloop="demand"
   dpr={[1, 2]}
   gl={{ preserveDrawingBuffer: true, powerPreference: "high-performance" }}
   aria-label="3D skill icon ball"
   role="img"
  >
   <Suspense fallback={<CanvasLoader />}>
    <OrbitControls enableZoom={false} />
    <Ball imageUrl={icon} />
   </Suspense>

   <Preload all />
  </Canvas>
 );
};

export default ballCanvas;
