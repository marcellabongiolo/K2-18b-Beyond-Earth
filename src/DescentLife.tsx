import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, Group } from 'three';
import { GLIDER_COUNT, gliderPose } from './gliders';

/** Fictional fauna in world space: normal depth testing preserves occlusion. */
function Glider({index}: {index: number}) {
 const ref = useRef<Group>(null);
 const wingL = useRef<Group>(null), wingR = useRef<Group>(null);
 const initial = gliderPose(index, 0);
 useFrame(({clock}) => {
  const pose = gliderPose(index, clock.elapsedTime);
  if (ref.current) {
   ref.current.position.set(pose.x, pose.y, pose.z);
   ref.current.rotation.set(0, pose.yaw, pose.bank);
  }
  if (wingL.current) wingL.current.rotation.y = pose.flap;
  if (wingR.current) wingR.current.rotation.y = -pose.flap;
 });
 return <group ref={ref} position={[initial.x,initial.y,initial.z]} scale={initial.scale}>
  {([-1,1] as const).map(side => <group key={side} ref={side === -1 ? wingL : wingR} position={[side*0.025,0,0]}>
   <mesh position={[side*0.075,0,0]} rotation={[0,0,-side*0.22]} scale={[0.105,0.031,0.009]}>
    <sphereGeometry args={[1,24,12]}/>
    <meshPhysicalMaterial color={index%3===0?'#718e99':'#bad5c4'} roughness={0.68} metalness={0.02} side={DoubleSide}/>
   </mesh>
   <mesh position={[side*0.072,0,0.006]} rotation={[0,0,-side*0.22]} scale={[0.095,0.003,0.003]}>
    <sphereGeometry args={[1,12,6]}/><meshStandardMaterial color='#4b6866' roughness={0.8}/>
   </mesh>
  </group>)}
  <mesh rotation={[Math.PI/2,0,0]}><capsuleGeometry args={[0.014,0.105,4,10]}/><meshStandardMaterial color='#496c67' roughness={0.82}/></mesh>
  <mesh position={[0,0.027,0.012]} scale={[0.008,0.008,0.005]}><sphereGeometry args={[1,10,8]}/><meshStandardMaterial color='#b9dbca' emissive='#497965' emissiveIntensity={0.18}/></mesh>
 </group>;
}
export function DescentLife() {
 return <group>{Array.from({length:GLIDER_COUNT},(_,i)=><Glider key={i} index={i}/>)}</group>;
}
