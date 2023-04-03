import { Decal, Float, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { Suspense } from "react";
import CanvasLoader from "../Loader";
import { OrbitControls, Preload } from "@react-three/drei";

const Ball = ({ imageUrl }) => {
 const [decal] = useTexture([imageUrl]);

 return (
  <Float speed={1.75} rotationIntensity={1} floatIntensity={2}>
   <ambientLight intensity={0.25} />
   <directionalLight position={[0, 0, 0.25]} />
   <mesh castShadow receiveShadow scale={2.75}>
    <icosahedronGeometry args={[1, 10]} />
    <meshStandardMaterial color={"#fff8eb"} polygonOffset polygonOffsetFactor={-5} floatShading />
    <Decal map={decal} position={[0, 0, 1]} rotation={[2 * Math.PI, 0, 6.25]} flatShading />
   </mesh>
  </Float>
 );
};

const ballCanvas = ({ icon }) => {
 return (
  <Canvas frameloop="demand" dpr={[1, 2]} gl={{ preserveDrawingBuffer: true }}>
   <Suspense fallback={<CanvasLoader />}>
    <OrbitControls enableZoom={false} />
    <Ball imageUrl={icon} />
   </Suspense>

   <Preload all />
  </Canvas>
 );
};

export default ballCanvas;
