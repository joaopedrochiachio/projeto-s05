// Renderiza o filme em MP4 1080×1920 (capítulo 09 do guia): abre o index em modo render,
// chama window.seek(t) quadro a quadro e envia os quadros ao ffmpeg. Junta a narração se existir.
// uso: NODE_PATH=$(npm root -g) node video-demo/tools/render.mjs <url-do-index> [--fps 30] [--range 0:5] [--saida arquivo.mp4]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const url = args[0];
const fps = Number(opt('--fps', 30));
const saida = opt('--saida', join(DIR, 'entrega', `mural-vagas-nesp-${fps}fps.mp4`));
const audio = join(DIR, 'audio', 'narracao.mp3');

const b = await chromium.launch({ args: ['--disable-web-security'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', (e) => { if (!/modo render/.test(e.message)) console.error('erro na página:', e.message); });
await p.goto(url + (url.includes('?') ? '&' : '?') + 'render=1', { waitUntil: 'networkidle' });
await p.waitForFunction(() => window.filmReady, null, { timeout: 60000 });
const dur = await p.evaluate(() => window.DURATION);
const [ini, fim] = (opt('--range', `0:${dur}`)).split(':').map(Number);
const total = Math.round((Math.min(fim, dur) - ini) * fps);

await import('node:fs').then((fs) => fs.mkdirSync(dirname(saida), { recursive: true }));
const comAudio = existsSync(audio);
const ff = spawn('ffmpeg', [
  '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  ...(comAudio ? ['-ss', String(ini), '-i', audio] : []),
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps),
  ...(comAudio ? ['-af', 'loudnorm=I=-14:TP=-1:LRA=11,apad', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest'] : []),
  '-movflags', '+faststart', saida,
], { stdio: ['pipe', 'inherit', 'inherit'] });

const LOTE = 8;
const t0 = Date.now();
for (let i = 0; i < total; i += LOTE) {
  const ts = Array.from({ length: Math.min(LOTE, total - i) }, (_, k) => ini + (i + k) / fps);
  const quadros = await p.evaluate((ts) => {
    const c = document.getElementById('film');
    return ts.map((t) => { window.seek(t); return c.toDataURL('image/jpeg', 0.95).split(',')[1]; });
  }, ts);
  for (const q of quadros) if (!ff.stdin.write(Buffer.from(q, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
  if ((i / LOTE) % 15 === 0) process.stdout.write(`\r${Math.min(i + LOTE, total)}/${total} quadros (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await b.close();
console.log(`\n✓ ${saida} (${total} quadros, ${fps} fps${comAudio ? ', com narração' : ', sem áudio'})`);
