// Screen-space landing spots for the tech balls, published by the Tech section
// so the background 3D scene knows where to fly them.
//
// Same contract as earthTarget: plain mutable state written every frame from a
// rAF loop, never React state — this updates at 60fps and must not re-render.
//
// positions: viewport-pixel centre of each ball's slot, index-aligned with
//            `technologies` in constants.
// size:      slot diameter in CSS pixels, so the scene can match the DOM layout.
// progress:  0 = section fully out of view (balls orbit the Earth),
//            1 = section parked in view (balls docked on the grid).
const slots = { positions: [], size: 112, progress: 0, ready: false };

export const setTechSlots = (positions, size, progress) => {
 slots.positions = positions;
 slots.size = size;
 slots.progress = progress;
 slots.ready = true;
};

// Returns live state, or null while the Tech section has not measured itself.
// Callers must not hold onto `positions` across frames — it is replaced in place.
export const getTechSlots = () => (slots.ready ? slots : null);

export const clearTechSlots = () => {
 slots.ready = false;
 slots.progress = 0;
};
