import React, { Suspense, useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";
import { useScroll, useTransform } from "framer-motion";
import { Stars } from "./Stars";
import { Earth } from "./Earth";
import TechBalls from "./TechBalls";
import { setEarthTarget, clearEarthTarget } from "../../../utils/earthTarget";

const AnimatedEarth = ({ x, scale }) => {
  const groupRef = useRef();
  const { camera, size } = useThree();
  // radius of the model at scale 1, measured once the gltf has loaded
  const unitRadius = useRef(0);
  const center = useRef(new THREE.Vector3());
  const edge = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());

  useEffect(() => clearEarthTarget, []);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    group.position.x = x.get();
    const s = scale.get();
    group.scale.set(s, s, s);

    if (!unitRadius.current && group.children.length && s) {
      const sphere = new THREE.Box3()
        .setFromObject(group)
        .getBoundingSphere(new THREE.Sphere());
      if (sphere.radius > 0) unitRadius.current = sphere.radius / s;
    }
    if (!unitRadius.current) return;

    // Project the centre and one edge point so overlays get both position and
    // on-screen radius in CSS pixels (the canvas is fixed inset-0, so canvas
    // pixels and viewport coordinates are the same thing).
    group.getWorldPosition(center.current);
    right.current.setFromMatrixColumn(camera.matrixWorld, 0);
    edge.current
      .copy(center.current)
      .addScaledVector(right.current, unitRadius.current * s);

    center.current.project(camera);
    edge.current.project(camera);

    const cx = (center.current.x * 0.5 + 0.5) * size.width;
    const cy = (-center.current.y * 0.5 + 0.5) * size.height;
    const ex = (edge.current.x * 0.5 + 0.5) * size.width;
    const ey = (-edge.current.y * 0.5 + 0.5) * size.height;

    setEarthTarget(cx, cy, Math.hypot(ex - cx, ey - cy));
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
  // 0.1: About section - Scale Down
  // 0.9: Feedbacks section - Scale Down
  // 1: Contact (Bottom) - Right, Scale Up
  const earthX = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [isMobile ? 0 : 7, 0, 0, isMobile ? 0 : 7]);
  const earthScale = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [isMobile ? 0.6 : 1, isMobile ? 0.4 : 0.6, isMobile ? 0.4 : 0.6, isMobile ? 0.6 : 1]);

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

          {/* Tech balls: orbit the Earth, dock onto the Tech grid as it scrolls in.
              Own Suspense boundary so the icon textures cannot blank the scene. */}
          <Suspense fallback={null}>
            <TechBalls x={earthX} scale={earthScale} />
          </Suspense>

          <OrbitControls
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          // Manual rotation is handled in Earth/Stars components
          />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
};

export default SceneCanvas;
