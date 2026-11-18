// Reels em Código — Reel de venda 9:16 (1080×1920), estilo Instagram.
// Filme = função pura do tempo; cada cena e cada efeito sonoro presos a uma palavra da narração (vo.json).
// Sem Math.random, sem timers, sem estado entre quadros.
import { E, SPRING, spring, clamp, lerp, prog, hash01, noise1, rrect } from './lib/motion.js';
import { wt, ph } from './lib/vo.js';

export const W = 1080, H = 1920;
const C = {
  noite: '#0b0b14', noite2: '#141428', branco: '#ffffff', cinza: '#9aa0b8',
  roxo: '#7c5cff', rosa: '#ff3d81', lima: '#c6ff3d', azul: '#3d8bff', laranja: '#ff9f1c', vermelho: '#ff3b3b',
};
const DISPLAY = 'Anton, Impact, "Arial Narrow", sans-serif';
const UI = 'Inter, "Helvetica Neue", Arial, sans-serif';
const EMOJI = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

export const IMAGES = Object.fromEntries([
  'f_1_0', 'f_6_5', 'f_12_6', 'f_19_5', 'f_26_0', 'f_30_6', 'f_33_4', 'f_38_9', 'f_44_6', 'f_47_5',
  'home', 'mural', 'sucesso', 'minhas3',
].map((k) => [k, `assets/${k}.jpg`]));
const MONTAGEM = ['f_19_5', 'f_30_6', 'f_38_9', 'f_44_6', 'f_6_5', 'f_26_0', 'f_33_4', 'f_47_5', 'f_12_6', 'f_1_0'];

export let T = {}, CHAPTERS = [], HITS = [], BOOMS = [];
let VO = null, MARCA = {};
export const LOGO_D = '';

export function setup(vo, roteiro) {
  VO = vo; MARCA = roteiro.marca || {};
  const F = (i) => ph(VO, i).t0, a = (i) => F(i) - 0.04;
  T = {
    dur: VO.dur,
    hook: 0, assim: wt(VO, 'assim?'),
    sem: a(1), editor: wt(VO, 'editor.'), ae: wt(VO, 'After'), arrastar: wt(VO, 'arrastar'),
    prog: a(2), editado: wt(VO, 'editado.'), programado: wt(VO, 'programado.'),
    roteiro: a(3), roteiroW: wt(VO, 'roteiro,'), ia: wt(VO, 'inteligência'), narra: wt(VO, 'narra,'),
    palavra: a(4),
    kit: a(5), print: wt(VO, 'Print'), animacao: wt(VO, 'animação,'), legenda: wt(VO, 'legenda'), trilha: wt(VO, 'trilha.'),
    fps: a(6), sessenta: wt(VO, 'Sessenta'), postar: wt(VO, 'postar.'),
    caso: a(7), horas: wt(VO, 'horas,'), zero: wt(VO, 'zero.'),
    oferta: a(8), produto: wt(VO, 'produto,'), aprender: wt(VO, 'aprender'),
    cta: a(9), direct: wt(VO, 'direct.'),
  };
  BOOMS = [T.programado, T.sessenta, T.zero, T.direct + 0.25];
  HITS = [
    [0.0, 'riser'], [T.assim, 'pop'],
    [T.editor, 'boom_leve'], [T.ae, 'boom_leve'], [T.arrastar, 'boom_leve'],
    [T.editado, 'swoosh'], [T.programado, 'boom'],
    [T.roteiroW - 0.1, 'teclado'], [T.narra, 'whoosh'],
    ...palavrasDaFrase(4).map((w) => [w.t0, 'tick']),
    [T.print, 'pop'], [T.animacao, 'pop'], [T.legenda, 'pop'], [T.trilha, 'pop'],
    [T.sessenta - 0.35, 'riser'], [T.sessenta, 'boom'], [T.postar, 'ding'],
    [T.caso, 'whoosh'], [T.horas, 'pop'], [T.zero, 'boom'],
    [T.produto, 'pop'], [T.aprender, 'pop'],
    [T.cta, 'whoosh'], [T.direct + 0.25, 'enviar'], [T.direct + 0.25, 'boom'],
  ].sort((x, y) => x[0] - y[0]);
  CHAPTERS = [
    { t: T.hook, titulo: 'Gancho', sub: 'Já se imaginou fazendo vídeos assim?', tag: '0–3 s' },
    { t: T.sem, titulo: 'A dor', sub: 'Sem editor, sem After Effects', tag: 'Problema' },
    { t: T.prog, titulo: 'A virada', sub: 'Não foi editado: foi programado', tag: 'Boom' },
    { t: T.roteiro, titulo: 'Como funciona', sub: 'Roteiro + voz com IA', tag: 'Método' },
    { t: T.palavra, titulo: 'Cena na palavra', sub: 'Sincronia exata com a fala', tag: 'Diferencial' },
    { t: T.kit, titulo: 'O que vem junto', sub: 'Print real, animação, legenda, trilha', tag: 'Entrega' },
    { t: T.fps, titulo: '60 fps', sub: 'Pronto pra postar', tag: 'Qualidade' },
    { t: T.caso, titulo: 'Case real', sub: 'Mural de Vagas NESP', tag: 'Prova' },
    { t: T.oferta, titulo: 'A oferta', sub: 'Faço pra você ou te ensino', tag: 'Oferta' },
    { t: T.cta, titulo: 'Chamada', sub: 'Me chama no direct', tag: 'CTA' },
  ];
  return T;
}
function palavrasDaFrase(i) { const f = VO.frases[i]; return VO.words.slice(f.words[0], f.words[1] + 1); }

// ------------------------------------------------------------------ utilidades
const sp = (t, t0, cfg = SPRING.gentle) => spring(t - t0, cfg);
const fadeIn = (t, t0, d = 0.25) => E.outCubic(prog(t, t0, t0 + d));
const fadeOut = (t, t1, d = 0.25) => 1 - E.inCubic(prog(t, t1 - d, t1));
const f = (size, weight = 900, fam = UI) => `${weight} ${size}px ${fam}`;

const SPR = new Map();
function sprite(txt, font, cor, blur = 0, stroke = null) {
  const key = `${txt}|${font}|${cor}|${blur}|${stroke}`;
  let s = SPR.get(key);
  if (s) return s;
  const m = document.createElement('canvas').getContext('2d');
  m.font = font;
  const mt = m.measureText(txt);
  const size = parseInt(font.match(/(\d+)px/)[1], 10);
  const pad = Math.ceil(size * 0.35) + blur * 2;
  const w = Math.ceil(mt.width) + pad * 2, h = Math.ceil(size * 1.5) + pad * 2;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const c = cv.getContext('2d');
  c.font = font; c.textBaseline = 'alphabetic';
  if (blur > 0) c.filter = `blur(${blur}px)`;
  const by = pad + size * 1.12;
  if (stroke) { c.lineJoin = 'round'; c.lineWidth = stroke[1]; c.strokeStyle = stroke[0]; c.strokeText(txt, pad, by); }
  c.fillStyle = cor; c.fillText(txt, pad, by);
  s = { cv, w: mt.width, ox: pad, oy: by };
  SPR.set(key, s);
  return s;
}
// Texto centrado em (x, y) com escala, rotação e desfoque quantizado (via sprite em cache).
function texto(ctx, txt, x, y, font, cor, { s = 1, rot = 0, a = 1, blur = 0, stroke = null, align = 'center' } = {}) {
  a = clamp(a);
  if (a <= 0.003 || s <= 0.01) return 0;
  const spr = sprite(txt, font, cor, Math.round(clamp(blur, 0, 14)), stroke);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const dx = align === 'center' ? -spr.w / 2 : 0;
  ctx.drawImage(spr.cv, dx - spr.ox, -spr.oy + parseInt(font.match(/(\d+)px/)[1], 10) * 0.38);
  ctx.restore();
  return spr.w;
}
// "Slam": a palavra cai grande e assenta com mola (o impacto clássico de Reels).
function slam(ctx, t, t0, txt, x, y, size, cor, { rot = 0, fam = DISPLAY, stroke = null, sai = 1e9, de = 1.9 } = {}) {
  if (t < t0 - 0.02) return;
  const s = sp(t, t0, { stiffness: 520, damping: 26 });
  const k = lerp(de, 1, s);
  texto(ctx, txt, x, y, f(size, 400, fam), cor, { s: k, rot, a: clamp(s * 3) * fadeOut(t, sai, 0.2), blur: 10 * (1 - clamp(s)), stroke });
}
function emoji(ctx, t, t0, e, x, y, size, { sai = 1e9, giro = 0.25, flutua = true } = {}) {
  if (t < t0 - 0.02) return;
  const s = sp(t, t0, SPRING.bouncy);
  const dy = flutua ? -18 * Math.sin((t - t0) * 2.4) : 0;
  texto(ctx, e, x, y + dy, f(size, 400, EMOJI), '#000', { s: clamp(s, 0, 1.25), rot: giro * Math.sin((t - t0) * 3) * Math.exp(-(t - t0)), a: clamp(s * 2) * fadeOut(t, sai, 0.2) });
}
function adesivo(ctx, t, t0, txt, x, y, { cor = C.lima, txtCor = C.noite, size = 46, rot = -0.05, sai = 1e9, icone = '' } = {}) {
  if (t < t0 - 0.02) return;
  const s = sp(t, t0, SPRING.bouncy);
  const a = clamp(s * 3) * fadeOut(t, sai, 0.2);
  if (a <= 0.003) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot + 0.05 * Math.sin((t - t0) * 2)); ctx.scale(clamp(s, 0, 1.2), clamp(s, 0, 1.2));
  ctx.font = f(size, 900);
  const full = icone ? `${icone}  ${txt}` : txt;
  const w = ctx.measureText(full).width + size * 1.3, h = size * 1.9;
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  rrect(ctx, -w / 2, -h / 2, w, h, 18); ctx.fillStyle = cor; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (icone) {
    ctx.font = f(size, 400, EMOJI); const iw = ctx.measureText(icone).width;
    ctx.font = f(size, 900); const tw = ctx.measureText(txt).width;
    const x0 = -(iw + size * 0.4 + tw) / 2;
    ctx.font = f(size, 400, EMOJI); ctx.textAlign = 'left'; ctx.fillText(icone, x0, 2);
    ctx.font = f(size, 900); ctx.fillStyle = txtCor; ctx.fillText(txt, x0 + iw + size * 0.4, 3);
  } else { ctx.fillStyle = txtCor; ctx.fillText(txt, 0, 3); }
  ctx.restore();
}
function fundo(ctx, t, cor1 = C.noite, cor2 = C.noite2, brilho = C.roxo) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, cor1); g.addColorStop(1, cor2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // duas manchas de luz que andam devagar
  for (const [i, c] of [[0, brilho], [1, C.rosa]]) {
    const x = 540 + 380 * noise1(t * 0.18 + i * 7, 3 + i), y = 760 + 520 * noise1(t * 0.14 + i * 3, 9 + i);
    const r = ctx.createRadialGradient(x, y, 0, x, y, 720);
    r.addColorStop(0, c + '55'); r.addColorStop(1, c + '00');
    ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  }
  // grão
  ctx.fillStyle = 'rgba(255,255,255,0.035)';
  const fr = Math.floor(t * 24);
  for (let i = 0; i < 160; i++) ctx.fillRect(hash01(i + fr * 160, 2) * W, hash01(i + fr * 160, 5) * H, 2, 2);
}
function celular(ctx, IMG, img, cx, cy, w, { rot = 0, a = 1, img2 = null, mixB = 0 } = {}) {
  a = clamp(a);
  if (a <= 0.003) return;
  const h = w * 2.12, R = w * 0.13, b = w * 0.035;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 80; ctx.shadowOffsetY = 40;
  rrect(ctx, -w / 2 - b, -h / 2 - b, w + 2 * b, h + 2 * b, R + b); ctx.fillStyle = '#05060a'; ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.stroke();
  ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, R); ctx.clip();
  const desenha = (k, al) => {
    const im = IMG[k]; if (!im || al <= 0) return;
    const s = Math.max(w / im.width, h / im.height);
    ctx.globalAlpha = a * al; ctx.drawImage(im, -im.width * s / 2, -h / 2, im.width * s, im.height * s);
  };
  desenha(img, 1); if (img2) desenha(img2, mixB);
  ctx.restore();
  ctx.globalAlpha = a; rrect(ctx, -w * 0.14, -h / 2 + w * 0.03, w * 0.28, w * 0.07, w * 0.035); ctx.fillStyle = '#05060a'; ctx.fill();
  ctx.restore();
}
// Intensidade do "boom": tremor + flash, decaindo depois de cada impacto.
function boom(t) {
  let k = 0;
  for (const b of BOOMS) if (t >= b) k = Math.max(k, Math.exp(-(t - b) * 7));
  return k;
}

// ------------------------------------------------------------------ cenas
function cenaHook(ctx, t, IMG) {
  fundo(ctx, t);
  // montagem rápida do case, trocando a cada batida (120 bpm)
  const i = Math.floor(t / 0.36) % MONTAGEM.length;
  const ent = sp(t, 0.05, SPRING.bouncy);
  const pulso = 1 + 0.035 * Math.exp(-((t % 0.36) / 0.08));
  celular(ctx, IMG, MONTAGEM[i], 540, lerp(1700, 1380, ent), 500 * pulso, { rot: -0.05 + 0.03 * Math.sin(t * 2), a: clamp(ent * 2) });
  const ws = palavrasDaFrase(0);
  const linhas = [['JÁ', 'SE'], ['IMAGINOU'], ['FAZENDO', 'VÍDEOS'], ['ASSIM?']];
  const ys = [310, 450, 590, 750], cores = [C.branco, C.branco, C.branco, C.lima];
  let k = 0;
  linhas.forEach((ln, li) => {
    const tw = li === 0 ? 0 : ws[Math.min(k, ws.length - 1)].t0 - 0.05;
    slam(ctx, t, tw, ln.join(' '), 540, ys[li], li === 3 ? 170 : 130, cores[li], { rot: li % 2 ? 0.02 : -0.02, stroke: ['#00000088', 10] });
    k += ln.length;
  });
  emoji(ctx, t, T.assim + 0.05, '👀', 830, 700, 130);
}

function cenaSem(ctx, t) {
  fundo(ctx, t, '#120a12', '#1c0d1c', C.rosa);
  slam(ctx, t, T.sem + 0.02, 'SEM', 540, 380, 220, C.rosa, { stroke: ['#00000066', 8] });
  const itens = [['EDITOR', T.editor], ['AFTER EFFECTS', T.ae], ['ARRASTAR CLIPE', T.arrastar]];
  itens.forEach(([txt, tw], i) => {
    const y = 720 + i * 230;
    slam(ctx, t, tw, txt, 540, y, 130, C.branco, { rot: (i - 1) * 0.03 });
    // risco vermelho
    const r = E.outCubic(prog(t, tw + 0.18, tw + 0.38));
    if (r > 0) {
      ctx.save(); ctx.translate(540, y); ctx.rotate(-0.06);
      ctx.fillStyle = C.vermelho; ctx.fillRect(-420, -12, 840 * r, 24); ctx.restore();
    }
    emoji(ctx, t, tw + 0.3, '❌', 880, y - 40, 90, { flutua: false });
  });
}

function cenaProgramado(ctx, t) {
  const bo = boom(t);
  fundo(ctx, t, '#06061a', '#120a2a', C.roxo);
  // "EDITADO" riscado → "PROGRAMADO" explode no boom
  const antes = t < T.programado;
  slam(ctx, t, T.prog + 0.02, 'ESSE VÍDEO NÃO FOI', 540, 420, 92, C.cinza, { de: 1.3, sai: T.programado + 0.02 });
  if (antes) {
    slam(ctx, t, T.editado, 'EDITADO', 540, 760, 230, C.branco);
    const r = E.outCubic(prog(t, T.editado + 0.25, T.editado + 0.45));
    if (r > 0) { ctx.fillStyle = C.vermelho; ctx.fillRect(140, 735, 800 * r, 30); }
  } else {
    slam(ctx, t, T.programado, 'ELE FOI', 540, 650, 110, C.branco, { de: 2.4 });
    const s = sp(t, T.programado, { stiffness: 600, damping: 22 });
    const font = f(168, 400, DISPLAY);
    // gradiente na palavra: desenha em sprite branco e pinta com composição
    ctx.save();
    const k = lerp(1.9, 1, s);
    ctx.translate(540, 900); ctx.scale(k, k); ctx.rotate(-0.04);
    ctx.globalAlpha = clamp(s * 3);
    ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const g = ctx.createLinearGradient(-450, 0, 450, 0);
    g.addColorStop(0, C.lima); g.addColorStop(0.5, '#4dffd2'); g.addColorStop(1, C.azul);
    ctx.lineWidth = 14; ctx.strokeStyle = '#000'; ctx.strokeText('PROGRAMADO', 0, 0);
    ctx.fillStyle = g; ctx.fillText('PROGRAMADO', 0, 0);
    ctx.restore();
    // chaves de código voando
    ['{', '}', '<', '/>', '()', ';'].forEach((c, i) => {
      const p = clamp((t - T.programado) / 1.2);
      const ang = hash01(i, 4) * Math.PI * 2, d = 200 + 460 * E.outExpo(p);
      texto(ctx, c, 540 + Math.cos(ang) * d, 900 + Math.sin(ang) * d * 0.8, f(90, 800, 'ui-monospace, Menlo, monospace'), [C.lima, C.rosa, C.azul][i % 3], { a: 1 - p * 0.7, rot: ang });
    });
    emoji(ctx, t, T.programado + 0.08, '💥', 840, 640, 150);
    emoji(ctx, t, T.programado + 0.2, '🤯', 200, 1140, 120);
  }
  if (bo > 0.01) { ctx.fillStyle = `rgba(255,255,255,${0.55 * bo})`; ctx.fillRect(0, 0, W, H); }
}

function cenaRoteiro(ctx, t) {
  fundo(ctx, t, '#07101f', '#0b1a33', C.azul);
  slam(ctx, t, T.roteiroW - 0.15, 'VOCÊ ESCREVE', 540, 320, 120, C.branco);
  // editor de código digitando o roteiro
  const e = sp(t, T.roteiro, SPRING.gentle);
  const x = 110, y = lerp(560, 420, e), w = 860, h = 560;
  ctx.save(); ctx.globalAlpha = clamp(e * 2);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 30;
  rrect(ctx, x, y, w, h, 28); ctx.fillStyle = '#0f1420'; ctx.fill(); ctx.shadowColor = 'transparent';
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.beginPath(); ctx.arc(x + 40 + i * 34, y + 38, 11, 0, 7); ctx.fillStyle = c; ctx.fill(); });
  ctx.fillStyle = C.cinza; ctx.font = f(26, 600, 'ui-monospace, Menlo, monospace'); ctx.textAlign = 'left';
  ctx.fillText('roteiro.json', x + 150, y + 47);
  const linhas = [
    ['"falas": [', C.cinza],
    ['  "Já se imaginou fazendo', C.lima], ['   vídeos assim?",', C.lima],
    ['  "Sem editor.",', C.lima], ['  "Ele foi programado."', C.lima], [']', C.cinza],
  ];
  const total = linhas.reduce((s, l) => s + l[0].length, 0);
  const n = Math.floor(total * prog(t, T.roteiro + 0.1, T.ia - 0.1));
  let usado = 0;
  ctx.font = f(34, 600, 'ui-monospace, Menlo, monospace');
  linhas.forEach(([l, cor], i) => {
    const vis = l.slice(0, Math.max(0, n - usado)); usado += l.length;
    ctx.fillStyle = cor; ctx.fillText(vis, x + 50, y + 130 + i * 62);
    if (vis.length > 0 && vis.length < l.length && Math.floor(t * 4) % 2 === 0) ctx.fillRect(x + 52 + ctx.measureText(vis).width, y + 102 + i * 62, 18, 36);
  });
  ctx.restore();
  // voz: forma de onda que acende em "narra"
  const v = sp(t, T.ia - 0.15, SPRING.bouncy);
  if (v > 0.01) {
    slam(ctx, t, T.ia - 0.1, 'A IA NARRA', 540, 1180, 120, C.lima);
    ctx.save(); ctx.globalAlpha = clamp(v * 2);
    const yy = 1380, barras = 34;
    for (let i = 0; i < barras; i++) {
      const amp = (0.25 + 0.75 * Math.abs(noise1(t * 6 + i * 0.6, 3))) * (t > T.ia ? 1 : 0.2);
      const hh = 20 + 210 * amp * v;
      rrect(ctx, 150 + i * 23, yy - hh / 2, 14, hh, 7);
      ctx.fillStyle = i % 2 ? C.lima : '#4dffd2'; ctx.fill();
    }
    ctx.restore();
    emoji(ctx, t, T.narra, '🎙️', 860, 1100, 120);
  }
}

function cenaPalavra(ctx, t) {
  fundo(ctx, t, '#0b0b14', '#1a0b24', C.rosa);
  const ws = palavrasDaFrase(4);
  // cada palavra cai exatamente quando é falada
  const pos = [[540, 330], [540, 500], [540, 670], [540, 820], [540, 970], [540, 1110], [540, 1260], [540, 1400]];
  const destaques = { cada: ['✨', C.lima], cena: ['🎬', C.rosa], palavra: ['🎯', C.lima], falada: ['🗣️', C.azul], exatamente: ['⚡', '#ffd23d'] };
  ws.forEach((w, i) => {
    const limpa = w.w.replace(/[.,]/g, '');
    const d = destaques[limpa.toLowerCase()];
    const [x, y] = pos[i] || [540, 1580];
    const size = d ? (limpa.length > 7 ? 140 : 190) : 120;
    slam(ctx, t, w.t0 - 0.03, limpa.toUpperCase(), x, y, size, d ? d[1] : C.branco, { rot: (i % 2 ? 1 : -1) * 0.035, stroke: ['#000000aa', 10], de: d ? 2.2 : 1.6 });
    if (d) emoji(ctx, t, w.t0 + 0.05, d[0], x + (i % 2 ? -400 : 400), y - 70, 100);
  });
  // régua do tempo com marcas batendo em cada palavra
  const f0 = ws[0].t0, f1 = ws[ws.length - 1].t1;
  const yy = 1520, x0 = 140, x1 = 940;
  ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(x0, yy, x1 - x0, 6);
  const p = clamp((t - f0) / (f1 - f0));
  ctx.fillStyle = C.lima; ctx.fillRect(x0, yy, (x1 - x0) * p, 6);
  ws.forEach((w) => {
    const xx = x0 + (x1 - x0) * clamp((w.t0 - f0) / (f1 - f0));
    const on = t >= w.t0;
    ctx.beginPath(); ctx.arc(xx, yy + 3, on ? 12 : 7, 0, 7); ctx.fillStyle = on ? C.lima : 'rgba(255,255,255,.35)'; ctx.fill();
  });
}

function cenaKit(ctx, t, IMG) {
  fundo(ctx, t, '#08121a', '#0b1f2a', '#1fd1a5');
  const e = sp(t, T.kit, SPRING.gentle);
  const troca = E.inOutCubic(prog(t, T.legenda, T.legenda + 0.4));
  celular(ctx, IMG, 'home', 540, lerp(1800, 1050, e), 460, { rot: 0.04 * Math.sin(t), img2: 'sucesso', mixB: troca });
  adesivo(ctx, t, T.print, 'PRINT REAL', 300, 500, { icone: '📱', rot: -0.08 });
  adesivo(ctx, t, T.animacao, 'ANIMAÇÃO', 770, 740, { icone: '⚡', cor: C.rosa, txtCor: C.branco, rot: 0.07 });
  adesivo(ctx, t, T.legenda, 'LEGENDA', 290, 1100, { icone: '💬', cor: C.azul, txtCor: C.branco, rot: -0.06 });
  adesivo(ctx, t, T.trilha, 'TRILHA', 760, 1300, { icone: '🎵', cor: '#ffd23d', rot: 0.06 });
  slam(ctx, t, T.kit + 0.02, 'TUDO JUNTO', 540, 320, 130, C.branco, { stroke: ['#00000088', 10] });
}

function cenaFPS(ctx, t) {
  const bo = boom(t);
  fundo(ctx, t, '#0a0a0a', '#1a1300', C.laranja);
  const n = Math.round(60 * E.outExpo(prog(t, T.fps + 0.05, T.sessenta + 0.1)));
  const s = sp(t, T.sessenta, { stiffness: 500, damping: 18 });
  const k = t < T.sessenta ? 0.8 : lerp(1.5, 1, s);
  texto(ctx, String(n), 540, 760, f(560, 400, DISPLAY), t >= T.sessenta ? '#ffd23d' : C.branco, { s: k, stroke: ['#000', 16] });
  slam(ctx, t, T.sessenta + 0.15, 'QUADROS POR SEGUNDO', 540, 1080, 92, C.branco);
  emoji(ctx, t, T.sessenta + 0.1, '🔥', 840, 480, 150);
  // barra de envio → postado
  const p = E.inOutCubic(prog(t, T.sessenta + 0.6, T.postar));
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = clamp(p * 4);
    rrect(ctx, 160, 1300, 760, 120, 60); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fill();
    rrect(ctx, 160, 1300, 760 * p, 120, 60); ctx.fillStyle = t >= T.postar ? '#28c840' : C.laranja; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = f(48, 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(t >= T.postar ? 'PRONTO PRA POSTAR' : `RENDER ${Math.round(p * 100)}%`, 540, 1362);
    ctx.restore();
  }
  emoji(ctx, t, T.postar + 0.05, '🚀', 830, 1230, 120);
  if (bo > 0.01) { ctx.fillStyle = `rgba(255,210,61,${0.35 * bo})`; ctx.fillRect(0, 0, W, H); }
}

function cenaCaso(ctx, t, IMG) {
  const bo = boom(t);
  fundo(ctx, t, '#06101f', '#0a2147', C.azul);
  adesivo(ctx, t, T.caso + 0.05, 'CASE REAL', 540, 300, { icone: '✅', cor: C.lima, size: 50, rot: -0.03 });
  // o vídeo do Mural NESP rodando dentro do celular
  const e = sp(t, T.caso, SPRING.gentle);
  const quadros = ['f_1_0', 'f_6_5', 'f_12_6', 'f_19_5', 'f_26_0', 'f_30_6', 'f_33_4', 'f_38_9', 'f_44_6', 'f_47_5'];
  const pos = clamp((t - T.caso) / (T.oferta - T.caso)) * (quadros.length - 1);
  const i = Math.floor(pos), fr = pos - i;
  celular(ctx, IMG, quadros[i], 540, lerp(1800, 1060, e), 480, { rot: -0.03, img2: quadros[Math.min(i + 1, quadros.length - 1)], mixB: E.inOutCubic(clamp((fr - 0.7) / 0.3)) });
  texto(ctx, 'Mural de Vagas NESP · App Inatel', 540, 400, f(36, 700), C.cinza, { a: fadeIn(t, T.caso + 0.3) });
  adesivo(ctx, t, T.horas, 'POUCAS HORAS', 290, 560, { icone: '⏱️', cor: C.rosa, txtCor: C.branco, rot: -0.09 });
  adesivo(ctx, t, T.zero, 'DO ZERO', 760, 1320, { icone: '🤯', cor: '#ffd23d', rot: 0.08, size: 54 });
  if (bo > 0.01) { ctx.fillStyle = `rgba(255,255,255,${0.35 * bo})`; ctx.fillRect(0, 0, W, H); }
}

function cenaOferta(ctx, t) {
  fundo(ctx, t, '#0b0b14', '#1a1030', C.roxo);
  slam(ctx, t, T.oferta + 0.02, 'QUER UM ASSIM?', 540, 360, 140, C.branco, { stroke: ['#00000088', 10] });
  const cards = [
    [T.produto, '🎬', 'FAÇO PRA VOCÊ', 'Vídeo do seu produto, pronto', C.lima, C.noite, 740],
    [T.aprender, '📘', 'TE ENSINO', 'Método completo + suporte', C.rosa, C.branco, 1140],
  ];
  cards.forEach(([tw, em, tit, sub, cor, txt, y], i) => {
    const s = sp(t, tw - 0.1, SPRING.bouncy);
    if (s <= 0.001) return;
    const pulso = 1 + 0.02 * Math.sin((t - tw) * 6);
    ctx.save(); ctx.globalAlpha = clamp(s * 2); ctx.translate(540 + (1 - s) * (i ? 600 : -600), y); ctx.rotate(i ? 0.03 : -0.03); ctx.scale(pulso, pulso);
    ctx.shadowColor = cor + '88'; ctx.shadowBlur = 60;
    rrect(ctx, -420, -160, 840, 320, 40); ctx.fillStyle = cor; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.font = f(130, 400, EMOJI); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(em, -370, -10);
    ctx.fillStyle = txt; ctx.font = f(80, 400, DISPLAY); ctx.fillText(tit, -200, -45);
    ctx.font = f(36, 700); ctx.globalAlpha *= 0.85; ctx.fillText(sub, -200, 55);
    ctx.restore();
  });
}

function cenaCTA(ctx, t) {
  const bo = boom(t);
  fundo(ctx, t, '#12061a', '#2a0b2e', C.rosa);
  slam(ctx, t, T.cta + 0.02, 'ME CHAMA', 540, 330, 180, C.branco, { stroke: ['#00000088', 12] });
  slam(ctx, t, wt(VO, 'direct.') - 0.05, 'NO DIRECT', 540, 520, 180, C.lima, { stroke: ['#00000088', 12] });
  // tela de conversa estilo direct
  const e = sp(t, T.cta + 0.1, SPRING.gentle);
  const x = 140, y = lerp(1900, 660, e), w = 800, h = 660;
  ctx.save(); ctx.globalAlpha = clamp(e * 2);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 30;
  rrect(ctx, x, y, w, h, 50); ctx.fillStyle = '#0d0d12'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.stroke();
  // cabeçalho com avatar em gradiente (anel de stories)
  const g = ctx.createLinearGradient(x + 50, y + 40, x + 150, y + 140);
  g.addColorStop(0, '#feda75'); g.addColorStop(0.5, '#d62976'); g.addColorStop(1, '#4f5bd5');
  ctx.beginPath(); ctx.arc(x + 100, y + 95, 50, 0, 7); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.arc(x + 100, y + 95, 42, 0, 7); ctx.fillStyle = '#1d1d28'; ctx.fill();
  ctx.font = f(40, 400, EMOJI); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🎬', x + 100, y + 97);
  ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = f(38, 800); ctx.fillText(MARCA.handle || '@seu.perfil', x + 175, y + 80);
  ctx.fillStyle = C.cinza; ctx.font = f(28, 600); ctx.fillText('Ativo agora', x + 175, y + 122);
  ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(x, y + 180, w, 2);
  // bolha recebida
  rrect(ctx, x + 40, y + 230, 560, 110, 40); ctx.fillStyle = '#26262f'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = f(34, 600); ctx.fillText('Quer um vídeo desses?', x + 80, y + 285);
  ctx.restore();
  // mensagem enviada pelo espectador
  const tEnv = T.direct + 0.25;
  const m = sp(t, tEnv, SPRING.bouncy);
  if (m > 0.001) {
    ctx.save(); ctx.globalAlpha = clamp(m * 2) * clamp(e * 2);
    ctx.translate(x + w - 60, y + 420); ctx.scale(clamp(m, 0, 1.15), clamp(m, 0, 1.15));
    const gg = ctx.createLinearGradient(-520, 0, 0, 0); gg.addColorStop(0, '#7c5cff'); gg.addColorStop(1, '#ff3d81');
    rrect(ctx, -520, -60, 520, 120, 44); ctx.fillStyle = gg; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = f(40, 800); ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('Quero o meu! 🔥', -40, 2);
    ctx.restore();
  }
  // campo de mensagem + botão enviar com toque
  ctx.save(); ctx.globalAlpha = clamp(e * 2);
  rrect(ctx, x + 40, y + h - 130, w - 80, 90, 45); ctx.fillStyle = '#1d1d28'; ctx.fill();
  ctx.fillStyle = C.cinza; ctx.font = f(32, 600); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(t < tEnv ? 'Quero o meu! 🔥' : 'Mensagem...', x + 80, y + h - 85);
  const bx = x + w - 95, by = y + h - 85;
  ctx.beginPath(); ctx.arc(bx, by, 38, 0, 7); ctx.fillStyle = '#4f5bd5'; ctx.fill();
  ctx.font = f(36, 400, EMOJI); ctx.textAlign = 'center'; ctx.fillText('➤', bx + 2, by + 2);
  // toque
  if (t > tEnv - 0.6 && t < tEnv + 0.8) {
    const mm = sp(t, tEnv - 0.6, SPRING.snappy);
    const fx = lerp(900, bx, mm), fy = lerp(1900, by, mm);
    ctx.globalAlpha = clamp(mm * 2) * fadeOut(t, tEnv + 0.8, 0.3);
    if (t > tEnv) { const p = prog(t, tEnv, tEnv + 0.5); ctx.lineWidth = 6; ctx.strokeStyle = C.lima; ctx.globalAlpha *= 1 - p; ctx.beginPath(); ctx.arc(bx, by, 40 + 90 * p, 0, 7); ctx.stroke(); }
    ctx.globalAlpha = clamp(mm * 2) * fadeOut(t, tEnv + 0.8, 0.3);
    ctx.beginPath(); ctx.arc(fx, fy, 44, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fill();
  }
  ctx.restore();
  // corações subindo depois do envio
  if (t > tEnv) {
    for (let i = 0; i < 14; i++) {
      const p = (t - tEnv - hash01(i, 3) * 0.6);
      if (p < 0 || p > 2.4) continue;
      const xx = 800 + 120 * noise1(p * 1.5 + i, i + 2), yy = 1250 - p * 520;
      texto(ctx, ['❤️', '🔥', '😍', '✨'][i % 4], xx, yy, f(70 + 30 * hash01(i, 8), 400, EMOJI), '#000', { a: 1 - p / 2.4, s: 0.8 + 0.4 * hash01(i, 9) });
    }
  }
  adesivo(ctx, t, T.direct + 0.9, `Ou comenta "${MARCA.palavra_comentario || 'VÍDEO'}"`, 540, 1420, { icone: '💬', cor: C.lima, size: 44, rot: -0.03 });
  if (bo > 0.01) { ctx.fillStyle = `rgba(255,255,255,${0.3 * bo})`; ctx.fillRect(0, 0, W, H); }
}

// Legenda queimada (padrão Reels): frase atual, palavra falada em destaque.
function legenda(ctx, t) {
  const fr = VO.frases.find((x) => t >= x.t0 - 0.1 && t <= x.t1 + 0.25);
  if (!fr || fr === VO.frases[4] || fr === VO.frases[VO.frases.length - 1]) return; // nessas cenas o texto na tela já é a legenda
  const ws = VO.words.slice(fr.words[0], fr.words[1] + 1);
  ctx.save(); ctx.font = f(40, 800); ctx.textBaseline = 'middle';
  const linhas = []; let atual = [], larg = 0;
  for (const w of ws) {
    const lw = ctx.measureText(w.w + ' ').width;
    if (larg + lw > 860 && atual.length) { linhas.push(atual); atual = []; larg = 0; }
    atual.push(w); larg += lw;
  }
  if (atual.length) linhas.push(atual);
  const y0 = 1560 - (linhas.length - 1) * 56;
  const largMax = Math.max(...linhas.map((ln) => ln.reduce((s, w) => s + ctx.measureText(w.w + ' ').width, 0)));
  rrect(ctx, 540 - largMax / 2 - 28, y0 - 46, largMax + 56, linhas.length * 56 + 36, 26);
  ctx.fillStyle = 'rgba(8,8,16,.62)'; ctx.fill();
  linhas.forEach((ln, li) => {
    const total = ln.reduce((s, w) => s + ctx.measureText(w.w + ' ').width, 0);
    let x = 540 - total / 2;
    const y = y0 + li * 56;
    for (const w of ln) {
      const dito = t >= w.t0, agoraW = dito && t < w.t1 + 0.05;
      ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineJoin = 'round';
      ctx.strokeText(w.w, x, y);
      ctx.fillStyle = agoraW ? C.lima : dito ? '#fff' : 'rgba(255,255,255,.55)';
      ctx.fillText(w.w, x, y);
      x += ctx.measureText(w.w + ' ').width;
    }
  });
  ctx.restore();
}

// ------------------------------------------------------------------ montagem
const CENAS = [
  ['hook', 'sem', cenaHook], ['sem', 'prog', cenaSem], ['prog', 'roteiro', cenaProgramado],
  ['roteiro', 'palavra', cenaRoteiro], ['palavra', 'kit', cenaPalavra], ['kit', 'fps', cenaKit],
  ['fps', 'caso', cenaFPS], ['caso', 'oferta', cenaCaso], ['oferta', 'cta', cenaOferta], ['cta', 'dur', cenaCTA],
];
export function draw(ctx, t, IMG) {
  ctx.save();
  ctx.fillStyle = C.noite; ctx.fillRect(0, 0, W, H);
  // tremor de câmera nos booms
  const bo = boom(t);
  if (bo > 0.02) ctx.translate(26 * bo * noise1(t * 60, 1), 26 * bo * noise1(t * 60, 7));
  for (let i = 0; i < CENAS.length; i++) {
    const [a, b, fn] = CENAS[i];
    const t0 = T[a], t1 = T[b];
    if (t < t0 || t >= t1 + 0.12) continue;
    ctx.save();
    // corte seco com "punch-in" (zoom rápido): ritmo de Reels
    const ent = i === 0 ? 1 : E.outCubic(prog(t, t0, t0 + 0.18));
    if (ent < 1) { const z = lerp(1.12, 1, ent); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); }
    fn(ctx, t, IMG);
    ctx.restore();
  }
  ctx.restore();
  legenda(ctx, t);
}
