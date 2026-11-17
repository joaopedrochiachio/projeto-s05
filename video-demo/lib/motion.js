// motion.js: o "motor" de um filme que é função pura do tempo.
//
// Derivado de assets/lib/motion.js do motion-reel v1.3.0 (MIT, Aries Spring; ver vendor/motion-reel/LICENSE).
// Única mudança de comportamento: o gancho globalThis.FONTES_EXTRA (fontes a mais para pré-carregar, que
// index.html pode definir antes do film.js, por exemplo numa variação de estilo).
//
//   import * as M from '../../lib/motion.js';
//   M.film({ fonts: [...], images: {...}, init(ctx) {...}, draw(ctx, u, t) {...}, hits: HITS });
//
// draw() recebe u (tempos de batida no grid medido de beats.json) e t (segundos). Ele precisa pintar o quadro
// inteiro só a partir do tempo: nada de estado entre chamadas, nada de Math.random, nada de timers.
// film() dimensiona o canvas para o formato pedido, carrega beats.json + film.json + fontes + imagens,
// instala window.seek(t) com desfoque de movimento por sub-quadros e, fora do modo render, um player de prévia.

export const TAU = Math.PI * 2;

// ------------------------------------------------------------------ formato
// render.mjs passa ?format=16x9|9x16|1x1&w=&h=. Faça o layout por formato; nunca use tarja preta.
const params = new URLSearchParams(location.search);
export const RENDER = params.get('render') === '1';
const SIZES = { '16x9': [1920, 1080], '9x16': [1080, 1920], '1x1': [1080, 1080] };
const fmtName = params.get('format') || '16x9';
const [fw, fh] = SIZES[fmtName] || SIZES['16x9'];
// Áreas livres: o 9x16 foge da interface das redes (barra no topo, legenda e botões embaixo/à direita).
const SAFE = { '16x9': [96, 60, 96, 60], '9x16': [72, 250, 150, 430], '1x1': [72, 72, 72, 72] };
const [sl, st, sr, sb] = SAFE[fmtName] || SAFE['16x9'];
export const FORMAT = {
  name: fmtName, w: fw, h: fh, portrait: fh > fw, square: fh === fw, landscape: fw > fh,
  safe: { x: sl, y: st, w: fw - sl - sr, h: fh - st - sb },
  // um valor por formato: FORMAT.pick({ '16x9': a, '9x16': b, '1x1': c })
  pick: (o) => (fmtName in o ? o[fmtName] : o['16x9']),
};
export const W = fw, H = fh;

// ------------------------------------------------------------------ matemática

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const prog = (u, a, b) => clamp((u - a) / (b - a));
// Pulso suave: 1 em c, 0 além de +-w.
export const bump = (u, c, w) => { const x = (u - c) / w; return Math.abs(x) >= 1 ? 0 : Math.cos((x * Math.PI) / 2) ** 2; };

export const E = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) ** 2,
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - (1 - t) ** 3,
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  outQuint: (t) => 1 - (1 - t) ** 5,
  outExpo: (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  inExpo: (t) => (t <= 0 ? 0 : 2 ** (10 * t - 10)),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack: (t, s = 1.70158) => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2,
  inBack: (t, s = 1.70158) => (s + 1) * t * t * t - s * t * t,
  outBounce: (t) => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  },
  // cubic-bezier(x1, y1, x2, y2) no estilo do CSS, resolvido por bisseção.
  bezier: (x1, y1, x2, y2) => (x) => {
    const b = (p1, p2, t) => 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t * t * p2 + t ** 3;
    let lo = 0, hi = 1;
    for (let i = 0; i < 26; i++) { const m = (lo + hi) / 2; if (b(x1, x2, m) < x) lo = m; else hi = m; }
    return b(y1, y2, (lo + hi) / 2);
  },
};

// ------------------------------------------------------------------ molas
// Resposta ao degrau de uma mola amortecida, em forma fechada, então é função pura do tempo.
// t em SEGUNDOS desde o degrau. 0 antes do degrau, assenta em 1; passa do ponto quando subamortecida.
// stiffness/damping/mass como em qualquer UI de mola (os padrões do framer-motion são 100 / 10 / 1).
export function spring(t, { stiffness = 170, damping = 18, mass = 1, velocity = 0 } = {}) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(stiffness / mass), z = damping / (2 * Math.sqrt(stiffness * mass));
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0 - velocity) / wd) * Math.sin(wd * t));
  }
  if (z === 1) return 1 - Math.exp(-w0 * t) * (1 + (w0 - velocity) * t);
  const s = Math.sqrt(z * z - 1), r1 = -w0 * (z - s), r2 = -w0 * (z + s);
  const c2 = (-velocity - r1) / (r2 - r1), c1 = 1 - c2;
  return 1 - (c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t));
}
// Predefinições, nomeadas pela sensação.
export const SPRING = {
  snappy: { stiffness: 380, damping: 30 },   // interface: rápida, um fio de passada
  bouncy: { stiffness: 260, damping: 13 },   // personagens, "pops"
  gentle: { stiffness: 120, damping: 20 },   // câmera, tipografia grande
  wobbly: { stiffness: 180, damping: 8 },    // gelatina, movimento secundário
};
// Mola entre a batida u0 e agora, com t medido em segundos no grid.
export const springU = (u, u0, cfg) => spring((u - u0) * GRID.period, cfg);
// Mola com chaves: [[u, valor], ...] (número ou array). Cada chave é um degrau que a mola persegue;
// os degraus se somam (sistema linear), então interromper um movimento no meio continua fisicamente certo.
export function springKeys(u, keys, cfg) {
  const arr = Array.isArray(keys[0][1]);
  let v = arr ? keys[0][1].slice() : keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const k = springU(u, keys[i][0], cfg);
    if (k === 0) break;
    if (arr) v = v.map((x, j) => x + (keys[i][1][j] - keys[i - 1][1][j]) * k);
    else v += (keys[i][1] - keys[i - 1][1]) * k;
  }
  return v;
}
// Oscilação amortecida começando em 1 (wobble) ou 0 (ring); t em batidas. Achatar-e-assentar, tremidinha.
export const wobble = (t, freq = 2.2, damp = 5) => (t < 0 ? 0 : Math.exp(-damp * t) * Math.cos(TAU * freq * t));
export const ring = (t, freq = 2.2, damp = 5) => (t < 0 ? 0 : Math.exp(-damp * t) * Math.sin(TAU * freq * t));

// Keyframes: [[u, valor], ...], com easing entre as chaves (número ou array).
export function kf(u, keys, ease = E.inOutCubic) {
  if (u <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (u <= keys[i][0]) {
      const [u0, a] = keys[i - 1], [u1, b] = keys[i];
      const p = ease((u - u0) / (u1 - u0));
      return Array.isArray(a) ? a.map((v, k) => lerp(v, b[k], p)) : lerp(a, b, p);
    }
  }
  return keys[keys.length - 1][1];
}

// ------------------------------------------------------------------ ruído com semente (nunca Math.random)

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const hash01 = (i, seed = 1) => mulberry32((i * 374761393 + seed * 668265263) | 0)();
// Ruído de valor 1-D em [-1, 1].
export function noise1(x, seed = 1) {
  const i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f);
  return lerp(hash01(i, seed), hash01(i + 1, seed), s) * 2 - 1;
}
// Tremor de câmera que decai depois da batida u0.
export function shake(ctx, u, u0, amp, seed = 3, decay = 0.12) {
  if (u < u0) return;
  const a = amp * Math.exp(-(u - u0) / decay);
  if (a > 0.05) ctx.translate(a * noise1(u * 48, seed), a * noise1(u * 48, seed + 9));
}

// ------------------------------------------------------------------ cor

export const hexRgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
export function mix(a, b, t) {
  const A = hexRgb(a), B = hexRgb(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(t))).toString(16).padStart(2, '0')).join('');
}

// ------------------------------------------------------------------ tipografia

export const font = (size, weight, family) => `${Math.round(weight)} ${Math.round(size)}px ${family}`;
const layoutCache = new Map();
// Layout por glifo com kerning + espaçamento: o glifo i fica em width(text[0..i]) - width(text[i]).
export function layout(ctx, str, f, track = 0) {
  const key = `${f}|${track}|${str}`;
  if (layoutCache.has(key)) return layoutCache.get(key);
  ctx.font = f; ctx.letterSpacing = `${track}px`;
  const chars = [...str];
  const glyphs = chars.map((ch, i) => {
    const m = ctx.measureText(ch);
    const x = ctx.measureText(chars.slice(0, i + 1).join('')).width - m.width;
    return { ch, x, adv: m.width - track, cx: x + (m.width - track) / 2 };
  });
  const m = ctx.measureText(str);
  ctx.letterSpacing = '0px';
  const L = { glyphs, width: m.width - track, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent };
  layoutCache.set(key, L);
  return L;
}
// Maior tamanho (<= max) em que str cabe em maxWidth.
export function fitSize(ctx, str, weight, family, maxWidth, max = 400, track = 0) {
  const w100 = layout(ctx, str, font(100, weight, family), track * 100).width;
  return Math.min(max, Math.floor((100 * maxWidth) / w100));
}
export function text(ctx, str, x, y, f, color, align = 'left', track = 0) {
  ctx.font = f; ctx.fillStyle = color; ctx.textAlign = align; ctx.letterSpacing = `${track}px`;
  ctx.fillText(str, x, y);
  ctx.letterSpacing = '0px';
}
// Um glifo, centrado em x, linha de base y, com escala / rotação / inclinação em torno do centro da base.
export function glyph(ctx, ch, x, y, f, color, sx = 1, sy = 1, rot = 0, skew = 0) {
  if (Math.abs(sx) < 1e-3 || Math.abs(sy) < 1e-3) return;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  if (skew) ctx.transform(1, 0, -skew, 1, 0, 0);
  ctx.scale(sx, sy);
  ctx.font = f; ctx.fillStyle = color; ctx.textAlign = 'center';
  ctx.fillText(ch, 0, 0);
  ctx.restore();
}
// Onde está a tinta de um glifo (centroide a partir da origem esquerda, raio de área igual, base).
export function inkBlob(f, size, ch) {
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(size * 2); cv.height = Math.ceil(size * 2);
  const c = cv.getContext('2d', { willReadFrequently: true });
  const ox = Math.round(size * 0.5), oy = Math.round(size * 1.4);
  c.font = f; c.fillStyle = '#fff'; c.fillText(ch, ox, oy);
  const a = c.getImageData(0, 0, cv.width, cv.height).data;
  let sx = 0, sy = 0, n = 0, bottom = -Infinity;
  for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
    if (a[(y * cv.width + x) * 4 + 3] > 128) { sx += x; sy += y; n++; bottom = Math.max(bottom, y); }
  }
  return { dx: sx / n - ox, dy: sy / n - oy, r: Math.sqrt(n / Math.PI), bottom: bottom + 1 - oy };
}

// ------------------------------------------------------------------ formas + imagens

export function fill(ctx, color) { ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); }
export function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); }
export function zoomAbout(ctx, s, x, y) { ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y); }
// Desenha um asset real em "cover" dentro de uma caixa. fx/fy (0..1) escolhem o ponto focal; zoom >= 1 aproxima.
export function cover(ctx, img, x, y, w, h, { fx = 0.5, fy = 0.5, zoom = 1, radius = 0 } = {}) {
  const s = Math.max(w / img.width, h / img.height) * zoom;
  const dw = img.width * s, dh = img.height * s;
  ctx.save();
  if (radius) { rrect(ctx, x, y, w, h, radius); ctx.clip(); } else { ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); }
  ctx.drawImage(img, x + (w - dw) * fx, y + (h - dh) * fy, dw, dh);
  ctx.restore();
}
// Um recorte de uma captura real (retângulo em pixels da origem) dentro de uma caixa, por exemplo um card da UI.
export function crop(ctx, img, [sx, sy, sw, sh], x, y, w, h) { ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h); }

// ------------------------------------------------------------------ grid

export let GRID = null, CFG = {};
export const U = (t) => (t - GRID.offset) / GRID.period;   // segundos -> batidas
export const TS = (u) => GRID.offset + u * GRID.period;   // batidas -> segundos

// ------------------------------------------------------------------ harness

// post(ctx, u, t, IMG) roda uma vez por quadro DEPOIS da acumulação do desfoque de movimento: granulação,
// glitch e tudo o que não pode ser "médio" pelos sub-quadros.
// samples pode ser um número ou uma função de t (menos sub-quadros onde nada anda rápido ou onde a cena é
// cara, por exemplo uma cena 3-D).
export async function film({ draw, init, post, fonts = [], images = {}, hits = [], samples = 16, shutter = 0.5 }) {
  const canvas = document.getElementById('film');
  canvas.width = W; canvas.height = H;
  if (RENDER) document.body.classList.add('render');
  document.documentElement.style.setProperty('--aspect', `${W} / ${H}`);
  const fps = Number(params.get('fps') || 60);
  const blur = RENDER && params.get('blur') !== '0';

  const [grid, cfg] = await Promise.all([
    fetch('beats.json').then((r) => r.json()),
    fetch('film.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
  ]);
  GRID = grid; CFG = cfg;
  // fontes extras pedidas pelo index.html (variações de estilo): window.FONTES_EXTRA = ['italic 900 100px Display']
  fonts = [...fonts, ...(globalThis.FONTES_EXTRA || [])];
  // uma fonte que não carrega não pode travar o render: diga qual foi e siga com o fallback
  await Promise.all(fonts.map((f) => document.fonts.load(f, 'AaBb0123')
    .catch((e) => console.error(`fonte "${f}" não carregou (${e.message}): confira lib/fonts/ e o index.html`))));
  const IMG = {};
  await Promise.all(Object.entries(images).map(async ([k, src]) => {
    const im = new Image(); im.src = src;
    try { await im.decode(); IMG[k] = im; } catch { console.error(`imagem "${k}" não carregou: ${src}`); }
  }));

  const mctx = canvas.getContext('2d', { alpha: false });
  const buf = document.createElement('canvas');
  buf.width = W; buf.height = H;
  const bctx = buf.getContext('2d', { alpha: false });
  const frame = (ctx, t) => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.textBaseline = 'alphabetic';
    draw(ctx, U(t), t, IMG);
    ctx.restore();
  };
  if (init) await init(mctx, IMG);

  // Cada quadro amostra a partir de meio quadro depois do seu tempo: o quadro mais perto de uma batida é o
  // primeiro quadro do acento dela, e o obturador para frente nunca arrasta um corte para o plano anterior.
  const runPost = (t0) => {
    if (!post) return;
    mctx.save(); mctx.setTransform(1, 0, 0, 1, 0, 0); mctx.globalAlpha = 1;
    post(mctx, U(t0), t0, IMG);
    mctx.restore();
  };
  window.seek = (t) => {
    const t0 = t + 0.5 / fps;
    const n = typeof samples === 'function' ? samples(t0) : samples;
    if (!blur || n <= 1) { frame(mctx, t0); runPost(t0); return; }
    for (let k = 0; k < n; k++) {
      frame(bctx, t0 + (k / n) * (shutter / fps));
      mctx.globalAlpha = 1 / (k + 1);
      mctx.drawImage(buf, 0, 0);
    }
    mctx.globalAlpha = 1;
    runPost(t0);
  };
  window.HITS = hits;
  window.DURATION = Number(cfg.duration || 15);
  window.filmReady = true;
  window.seek(0);
  if (!RENDER) preview(canvas, window.DURATION);
}

function preview(canvas, dur) {
  const audio = new Audio('audio/mix.wav');
  audio.addEventListener('error', () => { audio.src = 'audio/music.wav'; }, { once: true });
  let playing = false;
  const loop = () => { if (!playing) return; window.seek(audio.currentTime % dur); requestAnimationFrame(loop); };
  const toggle = () => { playing = !playing; if (playing) { audio.play(); loop(); } else audio.pause(); };
  addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); toggle(); }
    if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
      audio.currentTime = clamp(audio.currentTime + (e.code === 'ArrowRight' ? 1 : -1) / 60, 0, dur);
      window.seek(audio.currentTime);
    }
  });
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * dur;
    window.seek(audio.currentTime);
  });
  audio.addEventListener('ended', () => { playing = false; });
}
