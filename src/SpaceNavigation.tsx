import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Vector3 } from 'three';
import type { OrbitControls as Controls } from 'three-stdlib';
import { targetCameraDistance, targetPosition, type SpaceTargetId } from './exploration';
import { spaceCameraDistance } from './mission';
import type { FlightPhase } from './descent';
export function SpaceNavigation({focus,phase,distance,systemView}:{focus:SpaceTargetId;phase:FlightPhase;distance:number;systemView:boolean}){
 const controls=useRef<Controls>(null),center=useRef(new Vector3());
 const next=useRef(new Vector3()),offset=useRef(new Vector3());
 useFrame(({camera,clock},delta)=>{
  const a=1-Math.exp(-delta*2.5);
  next.current.set(...targetPosition(focus,clock.elapsedTime));
  offset.current.copy(next.current).sub(center.current).multiplyScalar(a);
  center.current.add(offset.current);camera.position.add(offset.current);
  const radius=focus==='b'?spaceCameraDistance(distance,phase,systemView):targetCameraDistance(focus,distance);
  if(phase==='descent'&&focus==='b')next.current.set(.1,.2,radius);
  else next.current.copy(camera.position).sub(center.current).normalize().multiplyScalar(radius).add(center.current);
  camera.position.lerp(next.current,a);
  if(controls.current)controls.current.target.copy(center.current);
  camera.lookAt(center.current);
 });
 return <OrbitControls ref={controls} enabled={phase==='orbit'} enablePan={false} enableZoom={false} enableDamping dampingFactor={.045}/>;
}
