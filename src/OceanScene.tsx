import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { ACESFilmicToneMapping, AdditiveBlending, Color, DirectionalLight, DoubleSide, Fog, Group, Mesh, Object3D, PlaneGeometry, ShaderMaterial, SRGBColorSpace } from 'three';
import { oceanEnvironment, seabedHeight, type Collection, type OceanState } from './ocean';

const vertex = `varying vec3 vWorld; void main(){vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`;
function Seabed({ depth }: { depth: number }) {
 const geometry = useMemo(() => {
  const g = new PlaneGeometry(64,64,110,110); g.rotateX(-Math.PI/2);
  const p = g.attributes.position;
  for(let i=0;i<p.count;i++) p.setY(i,seabedHeight(p.getX(i),p.getZ(i)));
  g.computeVertexNormals(); return g;
 },[]);
 const material = useMemo(() => new ShaderMaterial({
  uniforms:{time:{value:0},sun:{value:1},fogColor:{value:new Color('#062b39')},range:{value:22}},
  vertexShader:vertex,
  fragmentShader:`varying vec3 vWorld; uniform float time; uniform float sun; uniform vec3 fogColor; uniform float range;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  void main(){vec2 p=vWorld.xz;
   float grain=hash(floor(p*190.));
   float ripple=sin(p.x*23.+sin(p.y*1.4)*1.8)*.5+.5;
   vec3 sand=mix(vec3(.055,.12,.125),vec3(.22,.29,.25),ripple*.28+grain*.22+.2);
   float c=sin(p.x*2.8+sin(p.y*2.+time*.38))+sin(p.y*3.2+sin(p.x*1.7-time*.31));
   float caustic=pow(1.-abs(sin(c*2.6+time*.2)),12.);
   sand*=.38+sun*.38; sand+=vec3(.13,.34,.31)*caustic*sun*.32;
   float distanceToEye=length(cameraPosition-vWorld);
   vec3 color=mix(sand,fogColor,1.-exp(-pow(distanceToEye/range,1.6)));
   gl_FragColor=vec4(color,1.);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`,
 }),[]);
 useEffect(()=>()=>{geometry.dispose();material.dispose();},[geometry,material]);
 const floor=useRef<Mesh>(null);
 useFrame(({clock},delta)=>{
  const env=oceanEnvironment(depth),a=1-Math.exp(-delta*1.4);
  material.uniforms.time.value=clock.elapsedTime;
  material.uniforms.fogColor.value.set('#0a3d4a').lerp(new Color('#020b18'),env.fraction);
  material.uniforms.sun.value+=(env.sunlight-material.uniforms.sun.value)*a;
  material.uniforms.range.value+=(env.visibility-material.uniforms.range.value)*a;
  if(floor.current)floor.current.position.y+=(env.floorHeight-floor.current.position.y)*a;
 });
 return <mesh ref={floor} position={[0,oceanEnvironment(depth).floorHeight,0]} geometry={geometry} material={material}/>;
}
function WaterCeiling({depth}:{depth:number}) {
 const mesh=useRef<Mesh>(null);
 const material=useMemo(()=>new ShaderMaterial({
  uniforms:{time:{value:0},strength:{value:1}},side:DoubleSide,transparent:true,depthWrite:false,
  vertexShader:`varying vec2 uvWater; uniform float time; void main(){uvWater=uv;vec3 p=position;p.z+=sin(p.x*.6+time*.5)*.13+sin(p.y*.8-time*.3)*.09;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
  fragmentShader:`varying vec2 uvWater;uniform float time;uniform float strength;void main(){vec2 p=uvWater*35.;float waves=sin(p.x+sin(p.y+time*.3))*sin(p.y*.8-time*.4);vec3 color=mix(vec3(.025,.19,.24),vec3(.19,.52,.54),waves*.5+.5);gl_FragColor=vec4(color*strength,.48);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }`,
 }),[]);
 useEffect(()=>()=>material.dispose(),[material]);
 useFrame(({clock},delta)=>{const env=oceanEnvironment(depth);material.uniforms.time.value=clock.elapsedTime;material.uniforms.strength.value=0.3+env.sunlight*.3;if(mesh.current)mesh.current.position.y+=(env.surfaceHeight-mesh.current.position.y)*(1-Math.exp(-delta));});
 return <mesh ref={mesh} position={[0,4,0]} rotation={[-Math.PI/2,0,0]} material={material}><planeGeometry args={[70,70,50,50]}/></mesh>;
}
function Lighting({depth}:{depth:number}) {
 const current=useRef(120);
 const rays=useRef<Group>(null);
 const sun=useRef<DirectionalLight>(null);
 useFrame(({scene,clock},delta)=>{
  current.current+=(depth-current.current)*(1-Math.exp(-delta*1.4));
  const env=oceanEnvironment(current.current);
  const water=new Color('#0a3d4a').lerp(new Color('#020b18'),env.fraction);
  (scene.background as Color).copy(water);
  const fog=scene.fog as Fog;fog.color.copy(water);fog.far=env.visibility;fog.near=2;
  if(sun.current)sun.current.intensity=env.sunlight;
  if(rays.current){rays.current.visible=env.fraction<.65;rays.current.rotation.z=Math.sin(clock.elapsedTime*.13)*.025;}
 });
 return <><color attach="background" args={['#083342']}/><fog attach="fog" args={['#083342',2,22]}/>
  <hemisphereLight args={['#69b8c8','#071d28',0.65]}/><ambientLight intensity={0.13} color='#2f758b'/>
  <directionalLight ref={sun} position={[-4,8,1]} color='#a5e0db' intensity={2}/>
  <group ref={rays}>{Array.from({length:5},(_,i)=><mesh key={i} position={[-8+i*3,3,-8-i]} rotation={[0,0,-.22]}><coneGeometry args={[1.1,18,24,1,true]}/><meshBasicMaterial color='#75d2d9' transparent opacity={0.025} depthWrite={false} side={DoubleSide} blending={AdditiveBlending}/></mesh>)}</group>
 </>;
}
function Rocks({depth}:{depth:number}) {
 const ref=useRef<Group>(null);
 useFrame((_,delta)=>{if(ref.current)ref.current.position.y+=(oceanEnvironment(depth).floorHeight-ref.current.position.y)*(1-Math.exp(-delta*1.4));});
 return <group ref={ref} position={[0,-4,0]}>
  {Array.from({length:48},(_,i)=>{const x=((i*17)%47-23)*.72,z=-2-((i*13)%37)*.65,s=.16+(i%6)*.15;return <mesh key={i} position={[x,seabedHeight(x,z)+s*.2,z]} rotation={[i*.31,i*1.37,i*.19]} scale={[1.5,.6+(i%3)*.3,1]}><dodecahedronGeometry args={[s,1]}/><meshStandardMaterial color={i%3===0?'#466365':'#284650'} roughness={.96}/></mesh>;})}
  {[-1,1].map(side=><group key={side} position={[side*8,0,-12]} rotation={[0,side*.4,side*.12]}><mesh scale={[2,5,3]}><dodecahedronGeometry args={[1.5,1]}/><meshStandardMaterial color='#203b46' roughness={1}/></mesh><mesh position={[side*2,0,-5]} scale={[3,7,3]}><dodecahedronGeometry args={[1.3,1]}/><meshStandardMaterial color='#1a343e' roughness={1}/></mesh></group>)}
 </group>;
}
function Jelly({index}:{index:number}) {
 const ref=useRef<Group>(null);
 useFrame(({clock})=>{const t=clock.elapsedTime,p=index*2.4;if(ref.current){ref.current.position.set(2+Math.sin(p)*3+Math.sin(t*.12+p)*.6,.3+Math.cos(p)*1.2+Math.sin(t*.4+p)*.22,-3-index*1.4);ref.current.rotation.z=Math.sin(t*.26+p)*.12;ref.current.scale.setScalar((.5+(index%3)*.16)*(1+Math.sin(t*1.4+p)*.07));}});
 return <group ref={ref}>
  <mesh scale={[.38,.22,.38]}><sphereGeometry args={[1,24,16,0,Math.PI*2,0,Math.PI*.6]}/><meshPhysicalMaterial color='#99d9d3' transparent opacity={.48} roughness={.3} side={DoubleSide} depthWrite={false} emissive='#298c8b' emissiveIntensity={.35}/></mesh>
  <mesh scale={[.12,.08,.12]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color='#b4f1db' emissive='#6ac3b2' emissiveIntensity={.7}/></mesh>
  {Array.from({length:7},(_,j)=><mesh key={j} position={[Math.cos(j*6.28/7)*.17,-.32,Math.sin(j*6.28/7)*.17]} rotation={[Math.sin(j)*.14,0,Math.cos(j)*.12]}><cylinderGeometry args={[.009,.003,.65+(j%3)*.1,5]}/><meshStandardMaterial color='#7cbdbe' transparent opacity={.6} emissive='#24626d' emissiveIntensity={.3}/></mesh>)}
 </group>;
}
function Swimmer({index}:{index:number}) {
 const ref=useRef<Group>(null),tail=useRef<Mesh>(null);
 useFrame(({clock})=>{const t=clock.elapsedTime*.23,p=index*.73;
  if(ref.current){ref.current.position.set(Math.sin(t+p)*4.3+1,Math.sin(p*2)*.7+Math.sin(t*.8+p)*.2,-5-Math.cos(t+p)*2.4-(index%3)*1.3);ref.current.rotation.y=t+p+Math.PI/2;}
  if(tail.current)tail.current.rotation.y=Math.sin(clock.elapsedTime*5+index)*.4;
 });
 return <group ref={ref} scale={.35+(index%4)*.07}>
  <mesh scale={[.11,.17,.45]}><sphereGeometry args={[1,16,10]}/><meshStandardMaterial color={index%3?'#699ba1':'#a2c5b4'} roughness={.54} metalness={.12}/></mesh>
  <mesh ref={tail} position={[0,0,-.43]} rotation={[0,0,Math.PI/2]} scale={[.26,.22,.045]}><coneGeometry args={[1,1,3]}/><meshStandardMaterial color='#4c838e' roughness={.75} side={DoubleSide}/></mesh>
 </group>;
}

function SampleCollector({collection}:{collection:Collection|null}) {
 const arm=useRef<Group>(null),particles=useRef<Group>(null),ring=useRef<Mesh>(null);
 const extension=useRef(0);
 useFrame(({clock},delta)=>{
  const progress=collection?.progress??0;
  const target=collection?Math.sin(Math.PI*(.12+progress*.008))*1.1:0;
  extension.current+=(target-extension.current)*(1-Math.exp(-delta*8));
  if(arm.current){arm.current.scale.y=.1+extension.current;arm.current.visible=extension.current>.01;}
  if(particles.current){particles.current.visible=!!collection&&progress>=30&&progress<90;particles.current.rotation.y=clock.elapsedTime*2;particles.current.position.y=-1.3+(progress/100)*1.2;}
  if(ring.current){ring.current.visible=!!collection;ring.current.scale.setScalar(.4+(progress/100)*1.8);ring.current.rotation.z=clock.elapsedTime*.4;}
 });
 return <group position={[-.26,-.2,0]}>
  <group ref={arm}><mesh position={[0,-.5,0]}><cylinderGeometry args={[.022,.022,1,10]}/><meshStandardMaterial color='#b6c9cb' metalness={.65} roughness={.35}/></mesh><mesh position={[0,-1,0]}><cylinderGeometry args={[.09,.07,.15,12]}/><meshStandardMaterial color='#71b7c0' emissive='#2d9299' emissiveIntensity={.7}/></mesh></group>
  <group ref={particles}>{Array.from({length:12},(_,i)=><mesh key={i} position={[Math.sin(i*2.4)*.16,(i%4)*.05,Math.cos(i*2.4)*.16]}><sphereGeometry args={[.018,6,5]}/><meshBasicMaterial color='#c9f6d9'/></mesh>)}</group>
  <mesh ref={ring} rotation={[Math.PI/2,0,0]} position={[0,-.9,0]}><torusGeometry args={[.3,.008,6,40]}/><meshBasicMaterial color='#7ee9d1' transparent opacity={.6} depthWrite={false}/></mesh>
 </group>;
}

function Submersible({samples,collection}:{samples:number;collection:Collection|null}) {
 const ref=useRef<Group>(null);
 const beamTarget=useMemo(()=>{const target=new Object3D();target.position.set(0,-2.5,-8);return target;},[]);
 useFrame(({clock})=>{if(ref.current){ref.current.position.y=-.4+Math.sin(clock.elapsedTime*.55)*.06;ref.current.rotation.z=Math.sin(clock.elapsedTime*.4)*.025;}});
 return <group ref={ref} position={[2,-.4,1]} rotation={[0,-.3,0]}>
  <mesh rotation={[Math.PI/2,0,0]}><capsuleGeometry args={[.26,.85,8,24]}/><meshStandardMaterial color='#becdd0' roughness={.32} metalness={.6}/></mesh>
  <mesh position={[0,.04,.57]} scale={[1,1,.55]}><sphereGeometry args={[.22,24,16]}/><meshPhysicalMaterial color='#164759' roughness={.14} metalness={.4} clearcoat={1}/></mesh>
  {[-1,1].map(side=><group key={side} position={[side*.36,0,-.1]}><mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.10,.10,.38,16]}/><meshStandardMaterial color='#526d7c' metalness={.6} roughness={.4}/></mesh><mesh position={[0,.05,.4]}><sphereGeometry args={[.055,10,8]}/><meshStandardMaterial color='#dcf9ff' emissive='#a0eaff' emissiveIntensity={2}/></mesh></group>)}
  <mesh position={[0,.3,-.2]}><sphereGeometry args={[.035,10,8]}/><meshStandardMaterial color={samples?'#67e9bb':'#f4b76d'} emissive={samples?'#28bb8a':'#c66a24'} emissiveIntensity={1}/></mesh>
  <SampleCollector collection={collection}/>
  <primitive object={beamTarget}/>
  <spotLight position={[0,0,.55]} target={beamTarget} color='#b1ebef' intensity={32} angle={.55} penumbra={.8} distance={18}/>
  <pointLight position={[0,.4,.4]} intensity={1.5} color='#8fd7e7' distance={5}/>
 </group>;
}
function OceanWorld({state}:{state:OceanState}) {
 const world=useRef<Group>(null);
 useFrame(({camera,clock},delta)=>{
  if(world.current){const target=-state.heading*Math.PI/180;const difference=Math.atan2(Math.sin(target-world.current.rotation.y),Math.cos(target-world.current.rotation.y));world.current.rotation.y+=difference*(1-Math.exp(-delta*1.5));}
  camera.position.z+=(state.distance-camera.position.z)*(1-Math.exp(-delta*2.5));camera.position.y=1+Math.sin(clock.elapsedTime*.17)*.045;camera.lookAt(1,-.65,-6);
 });
 return <><Lighting depth={state.depth}/><group ref={world}><Seabed depth={state.depth}/><WaterCeiling depth={state.depth}/><Rocks depth={state.depth}/>
  <Sparkles count={180} scale={[24,12,28]} position={[0,0,-8]} size={1.2} speed={.16} opacity={.24} color='#a5cfd0'/>
  {Array.from({length:7},(_,i)=><Jelly key={i} index={i}/>)}
  {Array.from({length:18},(_,i)=><Swimmer key={i} index={i}/>)}</group><Submersible samples={state.samples} collection={state.collection}/></>;
}
export function OceanScene({state}:{state:OceanState}) {
 return <div className='ocean-canvas' role='img' aria-label='Oceano hipotético com relevo, luz filtrada, submersível e organismos fictícios. Profundidade e rumo alteram a cena.'><Canvas camera={{position:[0,1,7],fov:52,near:.1,far:80}} dpr={[1,1.5]} gl={{antialias:true,toneMapping:ACESFilmicToneMapping,outputColorSpace:SRGBColorSpace}}><OceanWorld state={state}/></Canvas></div>;
}


