/** Illustrative spectra: not calibrated JWST data or a measured abundance. */
export type PlanetModel = 'hycean' | 'miniNeptune';
export const spectralSpecies = [
 {id:'CH4',label:'Metano · CH₄',center:1.65,width:.095,strength:.62},
 {id:'CO2',label:'Dióxido de carbono · CO₂',center:2.05,width:.11,strength:.72},
 {id:'H2',label:'Hidrogênio · H₂ (atmosfera)',center:1.18,width:.16,strength:.32},
 {id:'DMS',label:'DMS/DMDS · sinal disputado',center:3.35,width:.095,strength:.17}
] as const;
export function spectralSignal(wavelength:number,calibration:number,flare=false):number {
 const filter=Math.max(0,Math.min(100,calibration))/100;
 const baseline=.12+Math.sin(wavelength*19.7)*.022+Math.sin(wavelength*57.3)*.019*(1-filter);
 const peaks=spectralSpecies.reduce((sum,s)=>sum+s.strength*Math.exp(-.5*((wavelength-s.center)/s.width)**2)*(s.id==='DMS'?.25+.75*filter:1),0);
 const noise=(Math.sin(wavelength*143.2)+Math.sin(wavelength*291.7+2))*(.09*(1-filter)+(flare?.075:0));
 return Math.max(0,Math.min(1,baseline+peaks+noise));
}
export function signalAssessment(calibration:number,flare=false):string {
 if(flare)return 'Interferência eletromagnética simulada · dados inconclusivos';
 return calibration<55?'Ruído estatístico · dados inconclusivos':'Possível bioassinatura (não confirmada) · hipótese em aberto';
}
export const planetaryModels:Record<PlanetModel,{name:string;layers:string[];note:string}>={
 hycean:{name:'Mundo hiceânico · hipótese',layers:['Atmosfera rica em H₂','Oceano líquido global hipotético','Interior profundo'],note:'NH₃: possível depleção inferida em modelos, não ausência comprovada. Habitabilidade não demonstrada.'},
 miniNeptune:{name:'Mini-Netuno gasoso · hipótese',layers:['Atmosfera espessa rica em H₂','Camada de fluido/gás supercrítico denso','Núcleo quente'],note:'Sem superfície líquida habitável no modelo ilustrado. Estrutura interna não observada diretamente.'}
};
