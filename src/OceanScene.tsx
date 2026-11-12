import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { useRef } from 'react';
import { Group } from 'three';
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
function SeabedDetails() { return <group>
 {Array.from({length:34},(_,i)=>{const x=((i*17)%29-14)*0.72, z=-1-(i*11%19)*0.55, size=0.18+(i%5)*0.13;return <mesh key={i} position={[x,-2.97+size*0.2,z]} rotation={[0,i*1.37,0]}><dodecahedronGeometry args={[size,0]}/><meshStandardMaterial color={i%3===0?'#245966':'#173d4b'} roughness={1}/></mesh>;})}
 {Array.from({length:9},(_,i)=><group key={i} position={[(i-4)*1.9,-2.92,-4-(i%3)]}><mesh><cylinderGeometry args={[0.06,0.23,0.8+(i%3)*0.3,7]}/><meshStandardMaterial color='#245763' roughness={0.95}/></mesh><pointLight position={[0,0.65,0]} intensity={0.7} color='#35b4aa' distance={2}/></group>)}
 </group>; }
function FictionalOrganisms() { return <>
 {Array.from({length:12},(_,i)=><Float key={i} speed={0.7+(i%3)*0.2} floatIntensity={0.65} rotationIntensity={0.2}><mesh position={[(i%4-1.5)*2.1,Math.sin(i*2)*1.6-0.4,-2-(i%3)*1.4]}><icosahedronGeometry args={[0.1+(i%3)*0.07,1]}/><meshStandardMaterial color={i%2?'#73f7df':'#84aaff'} emissive={i%2?'#1ed6b3':'#446cf4'} emissiveIntensity={2.2} transparent opacity={0.85}/></mesh></Float>)}
 </>; }
export function OceanScene({state}: {state: OceanState}) { return <div className="ocean-canvas" role="img" aria-label="Simulação artística de um oceano hipotético, com sonda subaquática e organismos fictícios luminosos"><Canvas camera={{position:[0,1.3,6.5],fov:52}} dpr={[1,1.6]}>
  <color attach="background" args={['#031624']}/><fog attach="fog" args={['#06263c',3,17]}/><hemisphereLight args={['#79c8ec','#052031',0.7]}/><ambientLight intensity={0.24} color="#4b9ec9"/><directionalLight position={[2,6,3]} intensity={2.1} color="#4b9ed5"/>
  <Sparkles count={310} scale={[18,10,13]} size={2} speed={0.35} opacity={0.5} color="#89d9e8"/><FictionalOrganisms/><SeabedDetails/><Submersible heading={state.heading}/>
  <mesh position={[0,-3.1,-3]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[40,40,30,30]}/><meshStandardMaterial color="#0c394b" roughness={0.94}/></mesh>
 </Canvas></div>; }
