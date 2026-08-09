import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

// One .glb instead of the original .gltf + .bin + two 1024px PNGs. That was four
// requests on a dependency chain — the JSON had to parse before the browser could even
// discover the buffer and the textures — and 2.88 MB on the wire. Now it is a single
// 534 KB request: indices down to u16, attributes quantized, geometry meshopt-
// compressed, textures WebP, and the animation clip nothing ever played removed.
//
// Regenerate with:
//   gltf-transform optimize scene.gltf planet.glb --compress meshopt \
//     --texture-compress webp --simplify false \
//     --flatten false --join false --instance false --palette false
//
// simplify is off deliberately, and the numbers are why. At --simplify-error 0.0001 it
// removed 288 of 47,350 triangles — 0.6%, not worth having. Turning it up to 0.001 did
// cut them to 27.5k and the file to 420 KB, but this mesh is the wrong shape for
// decimation: the cloud layer is 34k of those triangles and it is thin-shell ribbon
// geometry, where essentially every triangle contributes to a silhouette edge rather
// than to the interior of a smooth surface. There is no redundancy to reclaim, so the
// 114 KB is being bought with the one thing the hero cannot spend, which is how the
// planet looks. Everything above this line is lossless by construction — quantization
// is a 16-bit encoding across the mesh bounds, so positional error is on the order of
// 0.003% of the model extent.
//
// The per-frame triangle savings were taken from the tech balls instead, where 13
// identical spheres were tessellated 4x finer than their on-screen size can show.
const MODEL = "./planet/planet.glb";

// Draco off, Meshopt on. Both compress this mesh comparably, but drei's Draco path
// fetches its decoder from a Google CDN at runtime, whereas the Meshopt decoder is
// already inside the three-stdlib bundle we have loaded — so Meshopt costs one fewer
// blocking request and no third-party dependency.
const LOADER_ARGS = [false, true];

export const Earth = () => {
  const earth = useGLTF(MODEL, ...LOADER_ARGS);
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
      rotation-z={(23.5 * Math.PI) / 180} // Axial tilt
    />
  );
};

// Starts the model fetch as soon as this module is evaluated, which is already behind
// the scene's idle gate — so it overlaps the download with the rest of scene setup
// rather than waiting for first render.
useGLTF.preload(MODEL, ...LOADER_ARGS);
