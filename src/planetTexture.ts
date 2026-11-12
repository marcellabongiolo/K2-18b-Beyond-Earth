/** Deterministic procedural art. Not a map or measured atmosphere of K2-18 b. */
export function noise2d(x: number, y: number): number {
 const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
 return v - Math.floor(v);
}
export function smoothNoise(x: number, y: number): number {
 const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
 const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
 const a = noise2d(ix, iy) * (1 - u) + noise2d(ix + 1, iy) * u;
 const b = noise2d(ix, iy + 1) * (1 - u) + noise2d(ix + 1, iy + 1) * u;
 return a * (1 - v) + b * v;
}
export function cloudField(u: number, v: number): number {
 let n = 0, amplitude = 0.5, frequency = 1;
 for (let octave = 0; octave < 5; octave++) {
  n += amplitude * smoothNoise(u * frequency + Math.sin(v * 5) * 0.22, v * frequency);
  amplitude *= 0.5; frequency *= 2;
 }
 return n;
}
export function createPlanetTexture(): HTMLCanvasElement {
 const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
 const ctx = canvas.getContext('2d'); if (!ctx) return canvas;
 const pixels = ctx.createImageData(canvas.width, canvas.height);
 for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
  const u = x / canvas.width, v = y / canvas.height;
  const latitude = Math.abs(v - 0.5) * 2;
  const swirl = Math.sin(v * 38 + Math.sin(u * 24 + v * 17) * 2.5) * 0.12;
  const turbulence = cloudField(u * 9, v * 7);
  const fineCloud = cloudField(u * 35, v * 25);
  const vortex = Math.exp(-Math.pow((v - 0.42) * 17, 2) - Math.pow((u - 0.67) * 13, 2)) * Math.sin(Math.atan2(v - 0.42, u - 0.67) * 4 + Math.hypot(u - 0.67, v - 0.42) * 85) * 0.14;
  const bands = Math.sin(v * 56 + turbulence * 10 + Math.sin(u * 13) * 1.3) * 0.1;
  const haze = Math.max(0, Math.min(1, turbulence * 0.59 + fineCloud * 0.18 + swirl + bands + vortex + latitude * 0.08));
  const polar = Math.max(0, (latitude - 0.8) * 2.5);
  const i = (y * canvas.width + x) * 4;
  pixels.data[i] = 10 + haze * 75 + polar * 35;
  pixels.data[i + 1] = 43 + haze * 110 + polar * 35;
  pixels.data[i + 2] = 80 + haze * 126 + polar * 25;
  pixels.data[i + 3] = 255;
 }
 ctx.putImageData(pixels, 0, 0); return canvas;
}
