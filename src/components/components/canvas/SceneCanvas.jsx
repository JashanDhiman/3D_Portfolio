import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";
import { useScroll, useTransform } from "framer-motion";
import { Stars } from "./Stars";
import { Earth } from "./Earth";

const AnimatedEarth = ({ x, scale }) => {
  const groupRef = useRef();
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = x.get();
      const s = scale.get();
      groupRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={groupRef}>
      <Earth />
    </group>
  );
};

const SceneCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 500px)");
    setIsMobile(mediaQuery.matches);
    const handleMediaQueryChange = (event) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  const { scrollYProgress } = useScroll();

  // Scroll mapping
  // 0: Hero (Top) - Right
  // 0.4: Middle (About/Experience) - Center, Scale Down
  // 0.8: Projects/Feedbacks - Center, Scale Down
  // 1: Contact (Bottom) - Right, Scale Up
  const earthX = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [isMobile ? 0 : 3.5, 0, 0, isMobile ? 0 : 3.5]);
  const earthScale = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [1, 0.6, 0.6, 1]);

  return (
    <div className="w-full h-full fixed inset-0 z-[-1] bg-primary pointer-events-none">
      <Canvas
        shadows
        frameloop="always"
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [0, 0, 15],
        }}
        aria-label="3D background with stars and earth"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          
          {/* Stars background */}
          <Stars />

          {/* Floating Earth model */}
          <AnimatedEarth x={earthX} scale={earthScale} />
          
          <OrbitControls 
            enableZoom={false} 
            maxPolarAngle={Math.PI / 2} 
            minPolarAngle={Math.PI / 2} 
            autoRotate
          />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
};

export default SceneCanvas;
