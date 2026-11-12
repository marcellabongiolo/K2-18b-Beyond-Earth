import { describe, expect, it } from 'vitest';
import { flightPhases, flightTarget, transitionFactor } from '../src/descent';
describe('cinematic atmospheric approach', () => {
 it('sets different camera targets for each phase', () => { expect(flightTarget('orbit')[2]).toBeGreaterThan(flightTarget('descent')[2]); });
 it('labels atmospheric approach as a simulation', () => { expect(flightPhases.descent).toMatch(/simulada/); });
 it('clamps interpolation for safe frame deltas', () => { expect(transitionFactor(-1)).toBe(0); expect(transitionFactor(2)).toBe(1); expect(transitionFactor(0.1)).toBeCloseTo(0.125); });
});