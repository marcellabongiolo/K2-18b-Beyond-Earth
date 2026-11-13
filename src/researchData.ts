export type SpectrumPoint={wavelength:number;value:number;uncertainty:number};
export type ResearchScenario={name:string;model:'hycean'|'miniNeptune';temperatureK:number;pressureBar:number;notes:string;createdAt:string;dataSource:string;points:SpectrumPoint[]};
export function parseSpectrumCsv(text:string):SpectrumPoint[]{
 const rows=text.trim().split(/\r?\n/).filter(Boolean);
 if(rows.length<2)throw new Error('CSV vazio ou sem dados.');
 const header=rows[0].toLowerCase().replace(/\s/g,'').split(',');
 if(header.join(',')!=='wavelength,value,uncertainty')throw new Error('Use as colunas wavelength,value,uncertainty (em micrômetros e unidades documentadas).');
 const points=rows.slice(1).map((row,i)=>{
  const cells=row.split(',');const values=cells.map(Number);
  if(cells.length!==3||cells.some(c=>!c.trim())||values.some(v=>!Number.isFinite(v))||values[0]<=0||values[2]<0)throw new Error('Linha '+(i+2)+' inválida.');
  return {wavelength:values[0],value:values[1],uncertainty:values[2]};
 });
 if(points.length>2000)throw new Error('Máximo de 2.000 linhas por importação.');
 return points;
}
export function exportScenario(s:ResearchScenario){return JSON.stringify({...s,format:'beyond-earth-scenario-v1'},null,2);}
