import { describe,expect,it } from 'vitest';
import { parseSpectrumCsv,exportScenario } from '../src/researchData';
describe('Research CSV import and reproducibility',()=>{
 it('reads wavelength, values and uncertainties',()=>{expect(parseSpectrumCsv('wavelength,value,uncertainty\n1.2,0.3,0.05')).toEqual([{wavelength:1.2,value:.3,uncertainty:.05}]);});
 it('rejects missing metadata columns and invalid uncertainties',()=>{expect(()=>parseSpectrumCsv('a,b,c\n1,2,3')).toThrow();expect(()=>parseSpectrumCsv('wavelength,value,uncertainty\n1,2,-1')).toThrow();});
 it('exports a versioned scenario without inventing evidence',()=>{const s={name:'teste',model:'hycean' as const,temperatureK:300,pressureBar:1,notes:'hipótese',createdAt:'2026-11-13',dataSource:'manual',points:[]};expect(JSON.parse(exportScenario(s)).format).toBe('beyond-earth-scenario-v1');});
});
