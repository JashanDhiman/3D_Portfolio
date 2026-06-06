import { useRef, useState } from "react";
import * as random from "maath/random/dist/maath-random.esm";
import { useFrame } from "@react-three/fiber";
import { PointMaterial, Points } from "@react-three/drei";

// Rendered into the shared background scene by SceneCanvas. The standalone
// StarsCanvas wrapper that used to live here was unreachable — it carried its own
// <Canvas>, preserveDrawingBuffer and <Preload all /> into the three.js chunk for
// nothing.
export const Stars = (props) => {
 const ref = useRef();
 const [sphere] = useState(() => random.inSphere(new Float32Array(5001), { radius: 50 }));

 useFrame((state, delta) => {
  // Rotating in the same direction as Earth (Y-axis)
  ref.current.rotation.y += delta / 20;
 });

 return (
  <group rotation={[0, 0, (23.5 * Math.PI) / 180]}>
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
