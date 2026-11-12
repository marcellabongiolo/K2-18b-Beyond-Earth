import { describe, expect, it } from 'vitest';
import { spaceTargets, targetPosition, targetCameraDistance, debrisPosition } from '../src/exploration';
import { initialOcean, oceanReducer } from '../src/ocean';
describe('interactive 3D targets',()=>{
 it('gives every target a safe independent zoom range',()=>{
  for(const target of spaceTargets){
   expect(targetCameraDistance(target.id,3.5)).toBeGreaterThan(target.radius*1.7);
   expect(targetCameraDistance(target.id,3.5)).toBeLessThan(targetCameraDistance(target.id,12));
   expect(targetPosition(target.id,0).every(Number.isFinite)).toBe(true);
  }
 });
 it('tracks the moving comet rather than a fixed background point',()=>{
  expect(targetPosition('comet',10)).not.toEqual(targetPosition('comet',0));
 });
 it('covers both hemispheres with galaxies and debris',()=>{
  const galaxies=spaceTargets.filter(t=>t.id.startsWith('galaxy'));
  expect(galaxies.some(t=>t.position[2]>0)).toBe(true);expect(galaxies.some(t=>t.position[2]<0)).toBe(true);
  const positions=Array.from({length:90},(_,i)=>debrisPosition(i));
  for(const axis of [0,2]){expect(positions.some(p=>p[axis]>5)).toBe(true);expect(positions.some(p=>p[axis]<-5)).toBe(true);}
  for(const p of positions)expect(Math.hypot(...p)).toBeGreaterThan(6);
 });
});
describe('ocean exploration equipment',()=>{
 it('toggles lights and emits distinct sonar pulses without changing navigation',()=>{
  const off=oceanReducer(initialOcean,'lights');expect(off.lights).toBe(false);
  expect(oceanReducer(off,'lights').lights).toBe(true);
  const ping=oceanReducer(oceanReducer(off,'sonar'),'sonar');expect(ping.sonarCount).toBe(2);expect(ping.depth).toBe(initialOcean.depth);expect(ping.heading).toBe(initialOcean.heading);
  expect(oceanReducer(ping,'reset')).toEqual(initialOcean);
 });
});
