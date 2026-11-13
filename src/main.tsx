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
import { ResearchWorkbench } from './ResearchWorkbench';

import type { PlanetModel } from './scientificTelemetry';
import './style.css';

function SpaceScene({quality,probeVisible,phase,distance,systemView,cinematic,focus,onSelect,flare,model}:{quality:GraphicsQuality;flare:boolean;model:PlanetModel;probeVisible:boolean;phase:FlightPhase;distance:number;systemView:boolean;cinematic:boolean;focus:SpaceTargetId;onSelect:(id:SpaceTargetId)=>void}) {
 return <Canvas camera={{position:[0,.15,6],fov:43,near:.05}} dpr={qualityDpr(quality)} gl={{antialias:quality!=='performance',toneMapping:ACESFilmicToneMapping,outputColorSpace:SRGBColorSpace}}>
  <color attach='background' args={['#030711']}/><hemisphereLight args={['#b8d8ef','#16334b',.72]}/><ambientLight intensity={.4}/>
  <directionalLight position={[-5,3,5]} intensity={flare?6:3.6} color={flare?'#ff493d':'#f2f8ff'}/><pointLight position={[-6,3.5,-13]} color='#ff3029' intensity={flare?35:0} distance={35}/><pointLight position={[5,-3,-2]} intensity={5.2} color='#578ac0'/>
  <Suspense fallback={null}><group onClick={e=>{e.stopPropagation();onSelect('b');}}><PlanetSurface model={model}/></group><SpaceSurroundings onSelect={onSelect}/>{cinematic&&quality!=='performance'&&<CosmicScenery onSelect={onSelect}/>}{phase==='descent'&&<DescentLife/>}<Atmosphere active={phase==='descent'}/>{probeVisible&&<Probe flare={flare}/>}<Stars radius={95} depth={55} count={quality==='ultra'?3500:quality==='auto'?1700:600} factor={3.0} saturation={.3} fade speed={.15}/></Suspense>
  <SpaceNavigation phase={phase} distance={distance} systemView={systemView} focus={focus}/>
 </Canvas>;
}
type GraphicsQuality = 'ultra'|'auto'|'performance';
function qualityDpr(quality:GraphicsQuality):[number,number]{return quality==='ultra'?[1.5,2]:quality==='auto'?[1,1.5]:[0.75,1];}
function App(){
 const [quality,setQuality]=useState<GraphicsQuality>('ultra');
 const [sceneReady,setSceneReady]=useState(false);
 const [commandCenterOpen,setCommandCenterOpen]=useState(false);
 const [missionGoal,setMissionGoal]=useState<'orbit'|'descent'|'ocean'|'samples'>('orbit');
 const [achievements,setAchievements]=useState<string[]>([]);
 const award=(name:string)=>setAchievements(prev=>prev.includes(name)?prev:[...prev,name]);
 const [calibration,setCalibration]=useState(35);
 const [labOpen,setLabOpen]=useState(window.location.hash==='#laboratorio');
 const [labOnly,setLabOnly]=useState(window.location.hash==='#laboratorio');
 const orbitalPinch=useRef<number|null>(null);
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
 const nearLimit=oceanMode?2.5:2.4,farLimit=12;
 const zoom=(closer:boolean)=>oceanMode?oceanDispatch(closer?'approach':'retreat'):dispatch(closer?'approach':'retreat');
 const launchMission=(goal:'orbit'|'descent'|'ocean'|'samples')=>{setMissionGoal(goal);setSceneReady(true);setOceanMode(goal==='ocean'||goal==='samples');if(goal==='descent'){setPhase('descent');award('Aproximação iniciada');}if(goal==='orbit')award('Órbita alcançada');if(goal==='ocean'||goal==='samples')award('Exploração oceânica iniciada');};
 if(labOnly)return <main className='standalone-lab'><header className='app-header'><span className='brand'>BEYOND <b>EARTH</b></span><span className='world-title'>Laboratório científico</span><button type='button' onClick={()=>{setLabOnly(false);window.location.hash='';}}>Voltar à exploração 3D</button></header><ResearchWorkbench/><footer className='scientific-note'>PROTÓTIPO DE PESQUISA · NÃO É INSTRUMENTO CIENTÍFICO VALIDADO</footer></main>;
 return <main className={'explorer'+(controlsOpen?'':' controls-hidden')}>
  <header className='app-header'><span className='brand'>BEYOND <b>EARTH</b></span><span className='world-title'>K2-18 b</span><button type='button' onClick={()=>{window.location.href='./lab.html';}}>🔬 Laboratório</button><label className='quality-control'>Qualidade <select aria-label='Qualidade gráfica' value={quality} onChange={e=>setQuality(e.target.value as GraphicsQuality)}><option value='ultra'>Ultra</option><option value='auto'>Automático</option><option value='performance'>Leve</option></select></label><button type='button' aria-expanded={controlsOpen} aria-controls='simulation-controls' onClick={()=>setControlsOpen(v=>!v)}>{controlsOpen?'Ocultar controles':'Mostrar controles'}</button></header>
  <section className='scene' aria-label={oceanMode?'Visualização do oceano hipotético':'Visualização orbital de K2-18 b'}>
   <div className='viewport' onTouchStart={e=>{if(oceanMode)return;if(e.touches.length===2)orbitalPinch.current=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);}} onTouchMove={e=>{if(oceanMode||e.touches.length!==2)return;const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(orbitalPinch.current!==null&&Math.abs(d-orbitalPinch.current)>18){zoom(d>orbitalPinch.current);orbitalPinch.current=d;}}} onTouchEnd={()=>{orbitalPinch.current=null;}} onWheel={e=>{if(e.deltaY!==0){e.preventDefault();zoom(e.deltaY<0);}}}>{!sceneReady?<div className='startup-gate'><h2>Exploração K2-18 b</h2><p>Escolha a qualidade e inicie a cena quando quiser. O laboratório funciona separadamente.</p><button type='button' onClick={()=>launchMission('orbit')}>Iniciar exploração 3D</button><a href='./lab.html'>🔬 Abrir laboratório leve</a></div>:oceanMode?<OceanScene state={ocean} subject={subject} onInspect={setSubject} onZoom={zoom} quality={quality}/>:<SpaceScene quality={quality} flare={flare} model={planetModel} probeVisible={probeVisible} phase={phase} distance={mission.distance} systemView={systemView} cinematic={cinematic} focus={focus} onSelect={selectTarget}/>}</div>
   <div className='scene-caption'>{oceanMode?(subject?oceanSubjects[subject].name:oceanZone(ocean.depth)):focus!=='b'?focused.name:systemView?'Sistema K2-18 · composição ilustrativa':cinematic?'K2-18 b · cenário cinematográfico fictício':flightPhases[phase]}</div>
   {oceanMode&&subject&&<div id='ocean-inspection-details' className='inspection-overlay' role='status' aria-live='polite'><span className='inspection-kicker'>INSPEÇÃO ATIVA · SIMULAÇÃO</span><strong>{oceanSubjects[subject].name}</strong><p>{oceanSubjects[subject].description}</p><button type='button' onClick={()=>setSubject(null)}>Fechar inspeção</button></div>}
   {oceanMode&&<div className={'sample-feedback'+(collecting?' collecting':'')} role='status' aria-live='polite'>{ocean.collection?<><b>{collectionStage(ocean.collection.progress)}</b><progress aria-label='Progresso da coleta simulada' max={100} value={ocean.collection.progress}/></>:lastSample?<><b>Amostra {lastSample.id}/5 armazenada</b><span>{lastSample.material} · {lastSample.depth} U · simulação</span></>:null}</div>}
   <div className='zoom-bar' role='group' aria-label='Distância da câmera'><button type='button' disabled={distance<=nearLimit} onClick={()=>zoom(true)}>＋ Aproximar / zoom</button><output aria-live='polite'>{distance.toFixed(1)} U</output><button type='button' disabled={distance>=farLimit} onClick={()=>zoom(false)}>− Afastar / zoom</button></div>
  </section>
  <aside id='simulation-controls' className='controls' hidden={!controlsOpen} aria-label='Controles da simulação'>
  <section className='mission-center' aria-label='Central de comando'><div className='mission-center-heading'><strong>◈ CENTRAL DE COMANDO</strong><button type='button' className='mission-toggle' aria-expanded={commandCenterOpen} aria-controls='mission-center-details' onClick={()=>setCommandCenterOpen(v=>!v)}>{commandCenterOpen?'Recolher painel':'Abrir missões'}</button></div><div id='mission-center-details' hidden={!commandCenterOpen}><div className='mission-metrics'><span>Modo <b>{oceanMode?'Oceano':'Órbita'}</b></span><span>Qualidade <b>{quality==='ultra'?'Ultra':quality==='auto'?'Automático':'Leve'}</b></span><span>Objetivos concluídos <b>{achievements.length}/4</b></span><span>Amostras <b>{ocean.samples}/5</b></span></div><div className='mission-buttons'><button type='button' onClick={()=>launchMission('orbit')}>01 · Órbita</button><button type='button' onClick={()=>launchMission('descent')}>02 · Aproximação</button><button type='button' onClick={()=>launchMission('ocean')}>03 · Oceano</button><button type='button' onClick={()=>launchMission('samples')}>04 · Coleta</button><a href='./lab.html'>05 · Laboratório</a></div><p role='status'>Missão ativa: {missionGoal==='orbit'?'Explorar a órbita':missionGoal==='descent'?'Aproximar da atmosfera':missionGoal==='ocean'?'Explorar o oceano hipotético':'Coletar cinco amostras simuladas'}{achievements.length>0?' · Conquistas: '+achievements.join(', '):''}</p></div></section>

   <section><h1>Explorar K2-18 b</h1><div className='actions mode-actions'><button type='button' aria-pressed={!oceanMode} onClick={()=>setOceanMode(false)}>Espaço orbital</button><button type='button' aria-pressed={oceanMode} onClick={()=>setOceanMode(true)}>Oceano hipotético</button></div>{planetModel==='miniNeptune'&&<p role='note'>O modelo Mini-Netuno não prevê oceano superficial habitável. O modo oceânico continua disponível exclusivamente como cenário artístico independente, sem correspondência com esse modelo.</p>}</section>
   {oceanMode?<>
    <section><h2>Submersível Aurora-02</h2><div className='telemetry-grid'><span>PROFUNDIDADE VIRTUAL <b>{ocean.depth} U</b></span><span>RUMO <b>{ocean.heading}°</b></span><span>AMOSTRAS FICTÍCIAS <b>{ocean.samples}/5</b></span><span>DISTÂNCIA DA CÂMERA <b>{ocean.distance.toFixed(1)} U</b></span></div><div className='actions'><button type='button' disabled={ocean.depth>=1000} onClick={()=>oceanDispatch('dive')}>Mergulhar</button><button type='button' disabled={ocean.depth<=0} onClick={()=>oceanDispatch('ascend')}>Subir</button><button type='button' onClick={()=>oceanDispatch('turnLeft')}>Girar ←</button><button type='button' onClick={()=>oceanDispatch('turnRight')}>Girar →</button><button type='button' disabled={ocean.samples>=5||collecting} onClick={()=>{oceanDispatch('sample');award('Coleta iniciada');}}>{collecting?'Coletando…':ocean.samples>=5?'Compartimento cheio':'Coletar amostra'}</button><button type='button' onClick={()=>{oceanDispatch('reset');setSubject(null);setObservations([]);}}>Reiniciar oceano</button></div>{ocean.sampleLog.length>0&&<div className='sample-log'><h3>Amostras armazenadas · simulação</h3><ol>{ocean.sampleLog.map(sample=><li key={sample.id}>{sample.material} — {sample.depth} U, rumo {sample.heading}°</li>)}</ol><p>Resultados fictícios, sem análise real ou confirmação de vida.</p></div>}<div className='actions'><button type='button' onClick={()=>oceanDispatch('sonar')}>Emitir sonar</button><button type='button' aria-pressed={ocean.lights} onClick={()=>oceanDispatch('lights')}>{ocean.lights?'Desligar faróis':'Ligar faróis'}</button></div>{ocean.sonarCount>0&&<p role='status'>Pulso sonar {ocean.sonarCount}: formações minerais virtuais realçadas na cena.</p>}<div className='inspection-launch'><button type='button' aria-expanded={subject!==null} aria-controls='ocean-inspection-details' onClick={()=>setSubject(v=>v??'jelly')}>🔎 Inspecionar ambiente</button><span>Toque para abrir uma ficha de criatura fictícia. Depois escolha outro elemento abaixo.</span></div><label className='field-label' htmlFor='ocean-subject'>Escolher elemento para inspecionar</label><select id='ocean-subject' value={subject??''} onChange={e=>setSubject((e.target.value||null) as OceanSubject|null)}><option value=''>Selecione uma criatura ou formação</option>{Object.entries(oceanSubjects).map(([id,item])=><option key={id} value={id}>{item.name}</option>)}</select>{!subject&&<p>Selecione uma opção para abrir uma ficha de inspeção sobre a cena 3D.</p>}{subject&&<div className='sample-log'><h3>{oceanSubjects[subject].name}</h3><p>{oceanSubjects[subject].description}</p><button type='button' disabled={observations.includes(subject)} onClick={()=>setObservations(v=>[...v,subject])}>{observations.includes(subject)?'Observação registrada':'Registrar observação'}</button></div>}{observations.length>0&&<p role='status'>Diário: {observations.length} observações fictícias registradas.</p>}<p>Mergulhar muda a profundidade, a luz e a visibilidade. Arraste o oceano com o dedo ou mouse para girar a cena. Aproximar e afastar movem a câmera.</p></section>
   </>:<>
    <section><h2>Voo e aproximação</h2><div className='actions'><button type='button' aria-pressed={phase==='orbit'} onClick={()=>{setFocus('b');setSystemView(false);setPhase('orbit');}}>Visão orbital</button><button type='button' aria-pressed={phase==='descent'} onClick={()=>{setFocus('b');setSystemView(false);setPhase('descent');}}>Iniciar aproximação</button><button type='button' aria-pressed={systemView} onClick={()=>{setFocus('b');setPhase('orbit');setSystemView(v=>!v);}}>Ver sistema K2-18</button></div><p>Arraste a cena para orbitar. Os objetos identificados têm nomes na cena; selecione um deles para aproximar e explorar. Use os botões abaixo da imagem para ajustar o zoom.</p></section>
    <section><h2>Sonda Aurora-01</h2><div className='telemetry-grid'><span>DISTÂNCIA VIRTUAL <b>{signal.distanceDisplay} U</b></span><span>SINAL SIMULADO <b>{signal.signal}%</b></span></div><div className='actions'><button type='button' onClick={()=>{dispatch('scan');award('Varredura orbital');}}>Escanear</button><button type='button' onClick={()=>setProbeVisible(v=>!v)}>{probeVisible?'Ocultar sonda':'Exibir sonda'}</button><button type='button' onClick={()=>{dispatch('reset');setFocus('b');setPhase('orbit');setSystemView(false);}}>Reiniciar missão</button></div><progress aria-label='Progresso da varredura simulada' max={100} value={mission.scanProgress}/><p>Varredura simulada: {mission.scanProgress}%{mission.scanProgress===100?' — Nenhum sinal de vida confirmado.':''}</p><ScientificTelemetry calibration={calibration} onCalibration={setCalibration} model={planetModel} onModel={setPlanetModel} flare={flare} onFlare={()=>setFlare(v=>!v)}/><section className='lab-entry' id='laboratorio'><h2>🔬 Laboratório de Pesquisa</h2><p>Importe espectros, compare hipóteses e exporte cenários. Protótipo experimental.</p><button type='button' aria-expanded={labOpen} onClick={()=>setLabOpen(v=>!v)}>{labOpen?'Fechar laboratório':'Abrir laboratório científico'}</button>{labOpen&&<ResearchWorkbench/>}</section></section>
   </>}
   {!oceanMode&&<section className='system-info'><h2>Explorar objetos em 3D</h2><label className='field-label' htmlFor='space-target'>Objeto para explorar</label><select id='space-target' value={focus} onChange={e=>selectTarget(e.target.value as SpaceTargetId)}>{spaceTargets.map(t=><option key={t.id} value={t.id}>{t.name}{t.fictional?' · artístico':''}</option>)}</select><p>{focused.description}</p><p>Clique em um objeto ou escolha na lista. Arraste para girar ao redor dele e use o zoom para explorar.</p><div className='actions'><button type='button' aria-pressed={cinematic} onClick={()=>{if(cinematic&&focused.fictional)setFocus('b');setCinematic(v=>!v);}}>{cinematic?'Cenário cinematográfico ligado':'Ligar cenário cinematográfico'}</button></div><p>Galáxias, poeira, fragmentos e cometa são elementos artísticos. Não representam descobertas no sistema K2-18.</p><p>K2-18 é uma estrela anã vermelha. K2-18 c é outro planeta catalogado no mesmo sistema.</p><p>Os tamanhos, posições e aparências são ilustrativos. As estrelas de fundo e a faixa galáctica são uma composição artística.</p><a href='https://science.nasa.gov/exoplanet-catalog/k2-18-c/' target='_blank' rel='noreferrer'>Fonte: catálogo de exoplanetas da NASA</a></section>}
   <details className='science-panel'><summary>O que sabemos?</summary><p>O planeta é real. Sua aparência é uma {evidenceLabels.simulacao.toLowerCase()}. Nenhum oceano ou ser vivo foi confirmado em K2-18 b.</p><p>{EXOPLANET.distanceLightYearsApprox} anos-luz (aprox.) · {EXOPLANET.massEarths} massas terrestres.</p><p>{EXOPLANET.evidenceStatus}</p></details>
  </aside>
  <footer className='scientific-note'>SIMULAÇÃO ARTÍSTICA · VIDA NÃO CONFIRMADA · NÃO ESTÁ EM ESCALA</footer>
 </main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

