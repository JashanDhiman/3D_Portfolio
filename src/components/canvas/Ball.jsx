import { Decal } from "@react-three/drei";

// Subdivision level, not a magic number. Because the material is flatShaded, this
// directly controls facet size, so it is a visual knob as much as a perf one:
//   detail 4 = 5120 tris/ball — smooth, and what this used to be
//   detail 3 = 1280 tris/ball — facets land under ~2px at the docked size (112px),
//              i.e. no perceptible difference, at a quarter of the geometry
//   detail 2 =  320 tris/ball — visibly faceted; a design choice, not a free win
// Thirteen balls render every frame, so the multiplier here is 13x whatever it costs.
//
// This also gates a startup cost that is easy to miss: drei's Decal builds its
// geometry by clipping every parent triangle against the decal box, on the main
// thread, once per ball. At detail 4 that was 13 x 5120 triangles of clipping.
const DETAIL = 3;

// The icosahedron + projected icon decal. Scale is left to the caller, which sizes
// each ball to match its DOM slot in the Tech grid.
//
// The standalone ballCanvas wrapper that used to live here was unreachable — nothing
// imported it, and it pulled its own <Canvas>, OrbitControls, preserveDrawingBuffer
// and <Preload all /> into the three.js chunk.
export const BallMesh = ({ decal, scale = 2.75 }) => (
 <mesh castShadow={false} receiveShadow={false} scale={scale}>
  <icosahedronGeometry args={[1, DETAIL]} />
  <meshStandardMaterial color={"#fff8eb"} polygonOffset polygonOffsetFactor={-5} flatShading />
  <Decal map={decal} position={[0, 0, 1]} rotation={[2 * Math.PI, 0, 6.25]} flatShading />
 </mesh>
);
