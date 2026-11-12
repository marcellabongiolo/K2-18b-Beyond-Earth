export type OceanState = { depth: number; heading: number; samples: number };
export const initialOcean: OceanState = { depth: 120, heading: 0, samples: 0 };
export type OceanAction = 'dive' | 'ascend' | 'turnLeft' | 'turnRight' | 'sample' | 'reset';
export function oceanReducer(state: OceanState, action: OceanAction): OceanState {
 switch (action) {
  case 'dive': return { ...state, depth: Math.min(1000, state.depth + 40) };
  case 'ascend': return { ...state, depth: Math.max(0, state.depth - 40) };
  case 'turnLeft': return { ...state, heading: (state.heading + 345) % 360 };
  case 'turnRight': return { ...state, heading: (state.heading + 15) % 360 };
  case 'sample': return { ...state, samples: Math.min(5, state.samples + 1) };
  case 'reset': return { ...initialOcean };
 }
}
export function oceanZone(depth: number): string { return depth < 200 ? 'ZONA CREPUSCULAR FICTÍCIA' : depth < 600 ? 'ABISMO AZUL FICTÍCIO' : 'ZONA PROFUNDA FICTÍCIA'; }
