import { describe, expect, it } from 'vitest';
import { GLIDER_COUNT, gliderPose } from '../src/gliders';
import { flightTarget } from '../src/descent';

describe('fictional approach flock', () => {
 it('keeps moving gliders above clouds and safely ahead of the final camera', () => {
  for(let i=0;i<GLIDER_COUNT;i++) for(let t=0;t<=240;t+=0.5) {
   const p=gliderPose(i,t);
   expect(p.z).toBeGreaterThan(1.87);
   expect(p.z).toBeLessThan(flightTarget('descent')[2]-0.3);
   // Leave a margin within the final 43 degree camera view, including wing tips.
   expect(Math.abs(p.y-0.15)+0.05).toBeLessThan((2.65-p.z)*Math.tan(43*Math.PI/360));
  }
 });
 it('has distinct world-space depth layers and individual motion', () => {
  const poses=Array.from({length:GLIDER_COUNT},(_,i)=>gliderPose(i,0));
  expect(Math.max(...poses.map(p=>p.z))-Math.min(...poses.map(p=>p.z))).toBeGreaterThan(0.25);
  for(let i=0;i<GLIDER_COUNT;i++) expect(gliderPose(i,10).x).not.toBeCloseTo(poses[i].x,4);
 });
});
