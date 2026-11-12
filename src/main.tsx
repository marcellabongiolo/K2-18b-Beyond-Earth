import React, { Suspense, useEffect, useReducer, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { ACESFilmicToneMapping, SRGBColorSpace, Vector3 } from 'three';
import { OrbitControls, Stars } from '@react-three/drei';
import { PlanetSurface } from './PlanetSurface';
import { DescentLife } from './DescentLife';
import { EXOPLANET, evidenceLabels } from './science';
import { CosmicScenery } from './CosmicScenery';
import { SpaceSurroundings } from './SpaceSurroundings';
import { Probe } from './Probe';
import { initialMission, nextMission, telemetry, spaceCameraDistance } from './mission';
import { Atmosphere } from './Atmosphere';
import { flightPhases, type FlightPhase } from './descent';
import { OceanScene } from './OceanScene';
import { initialOcean, oceanReducer, oceanZone, collectionStage } from './ocean';
import './style.css';

function CinematicCamera({phase,distance,systemView}:{phase:FlightPhase;distance:number;systemView:boolean}) {
 const target=useRef(new Vector3());
 useFrame(({camera},delta)=>{
  const radius=spaceCameraDistance(distance,phase,systemView);
  if(phase==='descent') target.current.set(.1,.2,radius);
  else target.current.copy(camera.position).normalize().multiplyScalar(radius);
  camera.position.lerp(target.current,1-Math.exp(-delta*2.5));
  camera.lookAt(0,0,0);
 });
 return null;
}
function SpaceScene({probeVisible,phase,distance,systemView,cinematic}:{probeVisible:boolean;phase:FlightPhase;distance:number;systemView:boolean;cinematic:boolean}) {
 return <Canvas camera={{position:[0,.15,6],fov:43,near:.05}} dpr={[1,1.5]} gl={{antialias:true,toneMapping:ACESFilmicToneMapping,outputColorSpace:SRGBColorSpace}}>
  <color attach='background' args={['#030711']}/><hemisphereLight args={['#8dbad3','#050d1c',.28]}/><ambientLight intensity={.12}/>
  <directionalLight position={[-5,3,5]} intensity={3.1} color='#f2f8ff'/><pointLight position={[5,-3,-2]} intensity={4} color='#315f95'/>
  <Suspense fallback={null}><PlanetSurface/><SpaceSurroundings/>{cinematic&&<CosmicScenery/>}{phase==='descent'&&<DescentLife/>}<Atmosphere active={phase==='descent'}/>{probeVisible&&<Probe/>}<Stars radius={95} depth={55} count={6000} factor={2.2} saturation={.3} fade speed={.15}/></Suspense>
  <CinematicCamera phase={phase} distance={distance} systemView={systemView}/>
  <OrbitControls enabled={phase==='orbit'} enablePan={false} enableZoom={false} enableDamping dampingFactor={.045}/>
 </Canvas>;
}
function App(){
 const [cinematic,setCinematic]=useState(true);
 const [systemView,setSystemView]=useState(false);
 const [phase,setPhase]=useState<FlightPhase>('orbit');
 const [oceanMode,setOceanMode]=useState(false);
 const [controlsOpen,setControlsOpen]=useState(true);
 const [probeVisible,setProbeVisible]=useState(true);
 const [mission,dispatch]=useReducer(nextMission,initialMission);
 const [ocean,oceanDispatch]=useReducer(oceanReducer,initialOcean);
 const collecting=!!ocean.collection;
 useEffect(()=>{if(!collecting)return;const timer=window.setInterval(()=>oceanDispatch('sampleTick'),250);return()=>window.clearInterval(timer);},[collecting]);
 const lastSample=ocean.sampleLog[ocean.sampleLog.length-1];
 const signal=telemetry(mission.distance);
 const distance=oceanMode?ocean.distance:mission.distance;
 const nearLimit=oceanMode?4:3.5,farLimit=12;
 const zoom=(closer:boolean)=>oceanMode?oceanDispatch(closer?'approach':'retreat'):dispatch(closer?'approach':'retreat');
 return <main className={'explorer'+(controlsOpen?'':' controls-hidden')}>
  <header className='app-header'><span className='brand'>BEYOND <b>EARTH</b></span><span className='world-title'>K2-18 b</span><button type='button' aria-expanded={controlsOpen} aria-controls='simulation-controls' onClick={()=>setControlsOpen(v=>!v)}>{controlsOpen?'Ocultar controles':'Mostrar controles'}</button></header>
  <section className='scene' aria-label={oceanMode?'Visualização do oceano hipotético':'Visualização orbital de K2-18 b'}>
   <div className='viewport'>{oceanMode?<OceanScene state={ocean}/>:<SpaceScene probeVisible={probeVisible} phase={phase} distance={mission.distance} systemView={systemView} cinematic={cinematic}/>}</div>
   <div className='scene-caption'>{oceanMode?oceanZone(ocean.depth):systemView?'Sistema K2-18 · composição ilustrativa':cinematic?'K2-18 b · cenário cinematográfico fictício':flightPhases[phase]}</div>
   {oceanMode&&<div className={'sample-feedback'+(collecting?' collecting':'')} role='status' aria-live='polite'>{ocean.collection?<><b>{collectionStage(ocean.collection.progress)}</b><progress aria-label='Progresso da coleta simulada' max={100} value={ocean.collection.progress}/></>:lastSample?<><b>Amostra {lastSample.id}/5 armazenada</b><span>{lastSample.material} · {lastSample.depth} U · simulação</span></>:null}</div>}
   <div className='zoom-bar' role='group' aria-label='Distância da câmera'><button type='button' disabled={distance<=nearLimit} onClick={()=>zoom(true)}>＋ Aproximar</button><output aria-live='polite'>{distance.toFixed(1)} U</output><button type='button' disabled={distance>=farLimit} onClick={()=>zoom(false)}>− Afastar</button></div>
  </section>
  <aside id='simulation-controls' className='controls' hidden={!controlsOpen} aria-label='Controles da simulação'>
   <section><h1>Explorar K2-18 b</h1><div className='actions mode-actions'><button type='button' aria-pressed={!oceanMode} onClick={()=>setOceanMode(false)}>Espaço orbital</button><button type='button' aria-pressed={oceanMode} onClick={()=>setOceanMode(true)}>Oceano hipotético</button></div></section>
   {oceanMode?<>
    <section><h2>Submersível Aurora-02</h2><div className='telemetry-grid'><span>PROFUNDIDADE VIRTUAL <b>{ocean.depth} U</b></span><span>RUMO <b>{ocean.heading}°</b></span><span>AMOSTRAS FICTÍCIAS <b>{ocean.samples}/5</b></span><span>DISTÂNCIA DA CÂMERA <b>{ocean.distance.toFixed(1)} U</b></span></div><div className='actions'><button type='button' disabled={ocean.depth>=1000} onClick={()=>oceanDispatch('dive')}>Mergulhar</button><button type='button' disabled={ocean.depth<=0} onClick={()=>oceanDispatch('ascend')}>Subir</button><button type='button' onClick={()=>oceanDispatch('turnLeft')}>Girar ←</button><button type='button' onClick={()=>oceanDispatch('turnRight')}>Girar →</button><button type='button' disabled={ocean.samples>=5||collecting} onClick={()=>oceanDispatch('sample')}>{collecting?'Coletando…':ocean.samples>=5?'Compartimento cheio':'Coletar amostra'}</button><button type='button' onClick={()=>oceanDispatch('reset')}>Reiniciar oceano</button></div>{ocean.sampleLog.length>0&&<div className='sample-log'><h3>Amostras armazenadas · simulação</h3><ol>{ocean.sampleLog.map(sample=><li key={sample.id}>{sample.material} — {sample.depth} U, rumo {sample.heading}°</li>)}</ol><p>Resultados fictícios, sem análise real ou confirmação de vida.</p></div>}<p>Mergulhar muda a profundidade, a luz e a visibilidade. Aproximar e afastar movem a câmera.</p></section>
   </>:<>
    <section><h2>Voo e aproximação</h2><div className='actions'><button type='button' aria-pressed={phase==='orbit'} onClick={()=>{setSystemView(false);setPhase('orbit');}}>Visão orbital</button><button type='button' aria-pressed={phase==='descent'} onClick={()=>{setSystemView(false);setPhase('descent');}}>Iniciar aproximação</button><button type='button' aria-pressed={systemView} onClick={()=>{setPhase('orbit');setSystemView(v=>!v);}}>Ver sistema K2-18</button></div><p>Arraste a cena para orbitar. Use os botões abaixo da imagem para aproximar e afastar.</p></section>
    <section><h2>Sonda Aurora-01</h2><div className='telemetry-grid'><span>DISTÂNCIA VIRTUAL <b>{signal.distanceDisplay} U</b></span><span>SINAL SIMULADO <b>{signal.signal}%</b></span></div><div className='actions'><button type='button' onClick={()=>dispatch('scan')}>Escanear</button><button type='button' onClick={()=>setProbeVisible(v=>!v)}>{probeVisible?'Ocultar sonda':'Exibir sonda'}</button><button type='button' onClick={()=>{dispatch('reset');setPhase('orbit');setSystemView(false);}}>Reiniciar missão</button></div><progress aria-label='Progresso da varredura simulada' max={100} value={mission.scanProgress}/><p>Varredura simulada: {mission.scanProgress}%{mission.scanProgress===100?' — Nenhum sinal de vida confirmado.':''}</p></section>
   </>}
   {!oceanMode&&<section className='system-info'><h2>Ao redor do planeta</h2><div className='actions'><button type='button' aria-pressed={cinematic} onClick={()=>setCinematic(v=>!v)}>{cinematic?'Cenário cinematográfico ligado':'Ligar cenário cinematográfico'}</button></div><p>Galáxias, poeira, fragmentos e cometa são elementos artísticos. Não representam descobertas no sistema K2-18.</p><p>K2-18 é uma estrela anã vermelha. K2-18 c é outro planeta catalogado no mesmo sistema.</p><p>Os tamanhos, posições e aparências são ilustrativos. As estrelas de fundo e a faixa galáctica são uma composição artística.</p><a href='https://science.nasa.gov/exoplanet-catalog/k2-18-c/' target='_blank' rel='noreferrer'>Fonte: catálogo de exoplanetas da NASA</a></section>}
   <details className='science-panel'><summary>O que sabemos?</summary><p>O planeta é real. Sua aparência é uma {evidenceLabels.simulacao.toLowerCase()}. Nenhum oceano ou ser vivo foi confirmado em K2-18 b.</p><p>{EXOPLANET.distanceLightYearsApprox} anos-luz (aprox.) · {EXOPLANET.massEarths} massas terrestres.</p><p>{EXOPLANET.evidenceStatus}</p></details>
  </aside>
  <footer className='scientific-note'>SIMULAÇÃO ARTÍSTICA · VIDA NÃO CONFIRMADA · NÃO ESTÁ EM ESCALA</footer>
 </main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

