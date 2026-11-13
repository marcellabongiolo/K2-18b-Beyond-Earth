import { describe, expect, it } from 'vitest';
import { planetaryModels, signalAssessment, spectralSignal, spectralSpecies } from '../src/scientificTelemetry';

describe('Missão 02 — rigor da telemetria ilustrativa',()=>{
 it('mantém leituras espectrais limitadas e finitas',()=>{
  for(const calibration of [0,25,50,75,100])for(const wavelength of [1,1.65,2.05,3.35,3.9]){
   const value=spectralSignal(wavelength,calibration);
   expect(Number.isFinite(value)).toBe(true);
   expect(value).toBeGreaterThanOrEqual(0);
   expect(value).toBeLessThanOrEqual(1);
  }
 });
 it('mantém DMS/DMDS explicitamente ambíguo',()=>{
  expect(spectralSpecies.find(s=>s.id==='DMS')?.label).toMatch(/disputado/);
  expect(signalAssessment(100)).toMatch(/não confirmada/);
  expect(signalAssessment(0)).toMatch(/inconclusivos/);
 });
 it('prioriza interferência durante flare',()=>{
  expect(signalAssessment(90,true)).toMatch(/Interferência/);
 });
 it('distingue modelos planetários sem alegar confirmação',()=>{
  expect(planetaryModels.hycean.layers.join(' ')).toMatch(/Oceano/);
  expect(planetaryModels.miniNeptune.layers.join(' ')).toMatch(/supercrítico/);
  expect(planetaryModels.hycean.note).toMatch(/não/);
 });
});
