import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group } from 'three';
export function Probe({flare=false}:{flare?:boolean}) {
 const ref = useRef<Group>(null);
 useFrame(({clock}) => { if(ref.current){ref.current.position.y=Math.sin(clock.elapsedTime*0.55)*0.07-0.55;ref.current.rotation.y=Math.sin(clock.elapsedTime*0.23)*0.08;} });
 return <group ref={ref} position={[1.4,-0.55,1.2]} rotation={[0.1,-0.4,-0.13]}>
  <mesh><boxGeometry args={[0.42,0.2,0.8]}/><meshStandardMaterial color="#b8c9d8" metalness={0.75} roughness={0.27}/></mesh>
  <mesh position={[0,0,0.45]}><coneGeometry args={[0.2,0.32,4]}/><meshStandardMaterial color="#d9e7f1" metalness={0.6} roughness={0.3}/></mesh>
  {[-1,1].map(side=><group key={side}><mesh position={[side*0.65,0,0]}><boxGeometry args={[0.78,0.035,0.48]}/><meshStandardMaterial color="#193b68" metalness={0.45} roughness={0.4}/></mesh><mesh position={[side*0.65,0.022,0]}><boxGeometry args={[0.73,0.009,0.43]}/><meshBasicMaterial color={flare?'#ff553a':'#2d76b7'}/></mesh></group>)}
  {flare&&<mesh position={[0,.2,0]}><sphereGeometry args={[.08,12,8]}/><meshBasicMaterial color='#ff1d1d'/></mesh>}
  <pointLight position={[0,0.08,-0.45]} intensity={0.9} color="#67d8ff" distance={2}/>
 </group>;
}
