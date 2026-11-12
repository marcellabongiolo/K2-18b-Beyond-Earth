import React, { Suspense, useReducer, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { ACESFilmicToneMapping, SRGBColorSpace, Vector3 } from 'three';
import { OrbitControls, Stars } from '@react-three/drei';
import { PlanetSurface } from './PlanetSurface';
import { DescentLife } from './DescentLife';
import { EXOPLANET, evidenceLabels } from './science';
import { Probe } from './Probe';
import { initialMission, nextMission, telemetry, spaceCameraDistance } from './mission';
import { Atmosphere } from './Atmosphere';
import { flightPhases, type FlightPhase } from './descent';
import { OceanScene } from './OceanScene';
import { initialOcean, oceanReducer, oceanZone } from './ocean';
import './style.css';

function CinematicCamera({phase,distance}:{phase:FlightPhase;distance:number}) {
 const target=useRef(new Vector3());
 useFrame(({camera},delta)=>{
  const radius=spaceCameraDistance(distance,phase);
  if(phase==='descent') target.current.set(.1,.2,radius);
  else target.current.copy(camera.position).normalize().multiplyScalar(radius);
  camera.position.lerp(target.current,1-Math.exp(-delta*2.5));
  camera.lookAt(0,0,0);
 });
 return null;
}
function SpaceScene({probeVisible,phase,distance}:{probeVisible:boolean;phase:FlightPhase;distance:number}) {
 return <Canvas camera={{position:[0,.15,6],fov:43,near:.05}} dpr={[1,1.5]} gl={{antialias:true,toneMapping:ACESFilmicToneMapping,outputColorSpace:SRGBColorSpace}}>
  <color attach='background' args={['#030711']}/><hemisphereLight args={['#8dbad3','#050d1c',.28]}/><ambientLight intensity={.12}/>
  <directionalLight position={[-5,3,5]} intensity={3.1} color='#f2f8ff'/><pointLight position={[5,-3,-2]} intensity={4} color='#315f95'/>
  <Suspense fallback={null}><PlanetSurface/>{phase==='descent'&&<DescentLife/>}<Atmosphere active={phase==='descent'}/>{probeVisible&&<Probe/>}<Stars radius={95} depth={55} count={3000} factor={3} saturation={0} fade speed={.15}/></Suspense>
  <CinematicCamera phase={phase} distance={distance}/>
  <OrbitControls enabled={phase==='orbit'} enablePan={false} enableZoom={false} enableDamping dampingFactor={.045}/>
 </Canvas>;
}
function App(){
 const [phase,setPhase]=useState<FlightPhase>('orbit');
 const [oceanMode,setOceanMode]=useState(false);
 const [controlsOpen,setControlsOpen]=useState(true);
 const [probeVisible,setProbeVisible]=useState(true);
 const [mission,dispatch]=useReducer(nextMission,initialMission);
 const [ocean,oceanDispatch]=useReducer(oceanReducer,initialOcean);
 const signal=telemetry(mission.distance);
 const distance=oceanMode?ocean.distance:mission.distance;
 const nearLimit=oceanMode?4:3.5,farLimit=12;
 const zoom=(closer:boolean)=>oceanMode?oceanDispatch(closer?'approach':'retreat'):dispatch(closer?'approach':'retreat');
 return <main className={'explorer'+(controlsOpen?'':' controls-hidden')}>
  <header className='app-header'><span className='brand'>BEYOND <b>EARTH</b></span><span className='world-title'>K2-18 b</span><button type='button' aria-expanded={controlsOpen} aria-controls='simulation-controls' onClick={()=>setControlsOpen(v=>!v)}>{controlsOpen?'Ocultar controles':'Mostrar controles'}</button></header>
  <section className='scene' aria-label={oceanMode?'Visualização do oceano hipotético':'Visualização orbital de K2-18 b'}>
   <div className='viewport'>{oceanMode?<OceanScene state={ocean}/>:<SpaceScene probeVisible={probeVisible} phase={phase} distance={mission.distance}/>}</div>
   <div className='scene-caption'>{oceanMode?oceanZone(ocean.depth):flightPhases[phase]}</div>
   <div className='zoom-bar' role='group' aria-label='Distância da câmera'><button type='button' disabled={distance<=nearLimit} onClick={()=>zoom(true)}>＋ Aproximar</button><output aria-live='polite'>{distance.toFixed(1)} U</output><button type='button' disabled={distance>=farLimit} onClick={()=>zoom(false)}>− Afastar</button></div>
  </section>
  <aside id='simulation-controls' className='controls' hidden={!controlsOpen} aria-label='Controles da simulação'>
   <section><h1>Explorar K2-18 b</h1><div className='actions mode-actions'><button type='button' aria-pressed={!oceanMode} onClick={()=>setOceanMode(false)}>Espaço orbital</button><button type='button' aria-pressed={oceanMode} onClick={()=>setOceanMode(true)}>Oceano hipotético</button></div></section>
   {oceanMode?<>
    <section><h2>Submersível Aurora-02</h2><div className='telemetry-grid'><span>PROFUNDIDADE VIRTUAL <b>{ocean.depth} U</b></span><span>RUMO <b>{ocean.heading}°</b></span><span>AMOSTRAS FICTÍCIAS <b>{ocean.samples}/5</b></span><span>DISTÂNCIA DA CÂMERA <b>{ocean.distance.toFixed(1)} U</b></span></div><div className='actions'><button type='button' disabled={ocean.depth>=1000} onClick={()=>oceanDispatch('dive')}>Mergulhar</button><button type='button' disabled={ocean.depth<=0} onClick={()=>oceanDispatch('ascend')}>Subir</button><button type='button' onClick={()=>oceanDispatch('turnLeft')}>Girar ←</button><button type='button' onClick={()=>oceanDispatch('turnRight')}>Girar →</button><button type='button' disabled={ocean.samples>=5} onClick={()=>oceanDispatch('sample')}>Coletar amostra</button><button type='button' onClick={()=>oceanDispatch('reset')}>Reiniciar oceano</button></div><p>Mergulhar muda a profundidade, a luz e a visibilidade. Aproximar e afastar movem a câmera.</p></section>
   </>:<>
    <section><h2>Voo e aproximação</h2><div className='actions'><button type='button' aria-pressed={phase==='orbit'} onClick={()=>setPhase('orbit')}>Visão orbital</button><button type='button' aria-pressed={phase==='descent'} onClick={()=>setPhase('descent')}>Iniciar aproximação</button></div><p>Arraste a cena para orbitar. Use os botões abaixo da imagem para aproximar e afastar.</p></section>
    <section><h2>Sonda Aurora-01</h2><div className='telemetry-grid'><span>DISTÂNCIA VIRTUAL <b>{signal.distanceDisplay} U</b></span><span>SINAL SIMULADO <b>{signal.signal}%</b></span></div><div className='actions'><button type='button' onClick={()=>dispatch('scan')}>Escanear</button><button type='button' onClick={()=>setProbeVisible(v=>!v)}>{probeVisible?'Ocultar sonda':'Exibir sonda'}</button><button type='button' onClick={()=>{dispatch('reset');setPhase('orbit');}}>Reiniciar missão</button></div><progress aria-label='Progresso da varredura simulada' max={100} value={mission.scanProgress}/><p>Varredura simulada: {mission.scanProgress}%{mission.scanProgress===100?' — Nenhum sinal de vida confirmado.':''}</p></section>
   </>}
   <details className='science-panel'><summary>O que sabemos?</summary><p>O planeta é real. Sua aparência é uma {evidenceLabels.simulacao.toLowerCase()}. Nenhum oceano ou ser vivo foi confirmado em K2-18 b.</p><p>{EXOPLANET.distanceLightYearsApprox} anos-luz (aprox.) · {EXOPLANET.massEarths} massas terrestres.</p><p>{EXOPLANET.evidenceStatus}</p></details>
  </aside>
  <footer className='scientific-note'>SIMULAÇÃO ARTÍSTICA · VIDA NÃO CONFIRMADA · NÃO ESTÁ EM ESCALA</footer>
 </main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
