import React, { Suspense, useEffect, useReducer, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { ACESFilmicToneMapping, SRGBColorSpace, Vector3 } from 'three';
import { Stars } from '@react-three/drei';
import { PlanetSurface } from './PlanetSurface';
import { DescentLife } from './DescentLife';
import { EXOPLANET, evidenceLabels } from './science';
import { CosmicScenery } from './CosmicScenery';
import { SpaceNavigation } from './SpaceNavigation';
import { spaceTargets, oceanSubjects, type SpaceTargetId, type OceanSubject } from './exploration';
import { SpaceSurroundings } from './SpaceSurroundings';
import { Probe } from './Probe';
import { initialMission, nextMission, telemetry, spaceCameraDistance } from './mission';
import { Atmosphere } from './Atmosphere';
import { flightPhases, type FlightPhase } from './descent';
import { OceanScene } from './OceanScene';
import { initialOcean, oceanReducer, oceanZone, collectionStage } from './ocean';
import { ScientificTelemetry } from './ScientificTelemetry';
import type { PlanetModel } from './scientificTelemetry';
import './style.css';

function SpaceScene({probeVisible,phase,distance,systemView,cinematic,focus,onSelect,flare,model}:{flare:boolean;model:PlanetModel;probeVisible:boolean;phase:FlightPhase;distance:number;systemView:boolean;cinematic:boolean;focus:SpaceTargetId;onSelect:(id:SpaceTargetId)=>void}) {
 return <Canvas camera={{position:[0,.15,6],fov:43,near:.05}} dpr={[1.5,2]} gl={{antialias:true,toneMapping:ACESFilmicToneMapping,outputColorSpace:SRGBColorSpace}}>
  <color attach='background' args={['#030711']}/><hemisphereLight args={['#b8d8ef','#16334b',.72]}/><ambientLight intensity={.4}/>
  <directionalLight position={[-5,3,5]} intensity={flare?6:3.6} color={flare?'#ff493d':'#f2f8ff'}/><pointLight position={[-6,3.5,-13]} color='#ff3029' intensity={flare?35:0} distance={35}/><pointLight position={[5,-3,-2]} intensity={5.2} color='#578ac0'/>
  <Suspense fallback={null}><group onClick={e=>{e.stopPropagation();onSelect('b');}}><PlanetSurface model={model}/></group><SpaceSurroundings onSelect={onSelect}/>{cinematic&&<CosmicScenery onSelect={onSelect}/>}{phase==='descent'&&<DescentLife/>}<Atmosphere active={phase==='descent'}/>{probeVisible&&<Probe flare={flare}/>}<Stars radius={95} depth={55} count={6000} factor={3.0} saturation={.3} fade speed={.15}/></Suspense>
  <SpaceNavigation phase={phase} distance={distance} systemView={systemView} focus={focus}/>
 </Canvas>;
}
function App(){
 const [calibration,setCalibration]=useState(35);
 const [planetModel,setPlanetModel]=useState<PlanetModel>('hycean');
 const [flare,setFlare]=useState(false);
 const [focus,setFocus]=useState<SpaceTargetId>('b');
 const [subject,setSubject]=useState<OceanSubject|null>(null);
 const [observations,setObservations]=useState<OceanSubject[]>([]);
 const selectTarget=(id:SpaceTargetId)=>{setFocus(id);setPhase('orbit');setSystemView(false);if(spaceTargets.find(t=>t.id===id)!.fictional)setCinematic(true);};
 const focused=spaceTargets.find(t=>t.id===focus)!;
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
   <div className='viewport'>{oceanMode?<OceanScene state={ocean} subject={subject} onInspect={setSubject}/>:<SpaceScene flare={flare} model={planetModel} probeVisible={probeVisible} phase={phase} distance={mission.distance} systemView={systemView} cinematic={cinematic} focus={focus} onSelect={selectTarget}/>}</div>
   <div className='scene-caption'>{oceanMode?(subject?oceanSubjects[subject].name:oceanZone(ocean.depth)):focus!=='b'?focused.name:systemView?'Sistema K2-18 · composição ilustrativa':cinematic?'K2-18 b · cenário cinematográfico fictício':flightPhases[phase]}</div>
   {oceanMode&&subject&&<div id='ocean-inspection-details' className='inspection-overlay' role='status' aria-live='polite'><span className='inspection-kicker'>INSPEÇÃO ATIVA · SIMULAÇÃO</span><strong>{oceanSubjects[subject].name}</strong><p>{oceanSubjects[subject].description}</p><button type='button' onClick={()=>setSubject(null)}>Fechar inspeção</button></div>}
   {oceanMode&&<div className={'sample-feedback'+(collecting?' collecting':'')} role='status' aria-live='polite'>{ocean.collection?<><b>{collectionStage(ocean.collection.progress)}</b><progress aria-label='Progresso da coleta simulada' max={100} value={ocean.collection.progress}/></>:lastSample?<><b>Amostra {lastSample.id}/5 armazenada</b><span>{lastSample.material} · {lastSample.depth} U · simulação</span></>:null}</div>}
   <div className='zoom-bar' role='group' aria-label='Distância da câmera'><button type='button' disabled={distance<=nearLimit} onClick={()=>zoom(true)}>＋ Aproximar</button><output aria-live='polite'>{distance.toFixed(1)} U</output><button type='button' disabled={distance>=farLimit} onClick={()=>zoom(false)}>− Afastar</button></div>
  </section>
  <aside id='simulation-controls' className='controls' hidden={!controlsOpen} aria-label='Controles da simulação'>
   <section><h1>Explorar K2-18 b</h1><div className='actions mode-actions'><button type='button' aria-pressed={!oceanMode} onClick={()=>setOceanMode(false)}>Espaço orbital</button><button type='button' aria-pressed={oceanMode} onClick={()=>setOceanMode(true)}>Oceano hipotético</button></div>{planetModel==='miniNeptune'&&<p role='note'>O modelo Mini-Netuno não prevê oceano superficial habitável. O modo oceânico continua disponível exclusivamente como cenário artístico independente, sem correspondência com esse modelo.</p>}</section>
   {oceanMode?<>
    <section><h2>Submersível Aurora-02</h2><div className='telemetry-grid'><span>PROFUNDIDADE VIRTUAL <b>{ocean.depth} U</b></span><span>RUMO <b>{ocean.heading}°</b></span><span>AMOSTRAS FICTÍCIAS <b>{ocean.samples}/5</b></span><span>DISTÂNCIA DA CÂMERA <b>{ocean.distance.toFixed(1)} U</b></span></div><div className='actions'><button type='button' disabled={ocean.depth>=1000} onClick={()=>oceanDispatch('dive')}>Mergulhar</button><button type='button' disabled={ocean.depth<=0} onClick={()=>oceanDispatch('ascend')}>Subir</button><button type='button' onClick={()=>oceanDispatch('turnLeft')}>Girar ←</button><button type='button' onClick={()=>oceanDispatch('turnRight')}>Girar →</button><button type='button' disabled={ocean.samples>=5||collecting} onClick={()=>oceanDispatch('sample')}>{collecting?'Coletando…':ocean.samples>=5?'Compartimento cheio':'Coletar amostra'}</button><button type='button' onClick={()=>{oceanDispatch('reset');setSubject(null);setObservations([]);}}>Reiniciar oceano</button></div>{ocean.sampleLog.length>0&&<div className='sample-log'><h3>Amostras armazenadas · simulação</h3><ol>{ocean.sampleLog.map(sample=><li key={sample.id}>{sample.material} — {sample.depth} U, rumo {sample.heading}°</li>)}</ol><p>Resultados fictícios, sem análise real ou confirmação de vida.</p></div>}<div className='actions'><button type='button' onClick={()=>oceanDispatch('sonar')}>Emitir sonar</button><button type='button' aria-pressed={ocean.lights} onClick={()=>oceanDispatch('lights')}>{ocean.lights?'Desligar faróis':'Ligar faróis'}</button></div>{ocean.sonarCount>0&&<p role='status'>Pulso sonar {ocean.sonarCount}: formações minerais virtuais realçadas na cena.</p>}<div className='inspection-launch'><button type='button' aria-expanded={subject!==null} aria-controls='ocean-inspection-details' onClick={()=>setSubject(v=>v??'jelly')}>🔎 Inspecionar ambiente</button><span>Toque para abrir uma ficha de criatura fictícia. Depois escolha outro elemento abaixo.</span></div><label className='field-label' htmlFor='ocean-subject'>Escolher elemento para inspecionar</label><select id='ocean-subject' value={subject??''} onChange={e=>setSubject((e.target.value||null) as OceanSubject|null)}><option value=''>Selecione uma criatura ou formação</option>{Object.entries(oceanSubjects).map(([id,item])=><option key={id} value={id}>{item.name}</option>)}</select>{!subject&&<p>Selecione uma opção para abrir uma ficha de inspeção sobre a cena 3D.</p>}{subject&&<div className='sample-log'><h3>{oceanSubjects[subject].name}</h3><p>{oceanSubjects[subject].description}</p><button type='button' disabled={observations.includes(subject)} onClick={()=>setObservations(v=>[...v,subject])}>{observations.includes(subject)?'Observação registrada':'Registrar observação'}</button></div>}{observations.length>0&&<p role='status'>Diário: {observations.length} observações fictícias registradas.</p>}<p>Mergulhar muda a profundidade, a luz e a visibilidade. Aproximar e afastar movem a câmera.</p></section>
   </>:<>
    <section><h2>Voo e aproximação</h2><div className='actions'><button type='button' aria-pressed={phase==='orbit'} onClick={()=>{setFocus('b');setSystemView(false);setPhase('orbit');}}>Visão orbital</button><button type='button' aria-pressed={phase==='descent'} onClick={()=>{setFocus('b');setSystemView(false);setPhase('descent');}}>Iniciar aproximação</button><button type='button' aria-pressed={systemView} onClick={()=>{setFocus('b');setPhase('orbit');setSystemView(v=>!v);}}>Ver sistema K2-18</button></div><p>Arraste a cena para orbitar. Os objetos identificados têm nomes na cena; selecione um deles para aproximar e explorar. Use os botões abaixo da imagem para ajustar o zoom.</p></section>
    <section><h2>Sonda Aurora-01</h2><div className='telemetry-grid'><span>DISTÂNCIA VIRTUAL <b>{signal.distanceDisplay} U</b></span><span>SINAL SIMULADO <b>{signal.signal}%</b></span></div><div className='actions'><button type='button' onClick={()=>dispatch('scan')}>Escanear</button><button type='button' onClick={()=>setProbeVisible(v=>!v)}>{probeVisible?'Ocultar sonda':'Exibir sonda'}</button><button type='button' onClick={()=>{dispatch('reset');setFocus('b');setPhase('orbit');setSystemView(false);}}>Reiniciar missão</button></div><progress aria-label='Progresso da varredura simulada' max={100} value={mission.scanProgress}/><p>Varredura simulada: {mission.scanProgress}%{mission.scanProgress===100?' — Nenhum sinal de vida confirmado.':''}</p><ScientificTelemetry calibration={calibration} onCalibration={setCalibration} model={planetModel} onModel={setPlanetModel} flare={flare} onFlare={()=>setFlare(v=>!v)}/></section>
   </>}
   {!oceanMode&&<section className='system-info'><h2>Explorar objetos em 3D</h2><label className='field-label' htmlFor='space-target'>Objeto para explorar</label><select id='space-target' value={focus} onChange={e=>selectTarget(e.target.value as SpaceTargetId)}>{spaceTargets.map(t=><option key={t.id} value={t.id}>{t.name}{t.fictional?' · artístico':''}</option>)}</select><p>{focused.description}</p><p>Clique em um objeto ou escolha na lista. Arraste para girar ao redor dele e use o zoom para explorar.</p><div className='actions'><button type='button' aria-pressed={cinematic} onClick={()=>{if(cinematic&&focused.fictional)setFocus('b');setCinematic(v=>!v);}}>{cinematic?'Cenário cinematográfico ligado':'Ligar cenário cinematográfico'}</button></div><p>Galáxias, poeira, fragmentos e cometa são elementos artísticos. Não representam descobertas no sistema K2-18.</p><p>K2-18 é uma estrela anã vermelha. K2-18 c é outro planeta catalogado no mesmo sistema.</p><p>Os tamanhos, posições e aparências são ilustrativos. As estrelas de fundo e a faixa galáctica são uma composição artística.</p><a href='https://science.nasa.gov/exoplanet-catalog/k2-18-c/' target='_blank' rel='noreferrer'>Fonte: catálogo de exoplanetas da NASA</a></section>}
   <details className='science-panel'><summary>O que sabemos?</summary><p>O planeta é real. Sua aparência é uma {evidenceLabels.simulacao.toLowerCase()}. Nenhum oceano ou ser vivo foi confirmado em K2-18 b.</p><p>{EXOPLANET.distanceLightYearsApprox} anos-luz (aprox.) · {EXOPLANET.massEarths} massas terrestres.</p><p>{EXOPLANET.evidenceStatus}</p></details>
  </aside>
  <footer className='scientific-note'>SIMULAÇÃO ARTÍSTICA · VIDA NÃO CONFIRMADA · NÃO ESTÁ EM ESCALA</footer>
 </main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

