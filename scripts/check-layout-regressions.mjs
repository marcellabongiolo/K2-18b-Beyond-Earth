import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const css = readFileSync('src/style.css', 'utf8');
const app = readFileSync('src/main.tsx', 'utf8');
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
const lastRule = (selector) => {
  const found = rules.filter(([, names]) => names.split(',').some((name) => name.trim() === selector));
  assert.ok(found.length, 'Missing CSS selector: ' + selector);
  return found.at(-1)[2];
};
const ocean = lastRule('.ocean-canvas');
assert.match(ocean, /position:\s*absolute\s*;/, 'Ocean canvas must fill the scene, not participate in document flow');
assert.match(ocean, /inset:\s*0\s*;/, 'Ocean canvas must fill the viewport');
assert.match(ocean, /height:\s*100%\s*;/, 'Ocean canvas must occupy full height');
assert.match(lastRule('.explorer.controls-hidden>.controls'), /display:\s*none\s*;/, 'Closed controls must not cover the simulation');
assert.match(lastRule('.explorer>.scene'), /grid-area:\s*scene\s*;/, 'Scene must have its own grid area');
assert.match(app, /const \[controlsOpen,setControlsOpen\]=useState\(false\)/, 'Controls should be closed on initial load');
assert.match(app, /<OceanScene\b/, 'Ocean simulation entrypoint must remain present');
console.log('Layout regression checks passed: full ocean canvas, fullscreen scene, controls initially closed.');
