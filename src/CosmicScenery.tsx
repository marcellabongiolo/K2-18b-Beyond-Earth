import { spaceTargets, debrisPosition, type SpaceTargetId } from './exploration';
import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, BufferGeometry, BufferAttribute, Color, Group, InstancedMesh, Object3D, ShaderMaterial } from 'three';

/** Optional cinematic scenery. None of these objects is claimed to be observed at K2-18. */
function Galaxy({id,onSelect}:{id:SpaceTargetId;onSelect:(id:SpaceTargetId)=>void}) {
 const object=spaceTargets.find(t=>t.id===id)!;
 const geometry=useMemo(()=>{
  const g=new BufferGeometry(),positions=new Float32Array(2300*3),colors=new Float32Array(2300*3);
  for(let i=0;i<2300;i++){
   const f=(i+.5)/2300,r=Math.sqrt(f)*object.radius,angle=r*1.15+(i%3)*Math.PI*2/3+Math.sin(i*13.3)*.17;
   positions.set([Math.cos(angle)*r,Math.sin(i*2.4)*(.08+r*.035),Math.sin(angle)*r],i*3);
   const color=new Color().lerpColors(new Color('#ffe5b3'),new Color('#659cdd'),f);colors.set([color.r,color.g,color.b],i*3);
  }
  g.setAttribute('position',new BufferAttribute(positions,3));g.setAttribute('color',new BufferAttribute(colors,3));return g;
 },[object]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <group position={[...object.position]} rotation={[.7,.3,.4]}>
  <points geometry={geometry}><pointsMaterial size={.07} vertexColors transparent opacity={.85} depthWrite={false}/></points>
  <mesh onClick={e=>{e.stopPropagation();onSelect(id);}}><sphereGeometry args={[object.radius,12,8]}/><meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false}/></mesh>
  <mesh><sphereGeometry args={[.22,16,12]}/><meshBasicMaterial color='#ffe3b8'/></mesh>
 </group>;
}
function DustVeil({position}:{position:[number,number,number]}){
 const material=useMemo(()=>new ShaderMaterial({transparent:true,depthWrite:false,blending:AdditiveBlending,
  vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec2 v;float n(vec2 p){return sin(p.x+sin(p.y*1.7))*sin(p.y*.7+sin(p.x*1.3));}void main(){vec2 p=v*9.;float f=n(p)*.5+n(p*2.1)*.2+n(p*4.3)*.1;float band=exp(-pow((v.y-.5+sin(v.x*8.)*.12)*7.,2.));float edge=smoothstep(0.,.2,v.x)*(1.-smoothstep(.8,1.,v.x));float a=band*edge*(.5+f)*.38;gl_FragColor=vec4(mix(vec3(.11,.19,.37),vec3(.41,.23,.20),v.x),a);}`,
 }),[]);
 useEffect(()=>()=>material.dispose(),[material]);
 return <Billboard position={position}><mesh material={material} rotation={[0,0,.3]}><planeGeometry args={[150,90]}/></mesh></Billboard>;
}
function Debris(){
 const ref=useRef<InstancedMesh>(null);
 useEffect(()=>{
  if(!ref.current)return;const transform=new Object3D();
  for(let i=0;i<90;i++){
   transform.position.set(...debrisPosition(i));
   transform.rotation.set(i*.73,i*.37,i*1.1);const s=.018+(i%7)*.012;
   transform.scale.set(s*1.5,s,s*.8);transform.updateMatrix();ref.current.setMatrixAt(i,transform.matrix);
   ref.current.setColorAt(i,new Color(i%3?'#6d747d':'#aa9280'));
  }
  ref.current.instanceMatrix.needsUpdate=true;ref.current.computeBoundingSphere();if(ref.current.instanceColor)ref.current.instanceColor.needsUpdate=true;
 },[]);
 return <instancedMesh ref={ref} args={[undefined,undefined,90]}><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial roughness={1}/></instancedMesh>;
}
function Comet({onSelect}:{onSelect:(id:SpaceTargetId)=>void}){
 const group=useRef<Group>(null);
 useFrame(({clock})=>{if(group.current){const t=(clock.elapsedTime*.14)%10;group.current.position.set(-16+t*3.2,5-t*.4,-28);}});
 return <group ref={group}>
  <mesh onClick={e=>{e.stopPropagation();onSelect('comet');}}><icosahedronGeometry args={[.12,2]}/><meshBasicMaterial color='#d9edf3'/></mesh>
  <Billboard><mesh position={[-.85,.08,0]} rotation={[0,0,-.08]}><planeGeometry args={[1.8,.25]}/><shaderMaterial transparent depthWrite={false} blending={AdditiveBlending} vertexShader={'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}'} fragmentShader={'varying vec2 v;void main(){float a=pow(v.x,2.)*exp(-pow((v.y-.5)*7.,2.));gl_FragColor=vec4(.35,.65,.85,a*.23);}'}/></mesh></Billboard>
 </group>;
}
export function CosmicScenery({onSelect}:{onSelect:(id:SpaceTargetId)=>void}){return <group>
 {[ [0,0,-85],[0,0,85],[85,0,0],[-85,0,0],[0,85,0],[0,-85,0] ].map((position,i)=><DustVeil key={i} position={position as [number,number,number]}/>)}
 {spaceTargets.filter(t=>t.id.startsWith('galaxy')).map(t=><Galaxy key={t.id} id={t.id} onSelect={onSelect}/>)}<Debris/><mesh position={[3,-2,-2]} onClick={e=>{e.stopPropagation();onSelect('fragment');}}><dodecahedronGeometry args={[.2,1]}/><meshStandardMaterial color='#8d8174' roughness={.98}/></mesh><Comet onSelect={onSelect}/>
 </group>;}
