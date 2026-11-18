// Gera um vo.json ESTIMADO a partir do roteiro, para montar o filme antes de existir a narração.
// Quando o áudio real chegar, tools/sincronizar.py substitui este arquivo pelo tempo medido (Whisper).
// uso: node video-demo/tools/estimar_vo.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const rot = JSON.parse(readFileSync(join(DIR, 'roteiro.json'), 'utf8'));
const letras = (w) => w.normalize('NFD').replace(/[^\p{L}\p{N}]/gu, '').length;

let t = 0.35;
const words = [], frases = [];
for (const fala of rot.falas) {
  const i0 = words.length, f0 = t;
  for (const w of fala.split(/\s+/)) {
    const d = 0.085 + 0.05 * letras(w);
    words.push({ w, t0: +t.toFixed(3), t1: +(t + d).toFixed(3) });
    t += d;
    if (/[,:]$/.test(w)) t += 0.2;
    else if (/[.?!]$/.test(w) && w !== fala.split(/\s+/).at(-1)) t += 0.32;
  }
  frases.push({ texto: fala, t0: +f0.toFixed(3), t1: +t.toFixed(3), words: [i0, words.length - 1] });
  t += 0.32;
}
const dur = +(t + 2.8).toFixed(2);
writeFileSync(join(DIR, 'vo.json'), JSON.stringify({ estimado: true, words, frases, dur }, null, 1));
console.log(`vo.json estimado: ${words.length} palavras, ${frases.length} frases, ${dur}s`);
