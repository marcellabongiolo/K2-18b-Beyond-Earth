export type SampleRecord = { id:number; depth:number; heading:number; material:string };
export type Collection = { progress:number; depth:number; heading:number };
export type OceanState = { depth: number; heading: number; samples: number; distance: number; collection: Collection | null; sampleLog: SampleRecord[] };
export const initialOcean: OceanState = { depth: 120, heading: 0, samples: 0, distance: 7, collection: null, sampleLog: [] };
export type OceanAction = 'dive' | 'ascend' | 'turnLeft' | 'turnRight' | 'sample' | 'reset' | 'approach' | 'retreat' | 'sampleTick';
export function oceanReducer(state: OceanState, action: OceanAction): OceanState {
 switch (action) {
  case 'approach': return { ...state, distance: Math.max(4,state.distance-0.5) };
  case 'retreat': return { ...state, distance: Math.min(12,state.distance+0.5) };
  case 'dive': return { ...state, depth: Math.min(1000, state.depth + 40) };
  case 'ascend': return { ...state, depth: Math.max(0, state.depth - 40) };
  case 'turnLeft': return { ...state, heading: (state.heading + 345) % 360 };
  case 'turnRight': return { ...state, heading: (state.heading + 15) % 360 };
  case 'sample': return state.collection || state.samples >= 5 ? state : { ...state, collection: { progress:0, depth:state.depth, heading:state.heading } };
  case 'sampleTick': {
   if(!state.collection) return state;
   const progress=state.collection.progress+10;
   if(progress<100) return {...state, collection:{...state.collection,progress}};
   const record={id:state.samples+1,depth:state.collection.depth,heading:state.collection.heading,
    material:state.collection.depth>=600?'Sedimento virtual':state.collection.depth>=200?'Partículas virtuais':'Água virtual'};
   return {...state,samples:state.samples+1,collection:null,sampleLog:[...state.sampleLog,record]};
  }
  case 'reset': return { ...initialOcean };
 }
}
export function oceanZone(depth: number): string { return depth < 200 ? 'ZONA CREPUSCULAR FICTÍCIA' : depth < 600 ? 'ABISMO AZUL FICTÍCIO' : 'ZONA PROFUNDA FICTÍCIA'; }

/** Art direction in virtual units, not measured conditions on the exoplanet. */
export function oceanEnvironment(depth: number) {
 const fraction = Math.max(0, Math.min(1, depth / 1000));
 return { fraction, sunlight: 2.6 * Math.exp(-fraction * 4),
  visibility: 24 - fraction * 13, surfaceHeight: 4 + fraction * 18,
  floorHeight: -4 + fraction * 1.2 };
}
export function seabedHeight(x: number, z: number) {
 return Math.sin(x * 0.38) * Math.cos(z * 0.31) * 0.6
  + Math.sin(x * 1.1 + z * 0.43) * 0.12 + Math.cos(z * 1.6 - x * 0.6) * 0.055;
}


export function collectionStage(progress:number){return progress<30?'Estendendo coletor':progress<70?'Capturando amostra virtual':'Armazenando amostra';}
