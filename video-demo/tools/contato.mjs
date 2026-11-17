// Folha de contato: um quadro por instante pedido (capítulo 09 do guia: rodadas de crítica).
// uso: NODE_PATH=$(npm root -g) node video-demo/tools/contato.mjs <url-do-index> <saida.jpg> [t1,t2,...]
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [url, saida, lista] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 540, height: 960 } });
const erros = [];
p.on('pageerror', (e) => { if (!/modo render/.test(e.message)) erros.push(e.message); });
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') erros.push(m.text()); });
await p.goto(url + (url.includes('?') ? '&' : '?') + 'render=1', { waitUntil: 'networkidle' });
await p.waitForFunction(() => window.filmReady, null, { timeout: 30000 });
const dur = await p.evaluate(() => window.DURATION);
const tempos = lista ? lista.split(',').map(Number) : Array.from({ length: 24 }, (_, i) => +(0.4 + (i * (dur - 0.8)) / 23).toFixed(2));
const quadros = await p.evaluate(async (ts) => {
  const c = document.getElementById('film');
  const out = [];
  for (const t of ts) { window.seek(t); out.push(c.toDataURL('image/jpeg', 0.7)); }
  return out;
}, tempos);
// monta a grade no próprio navegador
const grade = await p.evaluate(async ({ quadros, tempos }) => {
  const cols = 6, w = 270, h = 480, rows = Math.ceil(quadros.length / cols);
  const cv = document.createElement('canvas'); cv.width = cols * w; cv.height = rows * h;
  const g = cv.getContext('2d'); g.fillStyle = '#111'; g.fillRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < quadros.length; i++) {
    const im = new Image(); im.src = quadros[i]; await im.decode();
    const x = (i % cols) * w, y = Math.floor(i / cols) * h;
    g.drawImage(im, x + 2, y + 2, w - 4, h - 4);
    g.fillStyle = 'rgba(0,0,0,.65)'; g.fillRect(x + 6, y + 6, 70, 26);
    g.fillStyle = '#fff'; g.font = '700 16px sans-serif'; g.fillText(tempos[i].toFixed(1) + 's', x + 12, y + 25);
  }
  return cv.toDataURL('image/jpeg', 0.8);
}, { quadros, tempos });
writeFileSync(saida, Buffer.from(grade.split(',')[1], 'base64'));
console.log(`duração ${dur}s, ${tempos.length} quadros → ${saida}`);
if (erros.length) console.log('AVISOS:\n' + [...new Set(erros)].join('\n'));
await b.close();
