import { describe, it, expect } from 'vitest';
import { initialMission, nextMission, telemetry } from '../src/mission';
describe('probe navigation', () => {
 it('moves closer and changes mode', () => { let state=initialMission; for(let i=0;i<4;i++) state=nextMission(state,'approach'); expect(state.mode).toBe('approach'); expect(state.distance).toBe(4); });
 it('respects navigation bounds', () => { let state=initialMission; for(let i=0;i<40;i++) state=nextMission(state,'approach'); expect(state.distance).toBe(3.5); for(let i=0;i<40;i++) state=nextMission(state,'retreat'); expect(state.distance).toBe(12); });
 it('completes and caps scanning', () => { let state=initialMission; for(let i=0;i<9;i++) state=nextMission(state,'scan'); expect(state.scanProgress).toBe(100); expect(nextMission(state,'reset')).toEqual(initialMission); });
 it('computes bounded illustrative signal', () => { expect(telemetry(3.5).signal).toBe(100); expect(telemetry(12).signal).toBeGreaterThanOrEqual(0); });
});