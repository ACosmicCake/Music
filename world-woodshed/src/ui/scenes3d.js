/* World Woodshed — whether this device draws the 3D scenes (the club and the garden island, three.js), which use
   more battery than their flat drawings. settings.scenes3d, per device (DEVICE_SETTINGS): 'auto' (the default:
   off on a phone, on elsewhere), 'on' or 'off'. No three.js here, so asking costs nothing: the 3D chunks load
   only when show3D() says yes. Shared by src/tools/club.js and src/ui/garden.js. */
import E from '../engine.js';

let gl = null;
export function webgl() {
  if (gl === null) { try { const c = document.createElement('canvas'); gl = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { gl = false; } }
  return gl;
}
/* a phone: a touch screen with no hover, or the compact layout for small screens */
export function isPhone() {
  try {
    const root = document.documentElement;
    if (root && root.classList && root.classList.contains('compact')) return true;
    return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(hover: hover)').matches);
  } catch (e) { return false; }
}
export function scenesMode() { const v = (E.state.settings || {}).scenes3d; return v === 'on' || v === 'off' ? v : 'auto'; }
export function show3D() {
  const m = scenesMode();
  if (m === 'off') return false;
  if (m === 'auto' && isPhone()) return false;
  return webgl();
}
export const SCENES_HELP = 'The 3D club and garden island use more battery than their flat drawings. Automatic shows the drawings on a phone and 3D elsewhere.';
