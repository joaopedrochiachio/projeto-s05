// Reel de venda 9:16 (1080×1920) — linguagem "clean Apple": fundo claro, tipografia grande e precisa,
// muito respiro, brilho em gradiente nos impactos. A animação continua "batendo" no ritmo da voz:
// cada palavra-chave entra com punch de mola exatamente quando é falada (vo.json).
// Função pura do tempo: sem Math.random, sem timers, sem estado entre quadros.
import { E, SPRING, spring, clamp, lerp, prog, noise1, rrect, crop } from './lib/motion.js';
import { wt, ph } from './lib/vo.js';

export const W = 1080, H = 1920;
const C = {
  fundo: '#f5f5f7', branco: '#ffffff', texto: '#1d1d1f', texto2: '#6e6e73', linha: '#d2d2d7',
  azul: '#0071e3', preto: '#000000',
};
const GRAD = ['#0894ff', '#c959dd', '#ff2e54', '#ff9004']; // brilho estilo "Intelligence"
const UI = 'Inter, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const EMOJI = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

export const IMAGES = Object.fromEntries(
  ['inicio', 'inicio_escuro', 'lista', 'detalhe', 'insight', 'player'].map((k) => [k, `assets/${k}.jpg`]),
);

export let T = {}, CHAPTERS = [], HITS = [], PUNCH = [];
let VO = null, MARCA = {}, TELAS = {};

export function setup(vo, roteiro, telas) {
  VO = vo; MARCA = roteiro.marca || {}; TELAS = (telas && telas.telas) || {};
  const F = (i) => ph(VO, i).t0, a = (i) => F(i) - 0.04;
  T = {
    dur: VO.dur,
    s1: 0, incrivel: wt(VO, 'incrível.'),
    s2: a(1), nem: wt(VO, 'nem'),
    s3: a(2), toque: wt(VO, 'toque,'), tela: wt(VO, 'tela,'), detalhe: wt(VO, 'detalhe?'),
    s4: a(3), telas: wt(VO, 'Telas'), toques: wt(VO, 'Toques'), ritmo: wt(VO, 'ritmo'), voz: wt(VO, 'voz.'),
    s5: a(4), texto: wt(VO, 'texto?'), inteiro: wt(VO, 'inteiro'), ajusta: wt(VO, 'ajusta'),
    s6: a(5), cor: wt(VO, 'cor,'), voz2: wt(VO, 'voz,', { after: F(5) }), idioma: wt(VO, 'idioma.'),
    s7: a(6), pagina: wt(VO, 'página'), tocar: wt(VO, 'tocar.'),
    s8: a(7), roteiro: wt(VO, 'roteiro'), post: wt(VO, 'post,'), horas: wt(VO, 'horas.'),
    s9: a(8), produto: wt(VO, 'produto?'),
    s10: a(9), direct: wt(VO, 'direct.'),
  };
  T.enviar = T.direct + 0.3;
  PUNCH = [T.incrivel, T.telas, T.toques, T.ritmo, T.ajusta, T.horas, T.produto, T.enviar];
  HITS = [
    [0.0, 'riser_suave'], [T.incrivel, 'punch'], [T.nem, 'pop'],
    [T.toque, 'tap'], [T.tela, 'swoosh'], [T.detalhe, 'pop'],
    [T.telas, 'punch'], [T.toques, 'punch'], [T.ritmo, 'punch'],
    [T.texto - 0.1, 'teclado'], [T.ajusta, 'whoosh'],
    [T.cor, 'pop'], [T.voz2, 'pop'], [T.idioma, 'pop'],
    [T.pagina, 'whoosh'], [T.tocar, 'tap'],
    [T.roteiro, 'pop'], [T.post, 'pop'], [T.horas, 'punch'],
    [T.produto, 'punch'], [T.enviar - 0.05, 'tap'], [T.enviar, 'enviar'],
  ].sort((x, y) => x[0] - y[0]);
  CHAPTERS = [
    { t: T.s1, titulo: 'Gancho', sub: 'Seu app é incrível', tag: '0–2 s' },
    { t: T.s2, titulo: 'A dor', sub: 'O vídeo dele, nem tanto', tag: 'Problema' },
    { t: T.s3, titulo: 'O desejo', sub: 'Cada toque, cada tela, cada detalhe', tag: 'Promessa' },
    { t: T.s4, titulo: 'Keynote', sub: 'Telas reais, toques reais, no ritmo da voz', tag: 'Impacto' },
    { t: T.s5, titulo: 'Se ajusta sozinho', sub: 'Mudou o texto, o vídeo se refaz', tag: 'Diferencial' },
    { t: T.s6, titulo: 'Variações', sub: 'Cor, voz e idioma', tag: 'Diferencial' },
    { t: T.s7, titulo: 'Vira página', sub: 'O cliente toca no vídeo', tag: 'Diferencial' },
    { t: T.s8, titulo: 'Em poucas horas', sub: 'Do roteiro ao post', tag: 'Prova' },
    { t: T.s9, titulo: 'A oferta', sub: 'Quer um assim?', tag: 'Oferta' },
    { t: T.s10, titulo: 'Chamada', sub: 'Me chama no direct', tag: 'CTA' },
  ];
  return T;
}

// ------------------------------------------------------------------ utilidades
const sp = (t, t0, cfg = SPRING.gentle) => spring(t - t0, cfg);
const fadeIn = (t, t0, d = 0.25) => E.outCubic(prog(t, t0, t0 + d));
const fadeOut = (t, t1, d = 0.25) => 1 - E.inCubic(prog(t, t1 - d, t1));
const f = (size, weight = 700, fam = UI) => `${weight} ${size}px ${fam}`;
const BATIDA = { stiffness: 480, damping: 24 };

// Sprite de palavra em cache (desfoque aplicado só no canvas pequeno). cor 'grad' = gradiente da marca.
const SPR = new Map();
function sprite(txt, size, weight, cor, blur) {
  const key = `${txt}|${size}|${weight}|${cor}|${blur}`;
  let s = SPR.get(key);
  if (s) return s;
  const m = document.createElement('canvas').getContext('2d');
  m.font = f(size, weight); m.letterSpacing = `${-0.035 * size}px`;
  const w0 = m.measureText(txt).width;
  const pad = Math.ceil(size * 0.3) + blur * 2;
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(w0) + pad * 2; cv.height = Math.ceil(size * 1.45) + pad * 2;
  const c = cv.getContext('2d');
  c.font = f(size, weight); c.letterSpacing = `${-0.035 * size}px`; c.textBaseline = 'alphabetic';
  if (cor === 'grad') {
    const g = c.createLinearGradient(pad, 0, pad + w0, 0);
    GRAD.forEach((k, i) => g.addColorStop(i / (GRAD.length - 1), k));
    c.fillStyle = g;
  } else c.fillStyle = cor;
  if (blur > 0) c.filter = `blur(${blur}px)`;
  c.fillText(txt, pad, pad + size * 1.06);
  s = { cv, w: w0, ox: pad, oy: pad + size * 1.06 };
  SPR.set(key, s);
  return s;
}
const largura = (txt, size, weight = 700) => sprite(txt, size, weight, C.texto, 0).w;

// Manchete "batendo": cada palavra entra com punch de mola (escala 1.22→1), sobe e passa de desfocada a nítida.
// linhas: [[palavra | {w, c}]]; tempos: um instante por palavra (karaokê) ou t0 + 70 ms por palavra.
function manchete(ctx, t, t0, linhas, { y = 330, size = 104, weight = 700, cor = C.texto, lh = 1.08, tempos = null, sai = 1e9, x = W / 2 } = {}) {
  let k = 0;
  const outA = fadeOut(t, sai, 0.22);
  linhas.forEach((linha, li) => {
    const pals = linha.map((p) => (typeof p === 'string' ? { w: p } : p));
    const larg = pals.map((p) => largura(p.w, size, weight));
    const esp = size * 0.24;
    const total = larg.reduce((s, v) => s + v, 0) + esp * (pals.length - 1);
    let px = x - total / 2;
    const py = y + li * size * lh;
    pals.forEach((p, i) => {
      const tw = tempos ? tempos[Math.min(k, tempos.length - 1)] : t0 + k * 0.07;
      const s = sp(t, tw, BATIDA);
      const a = clamp(clamp(s * 2.2) * outA);
      if (a > 0.003) {
        const spr = sprite(p.w, size, weight, p.c || cor, Math.round(10 * (1 - clamp(s))));
        const esc = lerp(1.22, 1, s);
        ctx.save(); ctx.globalAlpha = a;
        ctx.translate(px + larg[i] / 2, py - size * 0.35 + 26 * (1 - s)); ctx.scale(esc, esc);
        ctx.drawImage(spr.cv, -larg[i] / 2 - spr.ox, -spr.oy + size * 0.35);
        ctx.restore();
      }
      px += larg[i] + esp; k++;
    });
  });
}
// Tempos de karaokê: a palavra i da frase n entra quando é falada.
const karaoke = (n) => { const fr = VO.frases[n]; return VO.words.slice(fr.words[0], fr.words[1] + 1).map((w) => w.t0 - 0.03); };

function fundo(ctx, t, escuro = false) {
  if (escuro) { ctx.fillStyle = C.preto; ctx.fillRect(0, 0, W, H); return; }
  ctx.fillStyle = C.fundo; ctx.fillRect(0, 0, W, H);
  const r = ctx.createRadialGradient(540, 900, 0, 540, 900, 1100);
  r.addColorStop(0, 'rgba(255,255,255,0.95)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
}
// Brilho em gradiente girando ao redor de um retângulo arredondado (o "punch" visual).
function brilho(ctx, t, x, y, w, h, raio, k) {
  k = clamp(k);
  if (k <= 0.01) return;
  ctx.save();
  const g = ctx.createConicGradient(t * 1.6, x + w / 2, y + h / 2);
  [...GRAD, GRAD[0]].forEach((c, i, arr) => g.addColorStop(i / (arr.length - 1), c));
  for (const [lw, blur, al] of [[34, 60, 0.55], [14, 22, 0.8], [5, 0, 1]]) {
    ctx.globalAlpha = k * al; ctx.lineWidth = lw; ctx.strokeStyle = g; ctx.shadowColor = '#c959dd'; ctx.shadowBlur = blur;
    rrect(ctx, x, y, w, h, raio); ctx.stroke();
  }
  ctx.restore();
}
function punch(t) { let k = 0; for (const p of PUNCH) if (t >= p) k = Math.max(k, Math.exp(-(t - p) * 5)); return k; }

// ------------------------------------------------------------------ celular com tela real
const SHOT_W = 1170, SHOT_H = 2532;
function geo(cx, cy, w) {
  const s = w / SHOT_W, status = w * 0.1, sh = SHOT_H * s + status;
  return { cx, cy, w, s, status, sh, x: cx - w / 2, y: cy - sh / 2 };
}
const mapa = (g, r) => [g.x + r[0] * g.s, g.y + g.status + r[1] * g.s, r[2] * g.s, r[3] * g.s];
function celular(ctx, IMG, g, camadas, { a = 1, filtro = null, glow = 0, t = 0 } = {}) {
  a = clamp(a);
  if (a <= 0.003) return;
  const R = g.w * 0.15, b = g.w * 0.028;
  ctx.save(); ctx.globalAlpha = a;
  ctx.shadowColor = 'rgba(0,0,0,0.16)'; ctx.shadowBlur = 90; ctx.shadowOffsetY = 50;
  rrect(ctx, g.x - b, g.y - b, g.w + 2 * b, g.sh + 2 * b, R + b); ctx.fillStyle = '#1d1d1f'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3; ctx.strokeStyle = '#8e8e93'; ctx.stroke(); // aro de titânio
  ctx.save(); rrect(ctx, g.x, g.y, g.w, g.sh, R); ctx.clip();
  ctx.fillStyle = g.statusCor || '#f2f2f7'; ctx.fillRect(g.x, g.y, g.w, g.status + 4);
  if (filtro) ctx.filter = filtro;
  for (const c of camadas) {
    if (!c || c.a <= 0.003 || !IMG[c.img]) continue;
    ctx.globalAlpha = a * c.a;
    ctx.save();
    if (c.zoom && c.zoom !== 1) { const [fx, fy] = c.foco || [g.cx, g.cy]; ctx.translate(fx, fy); ctx.scale(c.zoom, c.zoom); ctx.translate(-fx, -fy); }
    ctx.drawImage(IMG[c.img], g.x + (c.dx || 0), g.y + g.status + (c.dy || 0), g.w, SHOT_H * g.s);
    ctx.restore();
  }
  ctx.filter = 'none'; ctx.globalAlpha = a;
  ctx.fillStyle = g.statusTexto || C.texto; ctx.font = f(g.w * 0.042, 600); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText('9:41', g.x + g.w * 0.1, g.y + g.status * 0.56);
  rrect(ctx, g.cx - g.w * 0.15, g.y + g.w * 0.025, g.w * 0.3, g.w * 0.075, g.w * 0.04); ctx.fillStyle = '#000'; ctx.fill();
  ctx.restore();
  ctx.restore();
  brilho(ctx, t, g.x - b - 6, g.y - b - 6, g.w + 2 * b + 12, g.sh + 2 * b + 12, R + b + 6, glow * a);
}
function fragmento(ctx, IMG, img, r, cx, cy, escala, { a = 1, glow = 0, t = 0, raio = 30 } = {}) {
  a = clamp(a);
  if (a <= 0.003 || !r || !IMG[img]) return;
  const w = r[2] * escala, h = r[3] * escala;
  ctx.save(); ctx.globalAlpha = a;
  ctx.shadowColor = 'rgba(0,0,0,0.14)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 26;
  rrect(ctx, cx - w / 2, cy - h / 2, w, h, raio); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.save(); rrect(ctx, cx - w / 2, cy - h / 2, w, h, raio); ctx.clip();
  crop(ctx, IMG[img], r, cx - w / 2, cy - h / 2, w, h); ctx.restore();
  ctx.restore();
  brilho(ctx, t, cx - w / 2 - 8, cy - h / 2 - 8, w + 16, h + 16, raio + 8, glow * a);
}
// Toque: círculo translúcido que chega com mola, aperta e solta uma onda.
function toque(ctx, t, tTap, de, para, { chega = 0.5 } = {}) {
  const t0 = tTap - chega;
  if (t < t0 - 0.05 || t > tTap + 1) return;
  const m = sp(t, t0, SPRING.snappy);
  const x = lerp(de[0], para[0], m), y = lerp(de[1], para[1], m);
  const aperto = 1 - 0.16 * Math.exp(-((t - tTap) ** 2) / 0.005);
  const a = clamp(clamp(m * 2) * fadeOut(t, tTap + 1, 0.3));
  ctx.save();
  if (t >= tTap) {
    const p = prog(t, tTap, tTap + 0.55);
    ctx.globalAlpha = a * (1 - p); ctx.lineWidth = 4; ctx.strokeStyle = C.azul;
    ctx.beginPath(); ctx.arc(x, y, 36 + 100 * E.outCubic(p), 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = a;
  ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  ctx.beginPath(); ctx.arc(x, y, 40 * aperto, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.stroke();
  ctx.restore();
}
function pilula(ctx, txt, cx, cy, { a = 1, size = 34, escuro = false } = {}) {
  a = clamp(a);
  if (a <= 0.003) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = f(size, 600);
  const w = ctx.measureText(txt).width + size * 1.5, h = size * 2.1;
  ctx.shadowColor = 'rgba(0,0,0,0.08)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  rrect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fillStyle = escuro ? C.texto : C.branco; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = escuro ? C.branco : C.texto; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(txt, cx, cy + 1);
  ctx.restore();
}

// ------------------------------------------------------------------ cenas
function cena1(ctx, t, IMG) {
  fundo(ctx, t);
  const e = sp(t, 0.05, SPRING.gentle);
  const g = geo(540, lerp(1500, 1230, e), 520);
  celular(ctx, IMG, g, [{ img: 'inicio', a: 1 }], { a: clamp(e * 2), glow: punch(t), t });
  manchete(ctx, t, 0, [['Seu', 'aplicativo'], ['é', { w: 'incrível.', c: 'grad' }]], { y: 330, size: 112, tempos: [0, 0.08, T.incrivel - 0.25, T.incrivel] });
}

function cena2(ctx, t, IMG) {
  fundo(ctx, t);
  manchete(ctx, t, T.s2, [[{ w: 'O vídeo dele,', c: C.texto2 }], ['nem', 'tanto.']], { y: 330, size: 104, tempos: [T.s2, T.nem, T.nem + 0.12] });
  // o "vídeo comum": gravação de tela parada, cinza, com barra de progresso se arrastando
  const e = sp(t, T.s2 + 0.05, SPRING.gentle);
  const x = 150, y = lerp(900, 640, e), w = 780, h = 1000;
  ctx.save(); ctx.globalAlpha = clamp(e * 2);
  ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 30;
  rrect(ctx, x, y, w, h, 44); ctx.fillStyle = '#e8e8ed'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.save(); rrect(ctx, x + 24, y + 24, w - 48, h - 150, 28); ctx.clip();
  ctx.filter = 'grayscale(1) contrast(0.8) brightness(1.05)';
  const im = IMG.lista; if (im) { const s = (w - 48) / im.width; ctx.drawImage(im, x + 24, y + 24 - 120, im.width * s, im.height * s); }
  ctx.filter = 'none';
  ctx.fillStyle = 'rgba(245,245,247,0.45)'; ctx.fillRect(x + 24, y + 24, w - 48, h - 150);
  ctx.restore();
  const cy = y + (h - 126) / 2;
  ctx.beginPath(); ctx.arc(x + w / 2, cy, 64, 0, Math.PI * 2); ctx.fillStyle = 'rgba(29,29,31,0.55)'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x + w / 2 - 20, cy - 30); ctx.lineTo(x + w / 2 + 32, cy); ctx.lineTo(x + w / 2 - 20, cy + 30); ctx.closePath(); ctx.fill();
  const p = 0.02 + 0.03 * prog(t, T.s2, T.s3);
  rrect(ctx, x + 40, y + h - 80, w - 80, 10, 5); ctx.fillStyle = C.linha; ctx.fill();
  rrect(ctx, x + 40, y + h - 80, (w - 80) * p, 10, 5); ctx.fillStyle = C.texto2; ctx.fill();
  ctx.fillStyle = C.texto2; ctx.font = f(28, 600); ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.fillText('0:02 / 3:47', x + w - 40, y + h - 106);
  ctx.restore();
}

function cena3(ctx, t, IMG) {
  fundo(ctx, t);
  manchete(ctx, t, T.s3 + 0.02, [[{ w: 'E se ele mostrasse', c: C.texto2 }]], { y: 250, size: 58, weight: 600 });
  // a palavra da vez troca no tempo da fala: toque → tela → detalhe
  const itens = [['toque', T.toque, T.tela], ['tela', T.tela, T.detalhe], ['detalhe?', T.detalhe, 1e9]];
  for (const [txt, t0, t1] of itens) {
    if (t >= t0 - 0.05 && t < t1 + 0.1) manchete(ctx, t, t0 - 0.05, [['cada', { w: txt, c: 'grad' }]], { y: 390, size: 112, sai: t1 + 0.08, tempos: [t0 - 0.12, t0 - 0.03] });
  }
  const g = geo(540, 1230, 540);
  const card = TELAS.lista?.alvo ? mapa(g, TELAS.lista.alvo) : [g.cx - 200, g.cy, 400, 200];
  const tTap = T.toque + 0.02;
  const abre = E.inOutCubic(prog(t, tTap + 0.1, tTap + 0.35));
  const muda = E.inOutCubic(prog(t, T.tela, T.tela + 0.3));
  const foco = [card[0] + card[2] / 2, card[1] + card[3] / 2];
  celular(ctx, IMG, g, [
    { img: 'lista', a: 1 - abre, zoom: 1 + 0.12 * abre, foco },
    { img: 'detalhe', a: abre * (1 - muda) },
    { img: 'insight', a: muda, dy: 200 * (1 - muda) },
  ]);
  toque(ctx, t, tTap, [900, 1900], [foco[0] - 60, foco[1]]);
  // detalhe: a meta real sai da tela e flutua ampliada, com brilho
  const r = TELAS.insight?.destaque;
  if (r && t >= T.detalhe - 0.1) {
    const [rx, ry, rw, rh] = mapa(g, r);
    const fs = sp(t, T.detalhe - 0.08, BATIDA);
    fragmento(ctx, IMG, 'insight', r, lerp(rx + rw / 2, 540, fs), lerp(ry + rh / 2, 1480, fs), lerp(g.s, 0.86, fs), { a: clamp(fs * 3), glow: 0.9 * Math.exp(-Math.max(0, t - T.detalhe) * 1.5), t });
  }
}

function cena4(ctx, t) {
  fundo(ctx, t, true);
  const pk = punch(t);
  ctx.save(); const z = 1 + 0.03 * pk; ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
  manchete(ctx, t, T.telas, [['Telas', 'reais.']], { y: 560, size: 128, cor: C.branco, tempos: [T.telas - 0.03, T.telas + 0.1] });
  manchete(ctx, t, T.toques, [['Toques', 'reais.']], { y: 760, size: 128, cor: C.branco, tempos: [T.toques - 0.03, T.toques + 0.1] });
  manchete(ctx, t, T.ritmo, [[{ w: 'No ritmo', c: 'grad' }], [{ w: 'da sua voz.', c: 'grad' }]], { y: 1000, size: 128, tempos: [T.ritmo - 0.15, T.voz - 0.2] });
  ctx.restore();
  // linha de voz fina, viva só enquanto a frase é falada
  const a = fadeIn(t, T.ritmo - 0.1, 0.3);
  if (a > 0) {
    ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 6; ctx.lineCap = 'round';
    const g = ctx.createLinearGradient(140, 0, 940, 0); GRAD.forEach((c, i) => g.addColorStop(i / 3, c)); ctx.strokeStyle = g;
    ctx.beginPath();
    for (let x = 140; x <= 940; x += 8) {
      const env = Math.sin(((x - 140) / 800) * Math.PI);
      const y = 1430 + env * 90 * Math.sin(x * 0.045 + t * 14) * (0.4 + 0.6 * Math.abs(noise1(t * 5 + x * 0.01, 2)));
      if (x === 140) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.restore();
  }
}

function cena5(ctx, t) {
  fundo(ctx, t);
  manchete(ctx, t, T.s5, [['Mudou', 'o', 'texto?']], { y: 300, size: 104, sai: T.inteiro - 0.05 });
  if (t >= T.inteiro - 0.25) manchete(ctx, t, T.inteiro, [['O', 'vídeo', 'inteiro'], [{ w: 'se ajusta.', c: 'grad' }]], { y: 300, size: 100, tempos: [T.inteiro - 0.2, T.inteiro - 0.12, T.inteiro - 0.04, T.ajusta - 0.03] });
  // cartão do roteiro: uma palavra é trocada ao vivo
  const e = sp(t, T.s5 + 0.05, SPRING.gentle);
  const x = 110, y = lerp(760, 600, e), w = 860;
  ctx.save(); ctx.globalAlpha = clamp(e * 2);
  ctx.shadowColor = 'rgba(0,0,0,0.08)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
  rrect(ctx, x, y, w, 260, 36); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.texto2; ctx.font = f(26, 600); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('roteiro.json', x + 44, y + 64);
  const antes = 'incrível."', depois = 'sensacional."';
  const pt = prog(t, T.texto - 0.05, T.inteiro - 0.1);
  const palavra = pt < 0.5 ? antes.slice(0, antes.length - Math.round(antes.length * clamp(pt * 2))) : depois.slice(0, Math.round(depois.length * clamp(pt * 2 - 1)));
  ctx.font = f(54, 600); ctx.fillStyle = C.texto;
  const base = '"Seu app é ';
  ctx.fillText(base, x + 44, y + 170);
  const bw = ctx.measureText(base).width;
  ctx.fillStyle = C.azul; ctx.fillText(palavra, x + 44 + bw, y + 170);
  const cw = ctx.measureText(palavra).width;
  if (Math.floor(t * 3) % 2 === 0 || (pt > 0 && pt < 1)) ctx.fillRect(x + 48 + bw + cw, y + 126, 5, 58);
  ctx.restore();
  // linha do tempo: os blocos se reorganizam com mola quando o texto muda
  const tl = sp(t, T.s5 + 0.15, SPRING.gentle);
  const y2 = 1060;
  ctx.save(); ctx.globalAlpha = clamp(tl * 2);
  ctx.fillStyle = C.texto2; ctx.font = f(26, 600); ctx.textAlign = 'left'; ctx.fillText('linha do tempo', x, y2 - 30);
  const antesL = [150, 120, 210, 160, 220], depoisL = [150, 190, 170, 140, 210];
  const cores = ['#0071e3', '#5e5ce6', '#bf5af2', '#ff375f', '#ff9f0a'];
  const m = sp(t, T.ajusta - 0.15, BATIDA);
  let xx = x;
  for (let i = 0; i < 5; i++) {
    const lw = lerp(antesL[i], depoisL[i], m);
    rrect(ctx, xx, y2, lw - 10, 120, 20); ctx.fillStyle = cores[i]; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.font = f(24, 700); ctx.fillText(`cena ${i + 1}`, xx + 18, y2 + 70);
    xx += lw;
  }
  const px = x + 860 * prog(t, T.s5, T.s6);
  ctx.fillStyle = C.texto; ctx.fillRect(px - 2, y2 - 20, 4, 160);
  ctx.restore();
  brilho(ctx, t, x - 14, y2 - 14, 888, 148, 28, t > T.ajusta - 0.05 ? punch(t) : 0);
}

function cena6(ctx, t, IMG) {
  fundo(ctx, t);
  manchete(ctx, t, T.s6, [['Outra', 'cor,'], ['outra', 'voz,'], ['outro', { w: 'idioma.', c: 'grad' }]], { y: 250, size: 84, tempos: [T.cor - 0.12, T.cor, T.voz2 - 0.12, T.voz2, T.idioma - 0.15, T.idioma] });
  const itens = [
    { t0: T.cor, x: 220, rot: -0.06, img: 'inicio_escuro', escuro: true, rotulo: 'Cor', extra: null },
    { t0: T.voz2, x: 540, rot: 0, filtro: null, rotulo: 'Voz', extra: 'voz' },
    { t0: T.idioma, x: 860, rot: 0.06, filtro: null, rotulo: 'Idioma', extra: 'en' },
  ];
  itens.forEach((it) => {
    const s = sp(t, it.t0 - 0.06, BATIDA);
    if (s <= 0.001) return;
    const g = geo(it.x, lerp(1250, 1080, s), 330);
    ctx.save(); ctx.translate(it.x, g.cy); ctx.rotate(it.rot); ctx.scale(lerp(1.15, 1, s), lerp(1.15, 1, s)); ctx.translate(-it.x, -g.cy);
    if (it.escuro) { g.statusCor = '#000000'; g.statusTexto = '#ffffff'; }
    celular(ctx, IMG, g, [{ img: it.img || 'inicio', a: 1 }], { a: clamp(s * 2), glow: t >= it.t0 ? Math.exp(-(t - it.t0) * 3) : 0, t });
    if (it.extra === 'voz') {
      ctx.save(); ctx.globalAlpha = clamp(s * 2);
      rrect(ctx, it.x - 110, g.cy + 120, 220, 70, 35); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill();
      ctx.fillStyle = C.texto;
      for (let i = 0; i < 12; i++) { const hh = 10 + 36 * Math.abs(noise1(t * 6 + i, 4)); rrect(ctx, it.x - 80 + i * 14, g.cy + 155 - hh / 2, 7, hh, 3); ctx.fill(); }
      ctx.restore();
    }
    if (it.extra === 'en') {
      ctx.save(); ctx.globalAlpha = clamp(s * 2);
      rrect(ctx, it.x - 140, g.cy + 120, 280, 76, 20); ctx.fillStyle = 'rgba(29,29,31,0.85)'; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = f(24, 600); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Your wallet, explained.', it.x, g.cy + 158); ctx.restore();
    }
    ctx.restore();
    pilula(ctx, it.rotulo, it.x, 1560, { a: clamp(s * 2), size: 32, escuro: true });
  });
}

function cena7(ctx, t, IMG) {
  fundo(ctx, t);
  manchete(ctx, t, T.s7, [['Vira', 'uma', 'página'], ['que', 'o', 'cliente', { w: 'toca.', c: 'grad' }]], { y: 290, size: 88, tempos: [T.s7 + 0.3, T.s7 + 0.37, T.pagina - 0.03, T.pagina + 0.3, T.pagina + 0.37, T.pagina + 0.44, T.tocar] });
  // janela de navegador clara com o player interativo real
  const e = sp(t, T.s7 + 0.1, SPRING.gentle);
  const x = 70, y = lerp(900, 680, e), w = 940, h = 640;
  ctx.save(); ctx.globalAlpha = clamp(e * 2);
  ctx.shadowColor = 'rgba(0,0,0,0.14)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 34;
  rrect(ctx, x, y, w, h, 30); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#f5f5f7'; rrect(ctx, x, y, w, 78, 30); ctx.fill(); ctx.fillRect(x, y + 48, w, 30);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.beginPath(); ctx.arc(x + 40 + i * 30, y + 40, 10, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); });
  rrect(ctx, x + 200, y + 20, 540, 40, 20); ctx.fillStyle = '#e8e8ed'; ctx.fill();
  ctx.fillStyle = C.texto2; ctx.font = f(22, 600); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('seuproduto.com/demo', x + 470, y + 41);
  const im = IMG.player;
  if (im) { ctx.save(); rrect(ctx, x + 10, y + 82, w - 20, h - 92, 20); ctx.clip(); const s = (w - 20) / im.width; ctx.drawImage(im, x + 10, y + 82, im.width * s, im.height * s); ctx.restore(); }
  ctx.restore();
  const alvo = [x + w * 0.62, y + 82 + 0.5 * (h - 92)];
  toque(ctx, t, T.tocar + 0.05, [980, 1800], alvo);
  brilho(ctx, t, x - 10, y - 10, w + 20, h + 20, 38, t > T.tocar ? 0.9 * Math.exp(-(t - T.tocar) * 2.5) : 0);
}

function cena8(ctx, t) {
  fundo(ctx, t);
  manchete(ctx, t, T.s8, [[{ w: 'Do roteiro ao post,', c: C.texto2 }]], { y: 300, size: 62, weight: 600 });
  const passos = [['Roteiro', T.roteiro, '📝'], ['Voz', (T.roteiro + T.post) / 2, '🎙️'], ['Post', T.post, '📱']];
  const y = 820;
  const linhaP = E.inOutCubic(prog(t, T.roteiro, T.post + 0.2));
  ctx.save(); ctx.fillStyle = C.linha; rrect(ctx, 230, y - 3, 620, 6, 3); ctx.fill();
  const g = ctx.createLinearGradient(230, 0, 850, 0); GRAD.forEach((c, i) => g.addColorStop(i / 3, c));
  ctx.fillStyle = g; rrect(ctx, 230, y - 3, 620 * linhaP, 6, 3); ctx.fill(); ctx.restore();
  passos.forEach(([rot, t0, ic], i) => {
    const s = sp(t, t0 - 0.05, BATIDA);
    if (s <= 0.001) return;
    const cx = 230 + i * 310;
    ctx.save(); ctx.globalAlpha = clamp(s * 2); ctx.translate(cx, y); ctx.scale(lerp(1.2, 1, s), lerp(1.2, 1, s));
    ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    ctx.beginPath(); ctx.arc(0, 0, 92, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.font = f(84, 400, EMOJI); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ic, 0, 6);
    ctx.fillStyle = C.texto; ctx.font = f(36, 600); ctx.fillText(rot, 0, 150);
    ctx.restore();
  });
  manchete(ctx, t, T.horas, [['em', 'poucas'], [{ w: 'horas.', c: 'grad' }]], { y: 1180, size: 150, tempos: [T.horas - 0.32, T.horas - 0.16, T.horas] });
}

function cena9(ctx, t) {
  fundo(ctx, t);
  const k = t >= T.produto ? punch(t) : 0;
  if (k > 0.01) {
    const r = ctx.createRadialGradient(540, 860, 0, 540, 860, 700);
    r.addColorStop(0, `rgba(201,89,221,${0.25 * k})`); r.addColorStop(1, 'rgba(201,89,221,0)');
    ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  }
  manchete(ctx, t, T.s9, [['Quer', 'um', 'assim'], ['pro', 'seu'], [{ w: 'produto?', c: 'grad' }]], { y: 680, size: 132, tempos: karaoke(8) });
}

function cena10(ctx, t) {
  fundo(ctx, t);
  manchete(ctx, t, T.s10, [['Me', 'chama'], ['no', { w: 'direct.', c: 'grad' }]], { y: 300, size: 120, tempos: karaoke(9) });
  // conversa em modo claro
  const e = sp(t, T.s10 + 0.1, SPRING.gentle);
  const x = 130, y = lerp(1100, 640, e), w = 820, h = 760;
  ctx.save(); ctx.globalAlpha = clamp(e * 2);
  ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 30;
  rrect(ctx, x, y, w, h, 52); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
  const ga = ctx.createLinearGradient(x + 50, y + 50, x + 150, y + 150);
  ga.addColorStop(0, '#feda75'); ga.addColorStop(0.5, '#d62976'); ga.addColorStop(1, '#4f5bd5');
  ctx.beginPath(); ctx.arc(x + 100, y + 100, 48, 0, Math.PI * 2); ctx.fillStyle = ga; ctx.fill();
  ctx.beginPath(); ctx.arc(x + 100, y + 100, 41, 0, Math.PI * 2); ctx.fillStyle = '#f5f5f7'; ctx.fill();
  ctx.fillStyle = C.texto; ctx.beginPath(); ctx.moveTo(x + 90, y + 82); ctx.lineTo(x + 118, y + 100); ctx.lineTo(x + 90, y + 118); ctx.closePath(); ctx.fill();
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = f(36, 700); ctx.fillText(MARCA.handle || '@seu.perfil', x + 170, y + 86);
  ctx.fillStyle = C.texto2; ctx.font = f(26, 500); ctx.fillText('Ativo agora', x + 170, y + 124);
  ctx.fillStyle = '#e8e8ed'; ctx.fillRect(x, y + 186, w, 2);
  rrect(ctx, x + 40, y + 236, 520, 100, 40); ctx.fillStyle = '#efeff4'; ctx.fill();
  ctx.fillStyle = C.texto; ctx.font = f(32, 500); ctx.fillText('Quer um vídeo desses?', x + 76, y + 287);
  rrect(ctx, x + 40, y + h - 130, w - 80, 90, 45); ctx.fillStyle = '#f5f5f7'; ctx.fill();
  ctx.fillStyle = t < T.enviar ? C.texto : C.texto2; ctx.font = f(30, 500);
  ctx.fillText(t < T.enviar ? 'Quero o meu' : 'Mensagem...', x + 80, y + h - 84);
  const bx = x + w - 90, by = y + h - 85;
  ctx.beginPath(); ctx.arc(bx, by, 34, 0, Math.PI * 2); ctx.fillStyle = C.azul; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(bx - 13, by - 14); ctx.lineTo(bx + 16, by); ctx.lineTo(bx - 13, by + 14); ctx.lineTo(bx - 6, by); ctx.closePath(); ctx.fill();
  ctx.restore();
  const m = sp(t, T.enviar, BATIDA);
  if (m > 0.001) {
    ctx.save(); ctx.globalAlpha = clamp(clamp(m * 2) * clamp(e * 2));
    ctx.translate(x + w - 50, y + 450); ctx.scale(lerp(0.6, 1, m), lerp(0.6, 1, m));
    rrect(ctx, -400, -56, 400, 112, 44); ctx.fillStyle = C.azul; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = f(38, 600); ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('Quero o meu', -40, 2);
    ctx.restore();
    brilho(ctx, t, x - 10, y - 10, w + 20, h + 20, 60, punch(t));
  }
  toque(ctx, t, T.enviar, [980, 1900], [x + w - 90, y + h - 85]);
  const ca = fadeIn(t, T.enviar + 0.6, 0.4);
  if (ca > 0) {
    ctx.save(); ctx.globalAlpha = ca; ctx.fillStyle = C.texto2; ctx.font = f(36, 500); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`ou comente "${MARCA.palavra_comentario || 'VÍDEO'}"`, 540, 1490); ctx.restore();
  }
}

// Legenda mínima (pílula clara), só nas frases que não estão escritas na tela.
const COM_LEGENDA = new Set(); // as manchetes já são a legenda; a legenda completa fica no botão CC do player
function legenda(ctx, t) {
  const idx = VO.frases.findIndex((x) => t >= x.t0 - 0.1 && t <= x.t1 + 0.25);
  if (idx < 0 || !COM_LEGENDA.has(idx)) return;
  const fr = VO.frases[idx];
  const ws = VO.words.slice(fr.words[0], fr.words[1] + 1);
  ctx.save(); ctx.font = f(36, 600); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const linhas = []; let atual = [], larg = 0;
  for (const w of ws) { const lw = ctx.measureText(w.w + ' ').width; if (larg + lw > 820 && atual.length) { linhas.push(atual); atual = []; larg = 0; } atual.push(w); larg += lw; }
  if (atual.length) linhas.push(atual);
  const lMax = Math.max(...linhas.map((ln) => ln.reduce((s, w) => s + ctx.measureText(w.w + ' ').width, 0)));
  const y0 = 1490 - (linhas.length - 1) * 52;
  ctx.shadowColor = 'rgba(0,0,0,0.08)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
  rrect(ctx, 540 - lMax / 2 - 30, y0 - 44, lMax + 60, linhas.length * 52 + 36, 30); ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fill();
  ctx.shadowColor = 'transparent';
  linhas.forEach((ln, li) => {
    const tot = ln.reduce((s, w) => s + ctx.measureText(w.w + ' ').width, 0);
    let x = 540 - tot / 2;
    for (const w of ln) {
      const dito = t >= w.t0;
      ctx.fillStyle = dito && t < w.t1 + 0.05 ? C.azul : dito ? C.texto : '#aeaeb2';
      ctx.fillText(w.w, x, y0 + li * 52);
      x += ctx.measureText(w.w + ' ').width;
    }
  });
  ctx.restore();
}

// ------------------------------------------------------------------ montagem
const CENAS = [
  ['s1', 's2', cena1], ['s2', 's3', cena2], ['s3', 's4', cena3], ['s4', 's5', cena4], ['s5', 's6', cena5],
  ['s6', 's7', cena6], ['s7', 's8', cena7], ['s8', 's9', cena8], ['s9', 's10', cena9], ['s10', 'dur', cena10],
];
export function draw(ctx, t, IMG) {
  ctx.save();
  ctx.fillStyle = C.fundo; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < CENAS.length; i++) {
    const [a, b, fn] = CENAS[i];
    const t0 = T[a], t1 = T[b];
    if (t < t0 || t >= t1 + 0.15) continue;
    ctx.save();
    // corte com leve "push-in": a cena nova já aparece no primeiro quadro, assentando com mola
    const ent = i === 0 ? 1 : sp(t, t0, BATIDA);
    if (ent < 1) { const z = lerp(1.06, 1, ent); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); }
    fn(ctx, t, IMG);
    ctx.restore();
  }
  ctx.restore();
  legenda(ctx, t);
}
