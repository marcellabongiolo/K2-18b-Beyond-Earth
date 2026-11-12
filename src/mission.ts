export type ProbeMode = 'orbital' | 'approach';
export type MissionState = { mode: ProbeMode; distance: number; scanProgress: number };
export const initialMission: MissionState = { mode: 'orbital', distance: 6, scanProgress: 0 };
export function nextMission(state: MissionState, action: 'approach' | 'retreat' | 'scan' | 'reset'): MissionState {
  if (action === 'reset') return { ...initialMission };
  if (action === 'scan') return { ...state, scanProgress: Math.min(100, state.scanProgress + 25) };
  const distance = Math.min(12, Math.max(3.5, state.distance + (action === 'approach' ? -0.5 : 0.5)));
  return { ...state, distance, mode: distance < 5 ? 'approach' : 'orbital' };
}
export function telemetry(distance: number) { return { signal: Math.max(0, Math.min(100, Math.round(100 - (distance - 3.5) * 7))), distanceDisplay: distance.toFixed(1) }; }
