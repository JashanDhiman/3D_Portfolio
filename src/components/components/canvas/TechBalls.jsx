import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

import { technologies } from "../../../constants";
import { getTechSlots } from "../../../utils/techSlots";
import { BallMesh } from "./Ball";

// The tech balls live in the persistent background scene rather than in a canvas
// of their own, so they can travel between two homes:
//   - orbiting the Earth model whenever the Tech section is off screen
//   - docked onto the Tech grid, matching the DOM slots pixel for pixel
// Everything is driven from useFrame writing to object3D transforms; React state
// at 60fps would be wasteful, same reasoning as the Earth's screen projection.

const ICONS = technologies.map((tech) => tech.icon);

// World z the docked grid sits on. Comfortably in front of the Earth (centred on
// z=0) so docked balls read as overlaying the planet instead of intersecting it.
const DOCK_Z = 6;
// Radius of the Earth model at group scale 1 — the primitive is scale={4} over a
// roughly unit-radius gltf. Only used to size the orbit ring, so approximate is fine.
const EARTH_RADIUS = 4;
// Fraction of the progress ramp spent staggering arrivals, so balls land in
// sequence rather than all at once.
const STAGGER = 0.5;
// Peak lift of the flight arc, world units. Without it the trip reads as a
// flat slide instead of a throw.
const ARC = 1.6;
// Idle spin while in orbit, radians/sec. Docked balls do not spin at all.
const SPIN = 0.8;

const TWO_PI = Math.PI * 2;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clampUnit = (v) => (v < -1 ? -1 : v > 1 ? 1 : v);
const smoothstep = (t) => t * t * (3 - 2 * t);

const TechBalls = ({ x, scale }) => {
 const decals = useTexture(ICONS);
 const { camera, size } = useThree();
 const groupRefs = useRef([]);

 // Deterministic per-ball orbit, spread by the golden angle so the ring never
 // looks like a clump even though nothing here is random.
 const orbits = useMemo(
  () =>
   technologies.map((_, i) => ({
    phase: i * 2.39996,
    speed: 0.16 + (i % 5) * 0.012,
    radius: 1.5 + (i % 3) * 0.3, // multiples of the Earth's radius
    tilt: ((-30 + (i % 7) * 10) * Math.PI) / 180,
   })),
  []
 );

 const orbitPos = useRef(new THREE.Vector3());
 const dockPos = useRef(new THREE.Vector3());
 // Accumulated idle spin per ball, staggered so the swarm never looks in step,
 // plus the whole-turn count each one is currently winding towards.
 const spins = useRef(technologies.map((_, i) => i * 1.7));
 const turns = useRef(technologies.map(() => 0));

 useFrame((state, delta) => {
  const slots = getTechSlots();
  const progress = slots ? slots.progress : 0;
  const time = state.clock.elapsedTime;

  const earthX = x.get();
  const earthScale = scale.get();

  // World units per CSS pixel on the docking plane, so a ball sized here covers
  // exactly the DOM slot it is aiming at.
  const distance = camera.position.z - DOCK_Z;
  const visibleHeight = 2 * Math.tan(((camera.fov * Math.PI) / 180) / 2) * distance;
  const worldPerPixel = visibleHeight / size.height;
  // 0.9 keeps a little air around each ball instead of filling the slot edge to edge
  const dockedScale = (slots ? slots.size : 112) * 0.5 * worldPerPixel * 0.9;

  const last = technologies.length - 1;

  technologies.forEach((_, i) => {
   const group = groupRefs.current[i];
   if (!group) return;
   const orbit = orbits[i];

   // --- where the ball parks when the section is away: a tilted ring on the Earth ---
   const angle = orbit.phase + time * orbit.speed;
   const radius = orbit.radius * EARTH_RADIUS * earthScale;
   const ringX = Math.cos(angle) * radius;
   const ringZ = Math.sin(angle) * radius;
   orbitPos.current.set(
    earthX + ringX,
    -ringZ * Math.sin(orbit.tilt),
    ringZ * Math.cos(orbit.tilt)
   );

   // --- where it lands: the DOM slot, unprojected onto the docking plane ---
   const slot = slots?.positions[i];
   if (slot) {
    dockPos.current.set(
     (slot.x / size.width) * 2 - 1,
     -(slot.y / size.height) * 2 + 1,
     0.5
    );
    dockPos.current.unproject(camera);
    dockPos.current.sub(camera.position);
    dockPos.current
     .multiplyScalar((DOCK_Z - camera.position.z) / dockPos.current.z)
     .add(camera.position);
   } else {
    dockPos.current.copy(orbitPos.current);
   }

   // Each ball consumes its own slice of the ramp, so they peel off the orbit
   // one after another instead of moving as a block.
   const start = last > 0 ? (i / last) * STAGGER : 0;
   const t = smoothstep(clamp01((progress - start) / (1 - STAGGER)));

   group.position.lerpVectors(orbitPos.current, dockPos.current, t);
   group.position.y += Math.sin(t * Math.PI) * ARC; // arc through the flight
   group.position.y += Math.sin(time * 1.1 + i) * 0.05 * t; // gentle bob once docked

   group.scale.setScalar(dockedScale * (0.55 + 0.45 * t));

   // The rest pose aims at the camera rather than at world-forward. The grid is
   // wide enough that edge balls sit well off the camera axis, and a yaw of zero
   // there points the icon straight down +Z, which from an off-axis viewpoint
   // reads as the ball turned outwards. Exact solve for Euler XYZ with z=0.
   const dx = camera.position.x - dockPos.current.x;
   const dy = camera.position.y - dockPos.current.y;
   const dz = camera.position.z - dockPos.current.z;
   const faceYaw = Math.asin(clampUnit(dx / Math.hypot(dx, dy, dz)));
   const facePitch = -Math.atan2(dy, dz);

   // Balls only spin while parked in orbit. The moment one starts travelling its
   // spin freezes and unwinds onto that camera-facing pose, arriving dead still
   // with the icon square to the viewer. Only the whole-turn count is latched,
   // never the angle itself — the aim stays live so the ball keeps tracking its
   // slot as the page scrolls, while the latch is what keeps the blend snap-free.
   if (t === 0) {
    spins.current[i] += delta * SPIN;
    turns.current[i] = Math.ceil((spins.current[i] - faceYaw) / TWO_PI);
   }
   const spin = spins.current[i];
   const rest = turns.current[i] * TWO_PI + faceYaw;
   group.rotation.y = spin + (rest - spin) * t;
   // wobble hands over to the camera-facing pitch on arrival
   group.rotation.x = Math.sin(time * 0.5 + i) * 0.15 * (1 - t) + facePitch * t;
  });
 });

 return (
  <group>
   {technologies.map((tech, i) => (
    <group key={tech.name} ref={(node) => (groupRefs.current[i] = node)}>
     <BallMesh decal={decals[i]} scale={1} />
    </group>
   ))}
  </group>
 );
};

export default TechBalls;
