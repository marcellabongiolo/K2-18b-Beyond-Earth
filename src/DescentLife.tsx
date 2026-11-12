import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, Group } from 'three';

/** Fictional gliding fauna for a speculative cinematic descent, not detected life. */
function Glider({index}: {index: number}) {
 const ref = useRef<Group>(null);
 const wingL = useRef<Group>(null), wingR = useRef<Group>(null);
 const angle=index*2.39996;
 const radius=0.27+(index%4)*0.14;
 const scale=0.65+(index%3)*0.22;
 useFrame(({clock}) => {
  const t=clock.elapsedTime;
  if (ref.current) {
   ref.current.position.set(
    Math.sin(angle)*radius+Math.sin(t*(0.18+index*0.009)+angle)*0.10,
    Math.cos(angle)*radius*0.62+Math.sin(t*(0.4+index*0.027)+angle)*0.07,
    1.82+(index%3)*0.09+Math.sin(t*0.21+angle)*0.035
   );
   ref.current.rotation.z=Math.sin(t*0.24+angle)*0.16;
   ref.current.rotation.y=Math.sin(t*0.17+angle)*0.24;
  }
  const flap=Math.sin(t*(1.8+index*0.13)+angle)*0.24;
  if(wingL.current) wingL.current.rotation.y=flap;
  if(wingR.current) wingR.current.rotation.y=-flap;
 });
 return <group ref={ref} scale={scale}>
  <group ref={wingL} position={[-0.028,0,0]} rotation={[0,0,0.25]}>
   <mesh position={[-0.075,0,0]} rotation={[0,0,0.38]}>
    <sphereGeometry args={[0.13,0.024,0.008,16,8]}/>
    <meshPhysicalMaterial color='#b6d7c5' metalness={0.06} roughness={0.64} transparent opacity={0.89} side={DoubleSide}/>
   </mesh>
  </group>
  <group ref={wingR} position={[0.028,0,0]} rotation={[0,0,-0.25]}>
   <mesh position={[0.075,0,0]} rotation={[0,0,-0.38]}>
    <sphereGeometry args={[0.13,0.024,0.008,16,8]}/>
    <meshPhysicalMaterial color='#b6d7c5' metalness={0.06} roughness={0.64} transparent opacity={0.89} side={DoubleSide}/>
   </mesh>
  </group>
  <mesh rotation={[Math.PI/2,0,0]}>
   <capsuleGeometry args={[0.012,0.105,4,8]}/>
   <meshStandardMaterial color='#6f9b93' roughness={0.82}/>
  </mesh>
 </group>;
}
export function DescentLife() {
 return <group>{Array.from({length:7},(_,i)=><Glider key={i} index={i}/>)}</group>;
}
