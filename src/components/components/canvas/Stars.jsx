import React, { useRef, useState, Suspense } from "react";
import * as random from "maath/random/dist/maath-random.esm";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial, Points, Preload } from "@react-three/drei";

export const Stars = (props) => {
  const ref = useRef();
  const [sphere] = useState(() => random.inSphere(new Float32Array(5001), { radius: 50 }));

  useFrame((state, delta) => {
    // Rotating in the same direction as Earth (Y-axis)
    // Removed chaotic X-axis rotation for a steadier background
    ref.current.rotation.y += delta / 20;
  });

  return (
    <group rotation={[0, 0, 23.5 * Math.PI / 180]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled {...props}>
        <PointMaterial
          transparent
          color="#f273c8"
          size={0.1}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const StarsCanvas = () => {
  return (
    <div className='w-full h-full fixed inset-0 z-[-1] bg-primary pointer-events-none'>
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Suspense fallback={null}>
          <Stars />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
};

export default StarsCanvas;
