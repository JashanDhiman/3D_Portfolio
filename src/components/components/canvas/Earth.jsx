import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";

import Loader from "../Loader";

export const Earth = () => {
  const earth = useGLTF("./planet/scene.gltf");
  const earthRef = useRef();

  useFrame((state, delta) => {
    if (earthRef.current) {
      // Rotation on its tilted axis
      earthRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <primitive
      ref={earthRef}
      object={earth.scene}
      scale={4}
      position-y={0}
      rotation-z={23.5 * Math.PI / 180} // Axial tilt
    />
  );
};

const EarthCanvas = () => {
  return (
    <Canvas
      shadows
      frameloop='demand'
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [-4, 3, 6],
      }}
    >
      <Suspense fallback={<Loader />}>
        <OrbitControls
          autoRotate
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <Earth />

        <Preload all />
      </Suspense>
    </Canvas>
  );
};

export default EarthCanvas;
