export type FlightPhase = 'orbit' | 'descent';
export const flightPhases = { orbit: 'Órbita de reconhecimento', descent: 'Aproximação atmosférica simulada' } as const;
export function flightTarget(phase: FlightPhase): [number, number, number] { return phase === 'descent' ? [0.1, 0.2, 2.65] : [0, 0.15, 6]; }
export function transitionFactor(deltaSeconds: number): number { return Math.max(0, Math.min(1, deltaSeconds * 1.25)); }
