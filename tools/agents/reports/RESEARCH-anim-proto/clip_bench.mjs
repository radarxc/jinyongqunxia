// Microbenchmark: clip-driven 2D cutout pose for 100 characters x 16 parts (zero allocation in the loop).
// Track layout per frame: 16 bones x (dx,dy,dz) int16 unit vectors + root (x,y,z) + chestYaw + pelvisYaw.
import os from 'node:os';
const BONES = 16, FPS = 30, FRAMES = 48, CHARS = 100;
const PARENT = new Int8Array([-1, 0, 1, 1, 3, 5, 1, 2, 4, 6, 0, 0, 10, 11, 12, 13]); // torso-rooted chain-ish
const LEN = new Float32Array([0.52, 0.24, 0.30, 0.30, 0.26, 0.26, 0.19, 0.19, 0.44, 0.44, 0.40, 0.40, 0.25, 0.25, 0.28, 0.25]);
const STRIDE = BONES * 3 + 5;
const track = new Int16Array(FRAMES * STRIDE);
for (let f = 0; f < FRAMES; f++) for (let b = 0; b < BONES; b++) {
  const a = Math.sin(f * 0.2 + b), c = Math.cos(f * 0.13 + b * 0.7);
  const x = a * 0.4, y = -Math.sqrt(Math.max(0, 1 - x * x - c * c * 0.16)), z = c * 0.4;
  const n = Math.hypot(x, y, z);
  track[f * STRIDE + b * 3] = Math.round(x / n * 32767); track[f * STRIDE + b * 3 + 1] = Math.round(y / n * 32767); track[f * STRIDE + b * 3 + 2] = Math.round(z / n * 32767);
}
const affine = new Float32Array(CHARS * 20 * 6), zkey = new Uint16Array(CHARS * 20), view = new Uint8Array(CHARS * 3);
const jx = new Float32Array(BONES + 1), jy = new Float32Array(BONES + 1), dir = new Float32Array(BONES * 3);
const yawC = new Float32Array(CHARS), yawS = new Float32Array(CHARS), tOff = new Float32Array(CHARS);
for (let i = 0; i < CHARS; i++) { const a = (i % 8) * Math.PI / 4; yawC[i] = Math.cos(a); yawS[i] = Math.sin(a); tOff[i] = i * 0.037; }
const VIEW_YAW = new Float32Array([45, 90, 135, -45, -90, -135]);
function chooseView(theta, cur) { // hysteresis 10 deg
  let best = 0, bd = 1e9;
  for (let k = 0; k < 6; k++) { let d = Math.abs(((theta - VIEW_YAW[k] + 540) % 360) - 180); if (d < bd) { bd = d; best = k; } }
  const dc = Math.abs(((theta - VIEW_YAW[cur] + 540) % 360) - 180);
  return bd + 10 < dc ? best : cur;
}
function frame(time) {
  for (let ch = 0; ch < CHARS; ch++) {
    const t = (time + tOff[ch]) * FPS, f0 = Math.floor(t) % (FRAMES - 1), u = t - Math.floor(t);
    const o0 = f0 * STRIDE, o1 = o0 + STRIDE, c = yawC[ch], s = yawS[ch];
    for (let b = 0; b < BONES; b++) { // lerp + yaw rotate
      const k = b * 3;
      const x = ((1 - u) * track[o0 + k] + u * track[o1 + k]) / 32767, y = ((1 - u) * track[o0 + k + 1] + u * track[o1 + k + 1]) / 32767, z = ((1 - u) * track[o0 + k + 2] + u * track[o1 + k + 2]) / 32767;
      dir[k] = c * x + s * z; dir[k + 1] = y; dir[k + 2] = -s * x + c * z;
    }
    jx[BONES] = 0; jy[BONES] = 0.94;
    for (let b = 0; b < BONES; b++) {
      const p = PARENT[b] < 0 ? BONES : PARENT[b], k = b * 3, dx = dir[k], dy = dir[k + 1];
      const L = LEN[b], ex = jx[p] + L * dx, ey = jy[p] + L * dy; jx[b] = ex; jy[b] = ey;
      const h = Math.hypot(dx, dy) || 1e-6, sc = Math.max(h, 0.45), cs = -dy / h, sn = dx / h;
      const o = (ch * 20 + b) * 6, w = 0.12, hh = L * sc;
      affine[o] = cs * w; affine[o + 1] = -sn * hh; affine[o + 2] = jx[p] + 0.5 * L * dx;
      affine[o + 3] = sn * w; affine[o + 4] = cs * hh; affine[o + 5] = jy[p] + 0.5 * L * dy;
      zkey[ch * 20 + b] = (dir[k + 2] * 0.5 + 0.5) * 65535;
    }
    const theta = Math.atan2(-dir[0], dir[2]) * 57.29578;
    view[ch * 3] = chooseView(theta, view[ch * 3]);
  }
}
function p95(a) { a.sort(); return a[Math.floor(a.length * 0.95)]; }
for (let i = 0; i < 120; i++) frame(i / 60);
const rounds = [];
for (let r = 0; r < 3; r++) { const s = new Float64Array(600); for (let i = 0; i < 600; i++) { const t0 = performance.now(); frame(i / 60); s[i] = performance.now() - t0; } rounds.push(p95(s)); }
console.log(`100 chars x 16 parts clip pose: P95 per round ms = ${rounds.map(v => v.toFixed(3)).join(' / ')} ; best=${Math.min(...rounds).toFixed(3)} ; loadavg=${os.loadavg().map(v=>v.toFixed(1)).join('/')} cpus=${os.cpus().length}`);
