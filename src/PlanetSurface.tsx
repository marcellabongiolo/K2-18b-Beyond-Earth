import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BackSide, CanvasTexture, Group, SRGBColorSpace, ShaderMaterial } from 'three';
import { createPlanetTexture, createCloudTexture } from './planetTexture';

/** Stylized scattering, not a measured atmospheric model of K2-18 b. */
function AtmosphereGlow() {
 const material = useMemo(() => new ShaderMaterial({
  uniforms: { glowColor: { value: [0.16, 0.49, 0.8] }, strength: { value: 0.42 } },
  vertexShader: `varying vec3 vNormal; varying vec3 vView;
   void main() { vec4 worldPosition = modelMatrix * vec4(position,1.0);
   vNormal = normalize(mat3(modelMatrix) * normal);
   vView = normalize(cameraPosition - worldPosition.xyz);
   gl_Position = projectionMatrix * viewMatrix * worldPosition; }`,
  fragmentShader: `uniform vec3 glowColor; uniform float strength;
   varying vec3 vNormal; varying vec3 vView;
   void main() { float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.2);
   float facing = smoothstep(0.0, 0.7, rim);
   gl_FragColor = vec4(glowColor * (0.35 + rim * 1.3), facing * strength); }`,
  transparent: true, depthWrite: false, side: BackSide, blending: AdditiveBlending,
 }), []);
 return <mesh material={material}><sphereGeometry args={[1.79,96,64]}/></mesh>;
}
export function PlanetSurface() {
 const surface = useRef<Group>(null), clouds = useRef<Group>(null), highClouds = useRef<Group>(null);
 const texture = useMemo(() => { const t = new CanvasTexture(createPlanetTexture()); t.colorSpace = SRGBColorSpace; t.anisotropy = 4; return t; }, []);
 const cloudTexture = useMemo(() => { const t = new CanvasTexture(createCloudTexture()); t.colorSpace = SRGBColorSpace; t.anisotropy = 4; return t; }, []);
 useFrame((_, delta) => {
  if (surface.current) surface.current.rotation.y += delta * 0.018;
  if (clouds.current) clouds.current.rotation.y += delta * 0.027;
  if (highClouds.current) highClouds.current.rotation.y -= delta * 0.009;
 });
 return <group rotation={[0.17,0,-0.12]}>
  <group ref={surface}><mesh><sphereGeometry args={[1.7,128,96]}/><meshStandardMaterial map={texture} bumpMap={texture} bumpScale={0.025} roughness={0.92} metalness={0}/></mesh></group>
  <group ref={clouds}><mesh rotation={[0,0.35,0]}><sphereGeometry args={[1.724,128,96]}/><meshStandardMaterial map={cloudTexture} transparent opacity={0.65} roughness={1} depthWrite={false}/></mesh></group>
  <group ref={highClouds}><mesh rotation={[0.24,0.55,0]}><sphereGeometry args={[1.744,96,64]}/><meshStandardMaterial map={cloudTexture} transparent opacity={0.18} roughness={1} depthWrite={false}/></mesh></group>
  <AtmosphereGlow/>
 </group>;
}
