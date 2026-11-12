import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, Group } from 'three';

/** Fictional gliding organisms seen only in the simulated descent. */
export function DescentLife() {
 const swarm = useRef<Group>(null);
 useFrame(({clock}) => {
  if (!swarm.current) return;
  swarm.current.rotation.y = Math.sin(clock.elapsedTime*0.22)*0.09;
  swarm.current.position.x = Math.sin(clock.elapsedTime*0.18)*0.08;
 });
 return <group ref={swarm}>
  {Array.from({length:7},(_,i)=>{
   const a=i*2.39996;
   const radius=0.24+(i%4)*0.13;
   const x=Math.sin(a)*radius;
   const y=Math.cos(a)*radius*0.62;
   const z=1.82+(i%3)*0.085;
   const size=0.048+(i%3)*0.018;
   return <group key={i} position={[x,y,z]} rotation={[0,0,a*0.24]}>
    <mesh rotation={[0,0,0.45]} position={[-size*0.8,0,0]}>
     <sphereGeometry args={[size*1.6,size*0.23,size*0.11,12,8]}/>
     <meshPhysicalMaterial color='#b6d7c5' metalness={0.12} roughness={0.48} transparent opacity={0.85} side={DoubleSide}/>
    </mesh>
    <mesh rotation={[0,0,-0.45]} position={[size*0.8,0,0]}>
     <sphereGeometry args={[size*1.6,size*0.23,size*0.11,12,8]}/>
     <meshPhysicalMaterial color='#b6d7c5' metalness={0.12} roughness={0.48} transparent opacity={0.85} side={DoubleSide}/>
    </mesh>
    <mesh rotation={[Math.PI/2,0,0]}><capsuleGeometry args={[size*0.15,size*1.4,4,8]}/>
     <meshStandardMaterial color='#7fa9a0' roughness={0.8}/></mesh>
   </group>;
  })}
 </group>;
}
