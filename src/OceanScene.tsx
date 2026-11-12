import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { Group, PlaneGeometry, DoubleSide, ACESFilmicToneMapping, SRGBColorSpace, ShaderMaterial, AdditiveBlending } from 'three';
import { useMemo, useRef } from 'react';
import type { OceanState } from './ocean';
function Submersible({ heading }: { heading: number }) {
 const group = useRef<Group>(null);
 useFrame(({clock})=>{if(group.current) group.current.position.y=Math.sin(clock.elapsedTime*0.65)*0.12;});
 return <group ref={group} rotation={[0, heading*Math.PI/180, 0]} position={[0,-0.25,0]}>
  <mesh><capsuleGeometry args={[0.35,1.1,8,16]}/><meshStandardMaterial color="#d8e8f2" metalness={0.72} roughness={0.22}/></mesh>
  <mesh position={[0,0.08,0.4]}><sphereGeometry args={[0.26,24,16]}/><meshStandardMaterial color="#1d8bb8" emissive="#07577d" emissiveIntensity={0.45} metalness={0.35}/></mesh>
  {[-1,1].map(side=><mesh key={side} position={[side*0.55,-0.2,0]}><boxGeometry args={[0.5,0.08,0.72]}/><meshStandardMaterial color="#9db9c8" metalness={0.7}/></mesh>)}
  <spotLight position={[0,-0.1,1]} angle={0.35} penumbra={0.85} intensity={15} color="#8eeaff" distance={12}/>
  <pointLight position={[0,0.4,0]} intensity={3} color="#4cc8f4" distance={6}/>
 </group>;
}
function OceanSurface() {
 const surface = useRef<Group>(null);
 useFrame(({clock})=>{if(surface.current){surface.current.position.y=2.6+Math.sin(clock.elapsedTime*0.38)*0.06;surface.current.rotation.z=Math.sin(clock.elapsedTime*0.17)*0.012;}});
 return <group ref={surface} position={[0,2.6,0]}><mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[40,40,50,50]}/><meshPhysicalMaterial color='#1e667a' transparent opacity={0.28} roughness={0.17} metalness={0.08} clearcoat={0.9} clearcoatRoughness={0.13} side={DoubleSide} depthWrite={false}/></mesh></group>;
}
function Terrain() {
 const geometry = useMemo(() => {
  const g = new PlaneGeometry(44, 44, 72, 72);
  const p = g.attributes.position;
  for(let i=0;i<p.count;i++) {
   const x=p.getX(i), y=p.getY(i);
   const h=Math.sin(x*0.61)*Math.cos(y*0.43)*0.38 + Math.sin(x*1.8+y*0.7)*0.13 + Math.cos(y*2.3-x*0.9)*0.1;
   p.setZ(i,h);
  }
  g.computeVertexNormals(); return g;
 }, []);
 return <mesh position={[0,-3.05,-3]} rotation={[-Math.PI/2,0,0]} geometry={geometry}><meshStandardMaterial color="#123c47" roughness={0.97} metalness={0.03} flatShading side={DoubleSide}/></mesh>;
}
function SeafloorSediment() { return <group>
 {Array.from({length:90},(_,i)=>{const x=((i*37)%89-44)*0.21,z=-1-((i*23)%79)*0.16;const size=0.015+(i%4)*0.009;return <mesh key={i} position={[x,-2.89+Math.sin(x*0.61)*Math.cos(z*0.43)*0.35,z]} rotation={[i*0.7,i*0.3,0]}><icosahedronGeometry args={[size,0]}/><meshStandardMaterial color={i%3===0?'#5b7c7e':'#2c5860'} roughness={1}/></mesh>;})}
 </group>; }
function CausticLight() {
 const material = useMemo(() => new ShaderMaterial({
  uniforms: { uTime: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform float uTime; varying vec2 vUv;
   void main() {
    vec2 p = vUv * 18.0;
    float a = sin(p.x * 1.3 + sin(p.y * 0.8 + uTime * 0.25) * 2.0 + uTime * 0.33);
    float b = sin(p.y * 1.5 + sin(p.x * 0.7 - uTime * 0.31) * 1.8 - uTime * 0.24);
    float c = sin((p.x+p.y) * 0.8 + uTime * 0.19);
    float lines = pow(max(0.0, (a+b+c)/3.0), 8.0);
    float fade = smoothstep(0.0,0.16,vUv.x) * (1.0-smoothstep(0.84,1.0,vUv.x)) *
                 smoothstep(0.0,0.16,vUv.y) * (1.0-smoothstep(0.84,1.0,vUv.y));
    gl_FragColor = vec4(vec3(0.20,0.70,0.81), lines * fade * 0.19);
   }`,
  transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide,
 }), []);
 useFrame(({clock}) => { material.uniforms.uTime.value = clock.elapsedTime; });
 return <mesh position={[0,-2.94,-3]} rotation={[-Math.PI/2,0,0]} material={material}>
  <planeGeometry args={[37,37,1,1]}/>
 </mesh>;
}
function LightShafts() { return <group>
 {Array.from({length:6},(_,i)=><mesh key={i} position={[(i-2.5)*2.1,1,-4-i*0.3]} rotation={[0,0,0.14+(i%2)*0.08]}><coneGeometry args={[0.8,9,20,1,true]}/><meshBasicMaterial color="#65b9d5" transparent opacity={0.018} depthWrite={false} side={DoubleSide}/></mesh>)}
 </group>; }
function SeabedDetails() { return <group>
 {Array.from({length:34},(_,i)=>{const x=((i*17)%29-14)*0.72, z=-1-(i*11%19)*0.55, size=0.18+(i%5)*0.13;return <mesh key={i} position={[x,-2.97+size*0.2,z]} rotation={[0,i*1.37,0]}><dodecahedronGeometry args={[size,0]}/><meshStandardMaterial color={i%3===0?'#245966':'#173d4b'} roughness={1}/></mesh>;})}
 {Array.from({length:9},(_,i)=><group key={i} position={[(i-4)*1.9,-2.92,-4-(i%3)]}><mesh><cylinderGeometry args={[0.06,0.23,0.8+(i%3)*0.3,7]}/><meshStandardMaterial color='#245763' roughness={0.95}/></mesh><pointLight position={[0,0.65,0]} intensity={0.7} color='#35b4aa' distance={2}/></group>)}
 </group>; }
function FictionalOrganisms() { return <>
 {Array.from({length:12},(_,i)=><Float key={i} speed={0.7+(i%3)*0.2} floatIntensity={0.65} rotationIntensity={0.2}><mesh position={[(i%4-1.5)*2.1,Math.sin(i*2)*1.6-0.4,-2-(i%3)*1.4]}><icosahedronGeometry args={[0.1+(i%3)*0.07,1]}/><meshStandardMaterial color={i%2?'#73f7df':'#84aaff'} emissive={i%2?'#1ed6b3':'#446cf4'} emissiveIntensity={2.2} transparent opacity={0.85}/></mesh></Float>)}
 </>; }
export function OceanScene({state}: {state: OceanState}) { return <div className="ocean-canvas" role="img" aria-label="Simulação artística de um oceano hipotético, com sonda subaquática e organismos fictícios luminosos"><Canvas camera={{position:[0,1.3,6.5],fov:52}} dpr={[1,1.6]} gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, outputColorSpace: SRGBColorSpace }}>
  <color attach="background" args={['#031624']}/><fog attach="fog" args={['#06263c',4,21]}/><hemisphereLight args={['#79c8ec','#052031',0.7]}/><ambientLight intensity={0.24} color="#4b9ec9"/><directionalLight position={[2,6,3]} intensity={2.8} color="#83c4e0"/>
  <Sparkles count={370} scale={[18,10,13]} size={2} speed={0.35} opacity={0.5} color="#89d9e8"/><FictionalOrganisms/><OceanSurface/><LightShafts/><Terrain/><CausticLight/><SeafloorSediment/><SeabedDetails/><Submersible heading={state.heading}/>

 </Canvas></div>; }
