import { describe, expect, it } from 'vitest';
import { oceanEnvironment, seabedHeight } from '../src/ocean';
describe('artistic underwater environment',()=>{
 it('attenuates sunlight and visibility with simulated depth',()=>{
  const shallow=oceanEnvironment(0),deep=oceanEnvironment(1000);
  expect(deep.sunlight).toBeLessThan(shallow.sunlight*.05);
  expect(deep.visibility).toBeLessThan(shallow.visibility);
  expect(deep.surfaceHeight).toBeGreaterThan(shallow.surfaceHeight);
  expect(deep.floorHeight).toBeGreaterThan(shallow.floorHeight);
 });
 it('clamps environment settings at navigation limits',()=>{
  expect(oceanEnvironment(-500)).toEqual(oceanEnvironment(0));
  expect(oceanEnvironment(1500)).toEqual(oceanEnvironment(1000));
 });
 it('keeps seabed clear of the submarine throughout the navigable scene',()=>{
  for(let x=-32;x<=32;x++)for(let z=-32;z<=32;z++){
   const height=seabedHeight(x,z);
   expect(Number.isFinite(height)).toBe(true);
   expect(height+oceanEnvironment(1000).floorHeight).toBeLessThan(-1.9);
  }
 });
});
