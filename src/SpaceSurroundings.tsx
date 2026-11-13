import type { SpaceTargetId } from './exploration';
import { Billboard, Html } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, ShaderMaterial } from 'three';

/** Known objects, artistic appearance and positions. Not a sky ephemeris. */
export function SpaceSurroundings({onSelect}:{onSelect:(id:SpaceTargetId)=>void}){
 const band=useMemo(()=>{
  const g=new BufferGeometry(),positions=new Float32Array(1800*3),colors=new Float32Array(1800*3);
  for(let i=0;i<1800;i++){
   const angle=i*2.399963,spread=Math.sin(i*12.9898)*Math.sin(i*4.13)*.12,r=72+(i%19);
   positions.set([Math.cos(angle)*r,spread*r,Math.sin(angle)*r],i*3);
   const c=new Color(i%7===0?'#e4c7a3':i%3===0?'#9cb6d4':'#778aaf');c.multiplyScalar(.45+(i%5)*.1);colors.set([c.r,c.g,c.b],i*3);
  }
  g.setAttribute('position',new BufferAttribute(positions,3));g.setAttribute('color',new BufferAttribute(colors,3));return g;
 },[]);
 const star=useMemo(()=>new ShaderMaterial({
  vertexShader:`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 p;void main(){float grain=sin(p.x*140.+sin(p.y*80.))*sin(p.z*100.+p.y*130.);vec3 color=mix(vec3(1.,.27,.08),vec3(1.,.72,.37),.55+grain*.12);gl_FragColor=vec4(color,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }`,
 }),[]);
 const halo=useMemo(()=>new ShaderMaterial({transparent:true,depthWrite:false,blending:AdditiveBlending,
  vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec2 v;void main(){float r=length(v-.5)*2.;float a=pow(max(0.,1.-r),4.);gl_FragColor=vec4(1.,.24,.07,a*.65);}`,
 }),[]);
 const companion=useMemo(()=>new ShaderMaterial({
  vertexShader:`varying vec3 p;varying vec3 n;void main(){p=position;n=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 p;varying vec3 n;void main(){float broad=sin(p.x*18.+sin(p.z*23.))*sin(p.y*20.-p.z*11.);float fine=sin(p.x*86.+p.z*49.)*sin(p.y*92.-p.x*39.);float ridges=abs(sin(p.x*38.+p.y*27.+sin(p.z*15.)));float light=.25+max(0.,dot(normalize(n),normalize(vec3(-1.,.6,.4))))*.9;float terrain=clamp(broad*.28+fine*.10+ridges*.16+.46,0.,1.);vec3 color=mix(vec3(.18,.14,.12),vec3(.58,.46,.34),terrain)*light;gl_FragColor=vec4(color,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }`,
 }),[]);
 useEffect(()=>()=>{band.dispose();star.dispose();halo.dispose();companion.dispose();},[band,star,halo,companion]);
 return <group>
  <points geometry={band} rotation={[.42,0,.35]}><pointsMaterial size={.10} vertexColors transparent opacity={.7} depthWrite={false} sizeAttenuation/></points>
  <group position={[-6,3.5,-13]}>
   <mesh material={star} onClick={e=>{e.stopPropagation();onSelect('star');}}><sphereGeometry args={[.85,40,24]}/></mesh>

   <Billboard><mesh material={halo} renderOrder={-1}><planeGeometry args={[5,5]}/></mesh></Billboard>
   <Html position={[0,-1.25,0]} center style={{pointerEvents:'none'}}><span className='space-label'>K2-18 · estrela</span></Html>
  </group>
  <group position={[5,2.6,-9]}>
   <mesh material={companion} onClick={e=>{e.stopPropagation();onSelect('c');}}><sphereGeometry args={[.48,96,64]}/></mesh>
   <Html occlude position={[0,-.85,0]} center style={{pointerEvents:'none'}}><span className='space-label'>K2-18 c</span></Html>
  </group>
 </group>;
}

