import { describe, expect, it } from 'vitest';
import { initialMission, nextMission, spaceCameraDistance } from '../src/mission';
import { initialOcean, oceanReducer } from '../src/ocean';
describe('visible camera zoom controls',()=>{
 it('moves the space camera closer and farther in both flight phases',()=>{
  for(const phase of ['orbit','descent'] as const){
   const start=spaceCameraDistance(initialMission.distance,phase);
   expect(spaceCameraDistance(nextMission(initialMission,'approach').distance,phase)).toBeLessThan(start);
   expect(spaceCameraDistance(nextMission(initialMission,'retreat').distance,phase)).toBeGreaterThan(start);
  }
 });
 it('keeps cinematic zoom outside the planet and flock',()=>{
  expect(spaceCameraDistance(-100,'descent')).toBeGreaterThan(2.45);
  expect(spaceCameraDistance(100,'descent')).toBeLessThan(3.1);
  expect(spaceCameraDistance(-100,'orbit')).toBe(3.5);
  expect(spaceCameraDistance(100,'orbit')).toBe(12);
 });
 it('zooms underwater independently of depth and clamps both limits',()=>{
  let s=oceanReducer(initialOcean,'approach');expect(s.distance).toBeLessThan(initialOcean.distance);expect(s.depth).toBe(initialOcean.depth);
  for(let i=0;i<100;i++)s=oceanReducer(s,'approach');expect(s.distance).toBe(2.5);
  for(let i=0;i<100;i++)s=oceanReducer(s,'retreat');expect(s.distance).toBe(12);
  expect(oceanReducer(s,'reset')).toEqual(initialOcean);
 });
});
