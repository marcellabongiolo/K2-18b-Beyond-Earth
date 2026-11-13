import { planetaryModels, signalAssessment, spectralSignal, spectralSpecies, type PlanetModel } from './scientificTelemetry';

export function ScientificTelemetry({calibration,onCalibration,model,onModel,flare,onFlare}:{calibration:number;onCalibration:(n:number)=>void;model:PlanetModel;onModel:(m:PlanetModel)=>void;flare:boolean;onFlare:()=>void}) {
 const points=Array.from({length:160},(_,i)=>{const x=1+i*2.9/159,y=spectralSignal(x,calibration,flare);return `${i*3.5},${112-y*96}`;}).join(' ');
 const hypothesis=planetaryModels[model];
 return <section className='scientific-telemetry' aria-label='Missão 02 — telemetria científica simulada'>
  <h2>Missão 02 — Telemetria de Sonda</h2>
  <p className='science-warning'>VISUALIZAÇÃO DIDÁTICA · NÃO SÃO DADOS BRUTOS DO JWST · VIDA NÃO CONFIRMADA</p>
  <h3>Espectrômetro de massa · espectro ilustrativo</h3>
  <p>CH₄ e CO₂: moléculas relatadas em estudos atmosféricos. H₂: hipótese de atmosfera rica em hidrogênio. DMS/DMDS: interpretação contestada, sem detecção conclusiva.</p>
  <svg viewBox='0 0 580 136' role='img' aria-label='Gráfico espectral ilustrativo, com picos de metano, dióxido de carbono, hidrogênio e sinal ambíguo de DMS ou DMDS'>
   <rect x='0' y='0' width='580' height='136' fill='#061b2a'/>
   {[20,48,76,104].map(y=><line key={y} x1='24' x2='560' y1={y} y2={y} stroke='#30536a' strokeWidth='.6'/>)}
   <polyline points={points} transform='translate(24,0) scale(1.48,1)' fill='none' stroke={flare?'#ff9c82':'#86e5d4'} strokeWidth='1.8' vectorEffect='non-scaling-stroke'/>
   {spectralSpecies.map(s=><text key={s.id} x={24+(s.center-1)/2.9*536} y='13' fill='#e2f5fa' textAnchor='middle' fontSize='11'>{s.id==='DMS'?'DMS/DMDS?':s.id}</text>)}
   <text x='26' y='130' fill='#a6cbd5' fontSize='10'>1,0 μm</text><text x='520' y='130' fill='#a6cbd5' fontSize='10'>3,9 μm</text>
  </svg>
  <label htmlFor='stellar-noise-filter'>Calibração de filtro de ruído estelar: <b>{calibration}%</b></label>
  <input id='stellar-noise-filter' type='range' min='0' max='100' value={calibration} onChange={e=>onCalibration(Number(e.target.value))}/>
  <p role='status' className='science-reading'>{signalAssessment(calibration,flare)}</p>
  <p className='science-warning'>O filtro altera apenas uma curva sintética; não aumenta a significância estatística de observações reais.</p>
  <h3>Modelo Planetário</h3>
  <div className='actions'><button type='button' aria-pressed={model==='hycean'} onClick={()=>onModel('hycean')}>Mundo hiceânico</button><button type='button' aria-pressed={model==='miniNeptune'} onClick={()=>onModel('miniNeptune')}>Mini-Netuno gasoso</button></div>
  <div className={'planetary-cutaway '+(model==='miniNeptune'?'gas-model':'')} role='img' aria-label={'Corte transversal ilustrativo: '+hypothesis.layers.join(', ')}>
   <div className='cutaway-atmosphere'><div className='cutaway-middle'><div className='cutaway-core'/></div></div>
  </div>
  <strong>{hypothesis.name}</strong>
  <ol>{hypothesis.layers.map(layer=><li key={layer}>{layer}</li>)}</ol>
  <p>{hypothesis.note}</p>
  <h3>Atividade da estrela K2-18</h3>
  <button type='button' aria-pressed={flare} onClick={onFlare}>{flare?'Encerrar flare UV simulado':'Simular erupção estelar (flare UV)'}</button>
  <p role='status'>{flare?'ALERTA: interferência nos sensores e sobrecarga radiativa simulada nos painéis solares.':'Sensores em condição nominal simulada.'}</p>
  <p className='science-warning'>Em investigação pelo JWST · hipóteses em aberto · sem confirmação de oceano, vida ou composição interna.</p>
 </section>;
}
