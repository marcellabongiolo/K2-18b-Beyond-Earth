import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, Color, Group, InstancedMesh, Object3D, ShaderMaterial } from 'three';

/** Optional cinematic scenery. None of these objects is claimed to be observed at K2-18. */
function Galaxy({position,scale,angle}:{position:[number,number,number];scale:number;angle:number}) {
 const material=useMemo(()=>new ShaderMaterial({transparent:true,depthWrite:false,blending:AdditiveBlending,
  uniforms:{angle:{value:angle}},
  vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec2 v;uniform float angle;void main(){vec2 q=(v-.5)*2.;q=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*q;q.y*=1.8;float r=length(q);float a=atan(q.y,q.x);float arms=pow(.5+.5*cos(a*3.-r*13.),4.);float disk=exp(-r*4.)*(1.-smoothstep(.2,1.,r));float core=exp(-r*24.);float dust=.7+.3*sin(q.x*167.+sin(q.y*123.));vec3 color=vec3(.28,.40,.64)*disk*(.3+arms)*dust+vec3(1.,.79,.5)*core;gl_FragColor=vec4(color,clamp(disk*.7+core,0.,1.));}`,
 }),[angle]);
 useEffect(()=>()=>material.dispose(),[material]);
 return <Billboard position={position}><mesh material={material} scale={[scale,scale,1]}><planeGeometry args={[1,1]}/></mesh></Billboard>;
}
function DustVeil(){
 const material=useMemo(()=>new ShaderMaterial({transparent:true,depthWrite:false,blending:AdditiveBlending,
  vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec2 v;float n(vec2 p){return sin(p.x+sin(p.y*1.7))*sin(p.y*.7+sin(p.x*1.3));}void main(){vec2 p=v*9.;float f=n(p)*.5+n(p*2.1)*.2+n(p*4.3)*.1;float band=exp(-pow((v.y-.5+sin(v.x*8.)*.12)*7.,2.));float edge=smoothstep(0.,.2,v.x)*(1.-smoothstep(.8,1.,v.x));float a=band*edge*(.5+f)*.19;gl_FragColor=vec4(mix(vec3(.11,.19,.37),vec3(.41,.23,.20),v.x),a);}`,
 }),[]);
 useEffect(()=>()=>material.dispose(),[material]);
 return <Billboard position={[0,0,-85]}><mesh material={material} rotation={[0,0,.3]}><planeGeometry args={[150,90]}/></mesh></Billboard>;
}
function Debris(){
 const ref=useRef<InstancedMesh>(null);
 useEffect(()=>{
  if(!ref.current)return;const transform=new Object3D();
  for(let i=0;i<90;i++){
   const angle=i*2.399963,r=6+(i%17)*.55;
   transform.position.set(Math.sin(angle)*r,Math.cos(i*1.7)*4,-3-Math.abs(Math.cos(angle))*r);
   transform.rotation.set(i*.73,i*.37,i*1.1);const s=.018+(i%7)*.012;
   transform.scale.set(s*1.5,s,s*.8);transform.updateMatrix();ref.current.setMatrixAt(i,transform.matrix);
   ref.current.setColorAt(i,new Color(i%3?'#6d747d':'#aa9280'));
  }
  ref.current.instanceMatrix.needsUpdate=true;ref.current.computeBoundingSphere();if(ref.current.instanceColor)ref.current.instanceColor.needsUpdate=true;
 },[]);
 return <instancedMesh ref={ref} args={[undefined,undefined,90]}><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial roughness={1}/></instancedMesh>;
}
function Comet(){
 const group=useRef<Group>(null);
 useFrame(({clock})=>{if(group.current){const t=(clock.elapsedTime*.14)%10;group.current.position.set(-16+t*3.2,5-t*.4,-28);}});
 return <group ref={group}>
  <mesh><icosahedronGeometry args={[.055,1]}/><meshBasicMaterial color='#d9edf3'/></mesh>
  <Billboard><mesh position={[-.85,.08,0]} rotation={[0,0,-.08]}><planeGeometry args={[1.8,.25]}/><shaderMaterial transparent depthWrite={false} blending={AdditiveBlending} vertexShader={'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}'} fragmentShader={'varying vec2 v;void main(){float a=pow(v.x,2.)*exp(-pow((v.y-.5)*7.,2.));gl_FragColor=vec4(.35,.65,.85,a*.23);}'}/></mesh></Billboard>
 </group>;
}
export function CosmicScenery(){return <group><DustVeil/><Galaxy position={[-20,9,-65]} scale={15} angle={.4}/><Galaxy position={[24,-9,-75]} scale={11} angle={-.6}/><Galaxy position={[13,19,-80]} scale={7} angle={1.2}/><Debris/><Comet/></group>;}

