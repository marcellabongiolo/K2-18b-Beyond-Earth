export const spaceTargets = [
 {id:'b',name:'K2-18 b',position:[0,0,0],radius:1.7,distance:6,fictional:false,description:'Planeta conhecido; superfície e oceanos são interpretações artísticas.'},
 {id:'star',name:'Estrela K2-18',position:[-6,3.5,-13],radius:.85,distance:3.4,fictional:false,description:'Estrela do sistema. Aparência ilustrativa; a câmera mantém uma distância segura.'},
 {id:'c',name:'K2-18 c',position:[5,2.6,-9],radius:.48,distance:2,fictional:false,description:'Outro planeta catalogado no sistema; esta aparência não foi observada.'},
 {id:'galaxy1',name:'Galáxia espiral 1',position:[-23,13,-58],radius:7,distance:23,fictional:true,description:'Galáxia tridimensional fictícia com núcleo e braços de estrelas.'},
 {id:'galaxy2',name:'Galáxia espiral 2',position:[25,-14,-65],radius:6,distance:20,fictional:true,description:'Composição artística, sem posição astronômica real atribuída.'},
 {id:'galaxy3',name:'Galáxia espiral 3',position:[10,24,-70],radius:5,distance:17,fictional:true,description:'Composição artística com estrelas distribuídas em profundidade.'},
 {id:'galaxy4',name:'Galáxia espiral 4',position:[-35,-12,55],radius:7,distance:23,fictional:true,description:'Objeto fictício no hemisfério oposto do cenário.'},
 {id:'galaxy5',name:'Galáxia espiral 5',position:[48,19,35],radius:6,distance:20,fictional:true,description:'Objeto fictício; gire a câmera para explorar ao redor.'},
 {id:'galaxy6',name:'Galáxia espiral 6',position:[-50,30,-3],radius:5,distance:17,fictional:true,description:'Objeto fictício, selecionável e explorável em três dimensões.'},
 {id:'fragment',name:'Fragmento rochoso ilustrativo',position:[3,-2,-2],radius:.2,distance:1.2,fictional:true,description:'Fragmento tridimensional fictício: gire e aproxime para examinar sua forma.'},
 {id:'comet',name:'Cometa ilustrativo',position:[-16,5,-28],radius:.12,distance:1.8,fictional:true,description:'Núcleo rochoso e cauda ilustrativos. A câmera acompanha seu movimento.'},
] as const;
export type SpaceTargetId = typeof spaceTargets[number]['id'];
export function targetPosition(id:SpaceTargetId,time:number):[number,number,number]{
 if(id==='comet'){const t=(time*.14)%10;return [-16+t*3.2,5-t*.4,-28];}
 return [...spaceTargets.find(t=>t.id===id)!.position];
}
export function targetCameraDistance(id:SpaceTargetId,zoom:number){const t=spaceTargets.find(t=>t.id===id)!;return Math.max(t.radius*1.8,t.distance*Math.max(3.5,Math.min(12,zoom))/6);}
export function debrisPosition(index:number):[number,number,number]{const angle=index*2.399963,r=7+(index%17)*.55;return [Math.sin(angle)*r,Math.cos(index*1.7)*5,Math.cos(angle)*r];}
export const oceanSubjects = {
 garden:{name:'Colônia filamentosa fictícia',description:'Formação artística que oscila com a corrente simulada; não é vegetação ou vida confirmada.'},
 jelly:{name:'Organismo pulsante fictício',description:'Modelo artístico. Observe a pulsação e os filamentos; não representa uma espécie descoberta.'},
 school:{name:'Cardume fictício',description:'Nadadores simulados com caudas animadas e deslocamentos individuais.'},
 rock:{name:'Formação mineral fictícia',description:'Rocha procedural do relevo imaginado. Use o sonar para destacar estruturas ao redor.'},
 vent:{name:'Fonte hidrotermal fictícia',description:'Coluna de partículas e luz ilustrativa. Não há confirmação de fontes hidrotermais em K2-18 b.'},
} as const;
export type OceanSubject = keyof typeof oceanSubjects;
