import { describe, expect, it } from 'vitest';
import { cloudField, noise2d, smoothNoise } from '../src/planetTexture';
describe('deterministic visual texture', () => {
 it('returns stable normalized noise', () => { expect(noise2d(3, 5)).toBe(noise2d(3, 5)); for (let x=0;x<10;x++) expect(noise2d(x, x+1)).toBeGreaterThanOrEqual(0); });
 it('smooth noise stays normalized', () => { for(let i=0;i<20;i++){const n=smoothNoise(i*0.37,i*0.19);expect(n).toBeGreaterThanOrEqual(0);expect(n).toBeLessThanOrEqual(1);} });
 it('multi-octave cloud field is finite', () => { for(let i=0;i<20;i++) expect(Number.isFinite(cloudField(i*0.13,i*0.31))).toBe(true); });
});
