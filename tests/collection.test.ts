import { describe, expect, it } from 'vitest';
import { initialOcean, oceanReducer, collectionStage } from '../src/ocean';
import { spaceCameraDistance } from '../src/mission';
describe('visible sample collection',()=>{
 it('starts without claiming an instant sample and ignores duplicate starts',()=>{
  const start=oceanReducer(initialOcean,'sample');
  expect(start.samples).toBe(0);expect(start.collection?.progress).toBe(0);
  expect(oceanReducer(start,'sample')).toBe(start);
  const halfway=oceanReducer(start,'sampleTick');expect(halfway.collection!.progress).toBeGreaterThan(0);
 });
 it('stores the capture location even if navigation changes during collection',()=>{
  let state=oceanReducer({...initialOcean,depth:640,heading:345},'sample');
  state=oceanReducer(state,'ascend');state=oceanReducer(state,'turnRight');
  for(let i=0;i<10;i++)state=oceanReducer(state,'sampleTick');
  expect(state.collection).toBeNull();expect(state.samples).toBe(1);
  expect(state.sampleLog[0]).toEqual({id:1,depth:640,heading:345,material:'Sedimento virtual'});
  expect(oceanReducer(state,'sampleTick')).toBe(state);
 });
 it('reset cancels collection and clears stored samples',()=>{
  const reset=oceanReducer(oceanReducer(initialOcean,'sample'),'reset');
  expect(reset).toEqual(initialOcean);expect(oceanReducer(reset,'sampleTick')).toEqual(initialOcean);
 });
 it('gives distinct visible feedback at each stage',()=>{
  expect(new Set([0,40,80].map(collectionStage)).size).toBe(3);
 });
});
describe('illustrative system overview',()=>{
 it('moves the camera beyond local orbit without affecting local zoom',()=>{
  expect(spaceCameraDistance(6,'orbit',true)).toBeGreaterThan(spaceCameraDistance(6,'orbit'));
  expect(spaceCameraDistance(4,'orbit',true)).toBeLessThan(spaceCameraDistance(8,'orbit',true));
 });
});
