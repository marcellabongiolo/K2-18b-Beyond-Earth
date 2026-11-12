import { describe, expect, it } from 'vitest';
import { softenLongitudeSeam } from '../src/planetTexture';
describe('spherical texture seam',()=>{
 it('matches longitude endpoints in all channels while preserving the interior',()=>{
  const data=new Uint8ClampedArray(12*2*4);for(let i=0;i<data.length;i++)data[i]=(i*7)%256;
  const original=data.slice();softenLongitudeSeam(data,12,2,3);
  for(let row=0;row<2;row++)for(let c=0;c<4;c++)expect(data[row*48+c]).toBe(data[row*48+44+c]);
  for(let x=3;x<9;x++)for(let c=0;c<4;c++)expect(data[x*4+c]).toBe(original[x*4+c]);
 });
});
