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
/** Fictional rocky-ocean world inspired by the supplied visual reference.
 * No continental geography or liquid ocean has been observed on K2-18 b.
 */
export function createPlanetTexture(): HTMLCanvasElement {
 const canvas = document.createElement('canvas');
 canvas.width = 1024; canvas.height = 512;
 const ctx = canvas.getContext('2d'); if (!ctx) return canvas;
 const pixels = ctx.createImageData(canvas.width, canvas.height);
 const clamp = (v: number) => Math.max(0, Math.min(1, v));
 const mix = (a: number, b: number, t: number) => a + (b-a)*clamp(t);
 const fbm = (x: number, y: number) => {
  let sum = 0, amp = 0.55, freq = 1;
  for (let i=0;i<5;i++) {
   sum += amp * smoothNoise(x*freq, y*freq);
   amp *= 0.48; freq *= 2.03;
  }
  return sum;
 };
 for (let y=0;y<canvas.height;y++) for (let x=0;x<canvas.width;x++) {
  const u=x/canvas.width, v=y/canvas.height;
  const lat=Math.abs(v-0.5)*2;
  const warp=fbm(u*5.5+12,v*5.5+4);
  const sx=u*3.6+(warp-0.5)*0.24;
  const sy=v*3.9+(warp-0.5)*0.19;
  const continents=fbm(sx+2.4,sy+8.2)*0.76+fbm(sx*2.1+9,sy*2.1+1)*0.24;
  const detail=fbm(u*42+2,v*30+3);
  const mountain=fbm(u*22+7,v*19+11);
  const ridges=Math.abs(fbm(u*63+17,v*46+8)-0.5);
  const fineGrain=fbm(u*95+3,v*71+15);
  const coast=continents-0.485+(detail-0.5)*0.085;
  const land=clamp((coast+0.014)*38);
  const shallows=clamp((coast+0.095)*11);
  const deep=fbm(u*12+4,v*11+9);
  const ocean=[mix(5,13,deep),mix(42,79,deep),mix(71,109,deep)];
  const coastal=[mix(12,21,detail),mix(111,158,detail),mix(124,161,detail)];
  const reef=clamp((fbm(u*26+12,v*24+18)-0.48)*4.5);
  coastal[0]+=reef*14; coastal[1]+=reef*17; coastal[2]-=reef*7;
  const water=ocean.map((c,i)=>mix(c,coastal[i],shallows*0.92));
  const elevation=clamp((coast-0.018)*4+mountain*0.5);
  const soil=[mix(78,147,detail),mix(86,130,detail),mix(70,96,detail)];
  const highlands=[mix(111,188,mountain),mix(105,177,mountain),mix(92,160,mountain)];
  const rocky=soil.map((c,i)=>mix(c,highlands[i],clamp(elevation*0.95)));
  const crags=clamp((0.25-ridges)*2.5)*elevation;
  for(let k=0;k<3;k++) rocky[k]=mix(rocky[k], [202,198,181][k],crags*0.42);
  const terrainVariation=(fineGrain-0.5)*28;
  for(let k=0;k<3;k++) rocky[k]=Math.max(0,rocky[k]+terrainVariation);
  const frost=clamp((lat-0.71)*4.2+(mountain-0.58)*1.6);
  const color=water.map((c,i)=>mix(c,rocky[i],land));
  const haze=clamp((fbm(u*15+1,v*14+5)-0.53)*2.3)*0.17;
  const i=(y*canvas.width+x)*4;
  for(let k=0;k<3;k++) {
   color[k]=mix(color[k], [212,226,231][k], Math.max(frost*0.7,haze));
   pixels.data[i+k]=Math.round(color[k]);
  }
  pixels.data[i+3]=255;
 }
 ctx.putImageData(pixels,0,0);
 return canvas;
}
/** Transparent cloud-only map: surface colors no longer get repeated on cloud shells. */
export function createCloudTexture(): HTMLCanvasElement {
 const canvas = document.createElement('canvas');
 canvas.width = 1024; canvas.height = 512;
 const ctx = canvas.getContext('2d'); if (!ctx) return canvas;
 const image = ctx.createImageData(canvas.width, canvas.height);
 for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
  const u = x / canvas.width, v = y / canvas.height;
  const warpedU = u * 11 + Math.sin(v * 22) * 0.13;
  const warpedV = v * 8 + Math.sin(u * 15) * 0.09;
  const broad = cloudField(warpedU, warpedV);
  const detail = cloudField(u * 39, v * 31);
  const wisps = Math.sin(v * 67 + broad * 12 + Math.sin(u * 25) * 1.6) * 0.085;
  const density = Math.max(0, Math.min(1, (broad * 0.76 + detail * 0.24 + wisps - 0.35) * 3.5));
  const i = (y * canvas.width + x) * 4;
  image.data[i] = 191; image.data[i+1] = 222; image.data[i+2] = 238;
  image.data[i+3] = Math.round(density * 205);
 }
 ctx.putImageData(image, 0, 0);
 return canvas;
}
