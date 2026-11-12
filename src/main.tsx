import React, { Suspense, useState, useReducer } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { AdditiveBlending, BackSide } from 'three';
import { EXOPLANET, evidenceLabels } from './science';
import './style.css';
import { Probe } from './Probe';
import { initialMission, nextMission, telemetry } from './mission';

function Planet() {
  return <group rotation={[0.17, 0, -0.12]}>
    <mesh rotation={[0, 0.25, 0]}>
      <sphereGeometry args={[1.7, 96, 64]} />
      <meshStandardMaterial color="#18466d" roughness={0.82} metalness={0.02} />
    </mesh>
    <mesh rotation={[0, 0.8, 0]}>
      <sphereGeometry args={[1.725, 96, 64]} />
      <meshStandardMaterial color="#9fc6dc" transparent opacity={0.17} roughness={1} depthWrite={false} />
    </mesh>
    <mesh>
      <sphereGeometry args={[1.85, 96, 64]} />
      <meshBasicMaterial color="#58b6f0" transparent opacity={0.095} side={BackSide} blending={AdditiveBlending} depthWrite={false} />
    </mesh>
  </group>;
}

function SpaceScene({ probeVisible }: { probeVisible: boolean }) {
  return <Canvas camera={{ position: [0, 0.15, 6], fov: 43 }} dpr={[1, 1.75]} gl={{ antialias: true }}>
    <color attach="background" args={['#030711']} />
    <ambientLight intensity={0.3} />
    <directionalLight position={[-5, 3, 5]} intensity={2.4} color="#c5e9ff" />
    <pointLight position={[5, -3, -2]} intensity={12} color="#3b72a3" />
    <Suspense fallback={null}><Planet />{probeVisible && <Probe />}<Stars radius={95} depth={55} count={3000} factor={3} saturation={0} fade speed={0.15} /></Suspense>
    <OrbitControls enablePan={false} minDistance={3.3} maxDistance={13} autoRotate autoRotateSpeed={0.28} enableDamping dampingFactor={0.045} />
  </Canvas>;
}

function App() {
  const [showScience, setShowScience] = useState(false);
  const [probeVisible, setProbeVisible] = useState(true);
  const [mission, dispatch] = useReducer(nextMission, initialMission);
  const signal = telemetry(mission.distance);
  return <main className="mission">
    <div className="viewport" aria-label="Visualização artística interativa em três dimensões do exoplaneta K2-18 b"><SpaceScene probeVisible={probeVisible} /></div>
    <header className="topbar"><span className="brand">BEYOND <b>EARTH</b></span><span className="mission-tag">MISSION 01 / ORBITAL RECONNAISSANCE</span></header>
    <section className="hero"><div className="eyebrow">EXOPLANETARY EXPLORATION PROGRAM</div><h1>K2-18 <em>b</em></h1><p>Um mundo distante. Perguntas extraordinárias.</p><div className="chips"><span>{EXOPLANET.distanceLightYearsApprox} anos-luz (aprox.)</span><span>{EXOPLANET.massEarths} massas terrestres</span></div></section>
    <section className="probe-panel" aria-label="Painel de controle da sonda"><div className="panel-heading">DEEP SPACE PROBE / LIVE SIMULATION</div><h2>SONDA AURORA-01</h2><div className="telemetry-grid"><span>STATUS <b>OPERACIONAL</b></span><span>MODO <b>{mission.mode.toUpperCase()}</b></span><span>DISTÂNCIA VIRTUAL <b>{signal.distanceDisplay} U</b></span><span>SINAL SIMULADO <b>{signal.signal}%</b></span></div><div className="probe-actions"><button type="button" onClick={() => dispatch("approach")}>− Aproximar</button><button type="button" onClick={() => dispatch("retreat")}>+ Afastar</button><button type="button" onClick={() => dispatch("scan")}>Escanear</button><button type="button" onClick={() => setProbeVisible(v => !v)}>{probeVisible ? "Ocultar sonda" : "Exibir sonda"}</button></div><div className="scan-track" role="progressbar" aria-label="Progresso da varredura simulada" aria-valuemin={0} aria-valuemax={100} aria-valuenow={mission.scanProgress}><span style={{width: mission.scanProgress + "%"}} /></div><p>VARREDURA SIMULADA: {mission.scanProgress}%</p>{mission.scanProgress === 100 && <p className="scan-result">Varredura concluída. Nenhum sinal de vida confirmado. Esta análise é uma simulação visual.</p>}<button className="reset" type="button" onClick={() => dispatch("reset")}>Reiniciar missão</button></section><aside className="science-panel"><div className="panel-heading"><span className="pulse"/> TRANSMISSÃO CIENTÍFICA</div><h2>O que sabemos?</h2><p>O planeta é real. Sua aparência nesta experiência é uma <strong>{evidenceLabels.simulacao.toLowerCase()}</strong>, não uma fotografia ou reconstrução confirmada.</p><p>{EXOPLANET.evidenceStatus}</p><button type="button" onClick={() => setShowScience(!showScience)} aria-expanded={showScience}>{showScience ? 'Ocultar detalhes' : 'Abrir dados da missão'}</button>{showScience && <div className="details"><p><strong>Descoberto:</strong> {EXOPLANET.discoveryYear}</p><p><strong>Possíveis oceanos:</strong> {evidenceLabels.hipotese}</p><p><strong>Vida:</strong> não detectada nem confirmada.</p><p><strong>Observação:</strong> análises atmosféricas continuam em debate científico.</p></div>}</aside>
    <footer className="footer"><span>ARRASTE PARA ORBITAR · ROLE PARA APROXIMAR</span><span>SIMULAÇÃO VISUAL · NÃO ESTÁ EM ESCALA</span></footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
