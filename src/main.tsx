import React, { Suspense, useState, useReducer } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Vector3 } from 'three';
import { PlanetSurface } from './PlanetSurface';
import { EXOPLANET, evidenceLabels } from './science';
import './style.css';
import { Probe } from './Probe';
import { initialMission, nextMission, telemetry } from './mission';
import { Atmosphere } from './Atmosphere';
import { flightPhases, flightTarget, transitionFactor, type FlightPhase } from './descent';
import { OceanScene } from './OceanScene';
import { initialOcean, oceanReducer, oceanZone } from './ocean';


function CinematicCamera({ phase }: { phase: FlightPhase }) {
  const { camera } = useThree();
  useFrame((_, delta) => {
    if (phase === 'descent') camera.position.lerp(new Vector3(...flightTarget(phase)), transitionFactor(delta));
    else if (camera.position.length() < 5.9) camera.position.lerp(new Vector3(...flightTarget(phase)), transitionFactor(delta));
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function SpaceScene({ probeVisible, phase }: { probeVisible: boolean; phase: FlightPhase }) {
  return <Canvas camera={{ position: [0, 0.15, 6], fov: 43 }} dpr={[1, 1.75]} gl={{ antialias: true }}>
    <color attach="background" args={['#030711']} />
    <ambientLight intensity={0.3} />
    <directionalLight position={[-5, 3, 5]} intensity={2.4} color="#c5e9ff" />
    <pointLight position={[5, -3, -2]} intensity={12} color="#3b72a3" />
    <Suspense fallback={null}><PlanetSurface /><Atmosphere active={phase === 'descent'} />{probeVisible && <Probe />}<Stars radius={95} depth={55} count={3000} factor={3} saturation={0} fade speed={0.15} /></Suspense>
    <CinematicCamera phase={phase} /><OrbitControls enabled={phase === "orbit"} enablePan={false} minDistance={3.3} maxDistance={13} autoRotate autoRotateSpeed={0.28} enableDamping dampingFactor={0.045} />
  </Canvas>;
}

function App() {
  const [showScience, setShowScience] = useState(false);
  const [phase, setPhase] = useState<FlightPhase>('orbit');
  const [oceanMode, setOceanMode] = useState(false);
  const [ocean, oceanDispatch] = useReducer(oceanReducer, initialOcean);
  const [probeVisible, setProbeVisible] = useState(true);
  const [mission, dispatch] = useReducer(nextMission, initialMission);
  const signal = telemetry(mission.distance);
  return <main className="mission">
    <div className="viewport" aria-label="Visualização artística interativa em três dimensões do exoplaneta K2-18 b">{oceanMode ? <OceanScene state={ocean} /> : <SpaceScene probeVisible={probeVisible} phase={phase} />}</div>
    <header className="topbar"><span className="brand">BEYOND <b>EARTH</b></span><span className="mission-tag">MISSION 04 / HYPOTHETICAL OCEAN</span></header>
    <section className="hero" hidden={oceanMode}><div className="eyebrow">EXOPLANETARY EXPLORATION PROGRAM</div><h1>K2-18 <em>b</em></h1><p>Um mundo distante. Perguntas extraordinárias.</p><div className="chips"><span>{EXOPLANET.distanceLightYearsApprox} anos-luz (aprox.)</span><span>{EXOPLANET.massEarths} massas terrestres</span></div></section>
    <section className="ocean-mode-panel" aria-label="Ambientes da missão"><div className="panel-heading">EXPLORATION ENVIRONMENTS</div><div className="flight-actions"><button type="button" aria-pressed={!oceanMode} onClick={() => setOceanMode(false)}>Espaço orbital</button><button type="button" aria-pressed={oceanMode} onClick={() => setOceanMode(true)}>Oceano hipotético</button></div></section>{oceanMode && <section className="ocean-panel" aria-label="Controles do submersível"><div className="panel-heading">AURORA-02 / SUBMERSIBLE SIMULATION</div><h2>{oceanZone(ocean.depth)}</h2><div className="telemetry-grid"><span>PROFUNDIDADE VIRTUAL <b>{ocean.depth} U</b></span><span>RUMO <b>{ocean.heading}°</b></span><span>AMOSTRAS FICTÍCIAS <b>{ocean.samples}/5</b></span><span>BIOSSINAIS <b>NÃO CONFIRMADOS</b></span></div><div className="probe-actions"><button type="button" onClick={() => oceanDispatch("dive")}>Mergulhar</button><button type="button" onClick={() => oceanDispatch("ascend")}>Subir</button><button type="button" onClick={() => oceanDispatch("turnLeft")}>Girar ←</button><button type="button" onClick={() => oceanDispatch("turnRight")}>Girar →</button><button type="button" onClick={() => oceanDispatch("sample")}>Coletar amostra</button><button type="button" onClick={() => oceanDispatch("reset")}>Reiniciar</button></div><p>Ambiente e organismos totalmente fictícios. Nenhum oceano ou ser vivo foi confirmado em K2-18 b.</p></section>}{!oceanMode && <section className="flight-panel" aria-label="Fases da exploração"><div className="panel-heading">FLIGHT DIRECTOR / CINEMATIC MODE</div><h2>{flightPhases[phase]}</h2><p>Transição visual hipotética: não representa imagens reais da atmosfera de K2-18 b.</p><div className="flight-actions"><button type="button" aria-pressed={phase === "orbit"} onClick={() => setPhase("orbit")}>Visão orbital</button><button type="button" aria-pressed={phase === "descent"} onClick={() => setPhase("descent")}>Iniciar aproximação</button></div></section>} {!oceanMode && <section className="probe-panel" aria-label="Painel de controle da sonda"><div className="panel-heading">DEEP SPACE PROBE / LIVE SIMULATION</div><h2>SONDA AURORA-01</h2><div className="telemetry-grid"><span>STATUS <b>OPERACIONAL</b></span><span>MODO <b>{mission.mode.toUpperCase()}</b></span><span>DISTÂNCIA VIRTUAL <b>{signal.distanceDisplay} U</b></span><span>SINAL SIMULADO <b>{signal.signal}%</b></span></div><div className="probe-actions"><button type="button" onClick={() => dispatch("approach")}>− Aproximar</button><button type="button" onClick={() => dispatch("retreat")}>+ Afastar</button><button type="button" onClick={() => dispatch("scan")}>Escanear</button><button type="button" onClick={() => setProbeVisible(v => !v)}>{probeVisible ? "Ocultar sonda" : "Exibir sonda"}</button></div><div className="scan-track" role="progressbar" aria-label="Progresso da varredura simulada" aria-valuemin={0} aria-valuemax={100} aria-valuenow={mission.scanProgress}><span style={{width: mission.scanProgress + "%"}} /></div><p>VARREDURA SIMULADA: {mission.scanProgress}%</p>{mission.scanProgress === 100 && <p className="scan-result">Varredura concluída. Nenhum sinal de vida confirmado. Esta análise é uma simulação visual.</p>}<button className="reset" type="button" onClick={() => dispatch("reset")}>Reiniciar missão</button></section>}<aside className="science-panel"><div className="panel-heading"><span className="pulse"/> TRANSMISSÃO CIENTÍFICA</div><h2>O que sabemos?</h2><p>O planeta é real. Sua aparência nesta experiência é uma <strong>{evidenceLabels.simulacao.toLowerCase()}</strong>, não uma fotografia ou reconstrução confirmada.</p><p>{EXOPLANET.evidenceStatus}</p><button type="button" onClick={() => setShowScience(!showScience)} aria-expanded={showScience}>{showScience ? 'Ocultar detalhes' : 'Abrir dados da missão'}</button>{showScience && <div className="details"><p><strong>Descoberto:</strong> {EXOPLANET.discoveryYear}</p><p><strong>Possíveis oceanos:</strong> {evidenceLabels.hipotese}</p><p><strong>Vida:</strong> não detectada nem confirmada.</p><p><strong>Observação:</strong> análises atmosféricas continuam em debate científico.</p></div>}</aside>
    <footer className="footer"><span>ARRASTE PARA ORBITAR · ROLE PARA APROXIMAR</span><span>SIMULAÇÃO VISUAL · NÃO ESTÁ EM ESCALA</span></footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
