import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group, AdditiveBlending, BackSide } from 'three';
/** Hypothetical atmospheric haze; not measured clouds on K2-18 b. */
export function Atmosphere({ active }: { active: boolean }) {
 const group = useRef<Group>(null);
 useFrame(({ clock }) => { if(group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.09) * 0.025; });
 if (!active) return null;
 return <group ref={group}>
   <mesh><sphereGeometry args={[1.96, 96, 64]}/><meshBasicMaterial color="#72b6dd" side={BackSide} transparent opacity={0.17} depthWrite={false} blending={AdditiveBlending}/></mesh>
   <mesh rotation={[0.4,0.2,0.1]}><torusGeometry args={[1.93,0.075,12,128]}/><meshBasicMaterial color="#a4e4ed" transparent opacity={0.12} depthWrite={false}/></mesh>
   <mesh rotation={[-0.25,0.9,0.5]}><torusGeometry args={[1.88,0.12,12,128]}/><meshBasicMaterial color="#9ec9e3" transparent opacity={0.09} depthWrite={false}/></mesh>
 </group>;
}
