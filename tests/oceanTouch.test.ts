import { describe, expect, it } from 'vitest';
import { dragOrbitAngle } from '../src/oceanTouch';
describe('Ocean touch orbit',()=>{
 it('rotates with horizontal swipes in both directions',()=>{
  expect(dragOrbitAngle(0,100)).toBeGreaterThan(0);
  expect(dragOrbitAngle(0,-100)).toBeLessThan(0);
 });
 it('limits large jumps and ignores invalid pointer deltas',()=>{
  expect(dragOrbitAngle(0,1000)).toBeCloseTo(.72);
  expect(dragOrbitAngle(1,Number.NaN)).toBe(1);
 });
});
