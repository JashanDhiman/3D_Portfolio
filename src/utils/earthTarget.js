// Screen-space position of the Earth model, published by the 3D scene every frame
// so DOM overlays (the contact form's flying plane) can aim at it.
// Plain mutable state on purpose: this updates at 60fps and must never re-render React.
const target = { x: 0, y: 0, radius: 0, ready: false };

export const setEarthTarget = (x, y, radius) => {
 target.x = x;
 target.y = y;
 target.radius = radius;
 target.ready = true;
};

// Returns a snapshot, or null while the canvas has not drawn yet.
export const getEarthTarget = () => (target.ready ? { ...target } : null);

export const clearEarthTarget = () => {
 target.ready = false;
};
