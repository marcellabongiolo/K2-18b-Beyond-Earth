/** Horizontal pointer movement rotates the simulated ocean in radians. */
export function dragOrbitAngle(angle:number,deltaX:number):number {
 if(!Number.isFinite(deltaX)) return angle;
 return angle+Math.max(-120,Math.min(120,deltaX))*0.006;
}
