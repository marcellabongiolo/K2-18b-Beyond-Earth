/** Artistic scene units, never physical measurements of K2-18 b. */
export const GLIDER_COUNT = 9;
export function gliderPose(index: number, time: number) {
 const layer = index % 3;
 const phase = index * 2.39996;
 const speed = 0.18 + index * 0.009;
 return {
  // Fixed world-space layers create parallax as the camera approaches.
  x: Math.sin(phase) * (0.25 - layer * 0.06) + Math.sin(time * speed + phase) * 0.06,
  y: 0.15 + Math.cos(phase) * (0.14 - layer * 0.04) + Math.sin(time * 0.32 + phase) * 0.02,
  z: 1.94 + layer * 0.14 + Math.sin(time * 0.21 + phase) * 0.025,
  scale: 0.22 + (index % 4) * 0.03,
  bank: Math.sin(time * speed + phase) * 0.2,
  yaw: Math.sin(time * 0.17 + phase) * 0.3,
  flap: Math.sin(time * (1.8 + index * 0.13) + phase) * 0.3,
 };
}



