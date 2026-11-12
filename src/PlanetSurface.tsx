import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BackSide, CanvasTexture, Group, SRGBColorSpace, DoubleSide } from 'three';
import { createPlanetTexture } from './planetTexture';
/** Fictional atmospheric appearance, deliberately not a scientific reconstruction. */
export function PlanetSurface() {
 const surface = useRef<Group>(null), clouds = useRef<Group>(null), highClouds = useRef<Group>(null);
 const texture = useMemo(() => { const t = new CanvasTexture(createPlanetTexture()); t.colorSpace = SRGBColorSpace; t.anisotropy = 4; return t; }, []);
 useFrame((_, delta) => { if (surface.current) surface.current.rotation.y += delta * 0.018; if (clouds.current) clouds.current.rotation.y += delta * 0.027; if (highClouds.current) highClouds.current.rotation.y -= delta * 0.009; });
 return <group rotation={[0.17, 0, -0.12]}>
  <group ref={surface}><mesh><sphereGeometry args={[1.7, 128, 96]}/><meshStandardMaterial map={texture} roughness={0.94} metalness={0}/></mesh></group>
  <group ref={clouds}><mesh rotation={[0,0.35,0]}><sphereGeometry args={[1.727, 128, 96]}/><meshStandardMaterial map={texture} color="#b3d5e6" transparent opacity={0.23} roughness={1} depthWrite={false}/></mesh></group>
  <group ref={highClouds}><mesh rotation={[0.24,0.55,0]}><sphereGeometry args={[1.745,96,64]}/><meshStandardMaterial map={texture} color='#a3c8da' transparent opacity={0.075} roughness={1} depthWrite={false}/></mesh></group>
  <mesh><sphereGeometry args={[1.81,96,64]}/><meshBasicMaterial color="#58b6f0" transparent opacity={0.16} side={BackSide} blending={AdditiveBlending} depthWrite={false}/></mesh>
  <mesh rotation={[0.4,0.3,0]}><torusGeometry args={[1.78,0.022,12,180]}/><meshBasicMaterial color='#87d7ef' transparent opacity={0.13} side={DoubleSide} depthWrite={false}/></mesh>
  <mesh><sphereGeometry args={[1.91,96,64]}/><meshBasicMaterial color="#2b80b4" transparent opacity={0.045} side={BackSide} blending={AdditiveBlending} depthWrite={false}/></mesh>
 </group>;
}
