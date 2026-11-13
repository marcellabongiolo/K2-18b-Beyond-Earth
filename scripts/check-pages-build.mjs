import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = 'dist';
const fail = (message) => { console.error('Smoke check failed: ' + message); process.exitCode = 1; };
const check = (name, required) => {
  const path = join(root, name);
  if (!existsSync(path)) { fail('Missing published entrypoint: ' + name); return; }
  const html = readFileSync(path, 'utf8');
  for (const marker of required) if (!html.includes(marker)) fail(name + ' missing ' + marker);
  if (html.includes('src="/assets/') || html.includes('href="/assets/')) fail(name + ' uses root-absolute asset URLs, incompatible with project Pages paths');
  console.log('Checked ' + name);
};
check('index.html', ['<html', '</html>', 'id="root"']);
check('lab.html', ['<html', '</html>', 'id="plot"', 'id="compare-file"', 'id="history"', 'id="save"']);
if (!existsSync(join(root, 'assets')) || !readdirSync(join(root, 'assets')).some(f => f.endsWith('.js'))) fail('No compiled JavaScript assets');
if (!process.exitCode) console.log('Static GitHub Pages build smoke checks passed');
