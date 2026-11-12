import { describe, expect, it } from 'vitest';
import { initialOcean, oceanReducer, oceanZone } from '../src/ocean';
describe('hypothetical ocean navigation', () => {
 it('clamps dive and ascent', () => { let s=initialOcean; for(let i=0;i<100;i++)s=oceanReducer(s,'dive');expect(s.depth).toBe(1000);for(let i=0;i<100;i++)s=oceanReducer(s,'ascend');expect(s.depth).toBe(0); });
 it('wraps heading safely', () => { expect(oceanReducer(initialOcean,'turnLeft').heading).toBe(345);expect(oceanReducer({ ...initialOcean,heading:345 },'turnRight').heading).toBe(0); });
 it('limits simulated samples and resets', () => { let s=initialOcean;for(let i=0;i<10;i++){s=oceanReducer(s,'sample');for(let tick=0;tick<10;tick++)s=oceanReducer(s,'sampleTick');}expect(s.samples).toBe(5);expect(oceanReducer(s,'reset')).toEqual(initialOcean); });
 it('labels every region as fictional', () => { for(const depth of [0,120,400,800]) expect(oceanZone(depth)).toMatch(/FICTÍCI/); });
});