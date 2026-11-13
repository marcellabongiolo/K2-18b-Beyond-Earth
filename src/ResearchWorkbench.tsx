import { useState, type ChangeEvent } from 'react';
import { exportScenario, parseSpectrumCsv, type SpectrumPoint, type ResearchScenario } from './researchData';
import type { PlanetModel } from './scientificTelemetry';

export function ResearchWorkbench(){
 const [mode,setMode]=useState<'education'|'research'>('education');
 const [points,setPoints]=useState<SpectrumPoint[]>([]);
 const [source,setSource]=useState('');
 const [error,setError]=useState('');
 const [name,setName]=useState('Cenário K2-18 b');
 const [model,setModel]=useState<PlanetModel>('hycean');
 const [temperature,setTemperature]=useState(300);
 const [pressure,setPressure]=useState(1);
 const [notes,setNotes]=useState('');
 async function upload(e:ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0];if(!file)return;
  try{if(file.size>200000)throw new Error('Arquivo acima de 200 KB.');const data=parseSpectrumCsv(await file.text());setPoints(data);setSource(file.name);setError('');}
  catch(err){setError(err instanceof Error?err.message:'Erro ao ler CSV');setPoints([]);}
  e.target.value='';
 }
 function save(){
  const scenario:ResearchScenario={name,model,temperatureK:temperature,pressureBar:pressure,notes,createdAt:new Date().toISOString(),dataSource:source||'Sem observações importadas',points};
  const blob=new Blob([exportScenario(scenario)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='k2-18b-cenario.json';a.click();URL.revokeObjectURL(url);
 }
 const max=Math.max(1,...points.map(p=>p.value+p.uncertainty));
 const min=Math.min(0,...points.map(p=>p.value-p.uncertainty));
 const span=Math.max(.00001,max-min);
 const x=(i:number)=>20+i*520/Math.max(1,points.length-1);
 const y=(n:number)=>135-(n-min)/span*115;
 return <section className='research-workbench' aria-label='Laboratório de pesquisa exploratório'>
  <h2>Laboratório de pesquisa · versão experimental</h2>
  <p>Área educativa e protótipo de análise. Não é um instrumento validado, nem substitui software científico revisado por especialistas.</p>
  <div className='actions'><button type='button' aria-pressed={mode==='education'} onClick={()=>setMode('education')}>Modo educativo</button><button type='button' aria-pressed={mode==='research'} onClick={()=>setMode('research')}>Modo de pesquisa</button></div>
  {mode==='education'?<p>Comece pela Missão 02 para explorar espectros sintéticos e hipóteses. No modo de pesquisa, você pode importar um CSV próprio, visualizar barras de incerteza e exportar cenários reproduzíveis.</p>:<>
   <label className='field-label' htmlFor='research-csv'>Importar espectro CSV (wavelength,value,uncertainty)</label>
   <input id='research-csv' type='file' accept='.csv,text/csv' onChange={upload}/>
   <p>Unidades: comprimento de onda em μm; valor e incerteza na mesma unidade definida pela fonte. O arquivo é processado localmente, sem envio a servidores.</p>
   {error&&<p role='alert'>{error}</p>}
   <p role='status'>{points.length?points.length+' pontos importados de '+source:'Nenhum dado real importado. Não há observações do JWST incluídas automaticamente.'}</p>
   {points.length>0&&<svg viewBox='0 0 560 160' role='img' aria-label='Valores importados com barras de incerteza' style={{width:'100%',background:'#061b2a'}}>
    {points.filter((_,i)=>i%Math.max(1,Math.ceil(points.length/150))===0).map((p,i)=><g key={i} stroke='#8adfd2' strokeWidth='1.3'><line x1={x(i*Math.max(1,Math.ceil(points.length/150)))} x2={x(i*Math.max(1,Math.ceil(points.length/150)))} y1={y(p.value-p.uncertainty)} y2={y(p.value+p.uncertainty)}/><circle cx={x(i*Math.max(1,Math.ceil(points.length/150)))} cy={y(p.value)} r='2' fill='#a7f6e9'/></g>)}
   </svg>}
   <label className='field-label' htmlFor='scenario-name'>Nome do cenário</label><input id='scenario-name' value={name} onChange={e=>setName(e.target.value)}/>
   <label className='field-label' htmlFor='research-model'>Hipótese planetária</label><select id='research-model' value={model} onChange={e=>setModel(e.target.value as PlanetModel)}><option value='hycean'>Hiceânico</option><option value='miniNeptune'>Mini-Netuno</option></select>
   <label className='field-label' htmlFor='research-temp'>Temperatura hipotética (K)</label><input id='research-temp' type='number' min='1' max='10000' value={temperature} onChange={e=>setTemperature(Number(e.target.value))}/>
   <label className='field-label' htmlFor='research-pressure'>Pressão hipotética (bar)</label><input id='research-pressure' type='number' min='0' max='1000000' step='.1' value={pressure} onChange={e=>setPressure(Number(e.target.value))}/>
   <label className='field-label' htmlFor='research-notes'>Fonte científica, DOI, instrumento e limitações</label><textarea id='research-notes' rows={3} value={notes} onChange={e=>setNotes(e.target.value)}/>
   <div className='actions'><button type='button' onClick={save}>Exportar cenário JSON</button></div>
   <p>Os valores importados não são ajustados a modelos físicos nem interpretados automaticamente como bioassinaturas. A origem e a calibração devem ser verificadas por pesquisadores.</p>
  </>}
  <h3>Fontes e colaboração</h3>
  <p><a href='https://archive.stsci.edu/' target='_blank' rel='noreferrer'>MAST · arquivo astronômico público</a> · <a href='https://exoplanetarchive.ipac.caltech.edu/' target='_blank' rel='noreferrer'>NASA Exoplanet Archive</a> · <a href='https://github.com/marcellabongiolo/K2-18b-Beyond-Earth' target='_blank' rel='noreferrer'>Código e colaboração no GitHub</a></p>
  <p>Próximos passos para uso científico: ingestão FITS com metadados, calibração, proveniência, validação de unidades, ajustes estatísticos e revisão por pesquisadores. Ainda não há API pública de dados nem colaboração multiusuário.</p>
 </section>;
}
