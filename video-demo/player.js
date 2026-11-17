// Player interativo do filme: relógio (áudio ou interno), linha do tempo com capítulos,
// legenda karaokê presa ao vo.json, atalhos de teclado e modo render (?render=1) para gerar o MP4.
import { draw, setup, IMAGES, CHAPTERS, LOGO_D, W, H } from './film.js';
import { loadVO } from './lib/vo.js';

const params = new URLSearchParams(location.search);
const RENDER = params.get('render') === '1';
const $ = (id) => document.getElementById(id);
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const ICON = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4" height="15" rx="1.2"/><rect x="14" y="4.5" width="4" height="15" rx="1.2"/></svg>',
  som: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5ZM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  mudo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5ZM22 9l-6 6M16 9l6 6"/></svg>',
};

if (RENDER) document.body.classList.add('render');
$('logoPath')?.setAttribute('d', LOGO_D);

// ------------------------------------------------------------------ carga
const [VO, telas] = await Promise.all([loadVO(), fetch('app/telas.json').then((r) => r.json())]);
setup(VO, telas);
const DUR = VO.dur;
await Promise.all([600, 700, 800, 900].map((w) => document.fonts.load(`${w} 40px Inter`).catch(() => null)));
const IMG = {};
await Promise.all(Object.entries(IMAGES).map(async ([k, src]) => {
  const im = new Image(); im.src = src;
  try { await im.decode(); IMG[k] = im; } catch { console.error('imagem não carregou', src); }
}));

const canvas = $('film');
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d', { alpha: false });
const pinta = (t) => draw(ctx, Math.max(0, Math.min(DUR, t)), IMG);

// API de render (contrato do guia): window.seek(t) desenha o quadro t.
window.seek = (t) => pinta(t);
window.DURATION = DUR;
window.filmReady = true;
if (RENDER) { pinta(0); throw new Error('modo render: player desligado'); }

// ------------------------------------------------------------------ relógio
const audio = $('audio');
let temAudio = false, tocando = false, t = 0, base = 0, inicio = 0, vel = 1, mudo = false;
audio.src = 'audio/narracao.mp3';
audio.addEventListener('canplaythrough', () => { temAudio = true; atualizaEstado(); atualizaSom(); }, { once: true });
audio.addEventListener('error', () => { temAudio = false; atualizaEstado(); atualizaSom(); }, { once: true });
audio.addEventListener('ended', () => pausa());

const agora = () => {
  if (temAudio && tocando) return audio.currentTime;
  return tocando ? base + ((performance.now() - inicio) / 1000) * vel : t;
};
function toca() {
  if (t >= DUR - 0.05) vaiPara(0);
  tocando = true; $('playGrande').hidden = true;
  base = t; inicio = performance.now();
  if (temAudio) { audio.currentTime = t; audio.playbackRate = vel; audio.muted = mudo; audio.play().catch(() => { temAudio = false; }); }
  atualizaPlay(); loop();
}
function pausa() {
  t = agora(); tocando = false;
  if (temAudio) audio.pause();
  atualizaPlay(); render();
  history.replaceState(null, '', `#t=${t.toFixed(2)}`);
}
const alterna = () => (tocando ? pausa() : toca());
function vaiPara(nt, { mostra = false } = {}) {
  t = Math.max(0, Math.min(DUR, nt));
  base = t; inicio = performance.now();
  if (temAudio) audio.currentTime = t;
  if (mostra) $('playGrande').hidden = true;
  render();
}
function loop() {
  if (!tocando) return;
  t = agora();
  if (t >= DUR) { t = DUR; pausa(); return; }
  render();
  requestAnimationFrame(loop);
}

// ------------------------------------------------------------------ interface
const caps = CHAPTERS.map((c, i) => ({ ...c, fim: i + 1 < CHAPTERS.length ? CHAPTERS[i + 1].t : DUR }));
const capAtual = (tt) => { let k = 0; caps.forEach((c, i) => { if (tt >= c.t - 0.01) k = i; }); return k; };

const lista = $('caps');
lista.innerHTML = caps.map((c, i) => `
  <li><button class="cap" data-i="${i}">
    <span class="n">${i + 1}</span>
    <span><span class="tit">${c.titulo}</span><span class="sub">${c.sub}</span></span>
    <span class="dir"><span class="tag">${c.tag}</span><span class="t">${fmt(c.t)}</span></span>
    <span class="barra"></span>
  </button></li>`).join('');
lista.addEventListener('click', (e) => {
  const b = e.target.closest('.cap'); if (!b) return;
  vaiPara(caps[+b.dataset.i].t + 0.02, { mostra: true });
  if (!tocando) toca();
});
const botoesCap = [...lista.querySelectorAll('.cap')];

$('marcas').innerHTML = caps.slice(1).map((c) => `<span class="marca" style="left:${(100 * c.t) / DUR}%"></span>`).join('');

const linha = $('linha');
const tAt = (x) => { const r = linha.getBoundingClientRect(); return ((x - r.left) / r.width) * DUR; };
let arrastando = false, tocavaAntes = false;
linha.addEventListener('pointerdown', (e) => {
  arrastando = true; tocavaAntes = tocando; if (tocando) pausa();
  linha.setPointerCapture(e.pointerId); vaiPara(tAt(e.clientX), { mostra: true });
});
linha.addEventListener('pointermove', (e) => {
  const tt = Math.max(0, Math.min(DUR, tAt(e.clientX)));
  const dica = $('dica'); dica.textContent = `${fmt(tt)} · ${caps[capAtual(tt)].titulo}`;
  dica.style.left = `${(100 * tt) / DUR}%`;
  if (arrastando) vaiPara(tt);
});
linha.addEventListener('pointerup', () => { arrastando = false; if (tocavaAntes) toca(); });

let legendaOn = true;
const legenda = $('legenda');
function atualizaLegenda(tt) {
  const fr = VO.frases.find((f) => tt >= f.t0 - 0.15 && tt <= f.t1 + 0.35);
  if (!fr || !legendaOn) { legenda.classList.add('off'); return; }
  legenda.classList.remove('off');
  const [i0, i1] = fr.words;
  let html = '';
  for (let i = i0; i <= i1; i++) {
    const w = VO.words[i];
    const dito = tt >= w.t0;
    html += (dito ? `<b class="${tt < w.t1 ? 'agora' : ''}">${w.w}</b>` : w.w) + ' ';
  }
  const p = legenda.firstElementChild;
  if (p.innerHTML !== html) p.innerHTML = html;
}

function render() {
  pinta(t);
  const pct = (100 * t) / DUR;
  $('cheio').style.width = `${pct}%`;
  $('cabeca').style.left = `${pct}%`;
  $('tempo').textContent = `${fmt(t)} / ${fmt(DUR)}`;
  linha.setAttribute('aria-valuenow', t.toFixed(1)); linha.setAttribute('aria-valuemax', DUR.toFixed(1));
  const k = capAtual(t);
  botoesCap.forEach((b, i) => {
    b.classList.toggle('ativo', i === k);
    b.classList.toggle('feito', i < k);
    b.querySelector('.barra').style.width = i === k ? `${(100 * (t - caps[i].t)) / (caps[i].fim - caps[i].t)}%` : '0';
  });
  atualizaLegenda(t);
}
function atualizaPlay() { $('bPlay').innerHTML = tocando ? ICON.pause : ICON.play; $('bPlay').setAttribute('aria-label', tocando ? 'Pausar' : 'Reproduzir'); }
function atualizaSom() {
  const b = $('bSom'); b.disabled = !temAudio; b.innerHTML = mudo || !temAudio ? ICON.mudo : ICON.som;
  b.title = temAudio ? 'Som (M)' : 'Sem áudio de narração ainda';
}
function atualizaEstado() {
  const e = $('estado');
  const ok = !VO.estimado && temAudio;
  e.classList.toggle('ok', ok);
  e.querySelector('span').textContent = ok
    ? `Narração sincronizada • ${VO.words.length} palavras no tempo`
    : temAudio
      ? 'Áudio carregado, mas os tempos ainda são estimados'
      : 'Prévia sem áudio • tempos estimados até a narração chegar';
}
let flashT = 0;
function flash(txt) { const el = $('flash'); el.textContent = txt; el.classList.add('on'); clearTimeout(flashT); flashT = setTimeout(() => el.classList.remove('on'), 900); }

$('bPlay').addEventListener('click', alterna);
$('playGrande').addEventListener('click', toca);
canvas.addEventListener('click', alterna);
$('bVolta').addEventListener('click', () => { const k = capAtual(t); vaiPara(caps[t - caps[k].t > 1 ? k : Math.max(0, k - 1)].t + 0.02, { mostra: true }); });
$('bAvanca').addEventListener('click', () => vaiPara(caps[Math.min(caps.length - 1, capAtual(t) + 1)].t + 0.02, { mostra: true }));
const VELS = [1, 1.5, 2, 0.5, 0.75];
$('bVel').addEventListener('click', () => {
  vel = VELS[(VELS.indexOf(vel) + 1) % VELS.length];
  $('bVel').textContent = `${vel}×`.replace('0.', ',').replace('.', ',');
  t = agora(); base = t; inicio = performance.now();
  if (temAudio) audio.playbackRate = vel;
  flash(`Velocidade ${$('bVel').textContent}`);
});
$('bCC').addEventListener('click', () => { legendaOn = !legendaOn; $('bCC').classList.toggle('ativo', legendaOn); $('bCC').setAttribute('aria-pressed', legendaOn); render(); });
$('bSom').addEventListener('click', () => { mudo = !mudo; audio.muted = mudo; atualizaSom(); });
$('bTela').addEventListener('click', () => (document.fullscreenElement ? document.exitFullscreen() : $('palco').requestFullscreen?.()));

addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea')) return;
  const k = e.key;
  if (k === ' ' || k === 'k') { e.preventDefault(); alterna(); }
  else if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); vaiPara(agora() + (k === 'ArrowRight' ? 2 : -2), { mostra: true }); }
  else if (k === '.' || k === ',') { if (tocando) pausa(); vaiPara(t + (k === '.' ? 1 : -1) / 60, { mostra: true }); }
  else if (k === 'ArrowDown') { e.preventDefault(); $('bAvanca').click(); }
  else if (k === 'ArrowUp') { e.preventDefault(); $('bVolta').click(); }
  else if (k === 'c') $('bCC').click();
  else if (k === 'm') $('bSom').click();
  else if (k === 'f') $('bTela').click();
  else if (/^[1-9]$/.test(k) && caps[+k - 1]) vaiPara(caps[+k - 1].t + 0.02, { mostra: true });
});

// estado inicial: #t=12.5 abre direto no tempo; senão, um quadro de capa
const hash = location.hash.match(/t=([\d.]+)/);
atualizaPlay(); atualizaSom(); atualizaEstado();
if (hash) vaiPara(+hash[1], { mostra: true });
else { t = Math.min(DUR, caps[3]?.t + 1.2 || 0); render(); legenda.classList.add('off'); t = 0; $('cheio').style.width = '0'; $('cabeca').style.left = '0'; $('tempo').textContent = `0:00 / ${fmt(DUR)}`; }
