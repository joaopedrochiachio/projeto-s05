// Mural de Vagas NESP — filme de demonstração 9:16 (1080×1920).
// O filme é uma função pura do tempo: draw(ctx, t) pinta o quadro t só a partir de t.
// Sem estado entre quadros, sem Math.random, sem timers (contrato de render do guia).
// Cada cena começa numa palavra da narração (vo.json), então trocar a voz reposiciona tudo.
import { E, SPRING, spring, clamp, lerp, prog, kf, hash01, noise1, mix, rrect, crop } from './lib/motion.js';
import { wt, ph } from './lib/vo.js';

export const W = 1080, H = 1920;
const C = {
  azul: '#126ae2', azulForte: '#0a3f8f', azulNoite: '#071d42', fundo: '#f3f6fb',
  texto: '#0f1b2d', texto2: '#46536a', mudo: '#7a879c', borda: '#e4e9f1',
  verde: '#12a150', laranja: '#d97706', vermelho: '#dc2626', branco: '#ffffff',
};
const FONTE = 'Inter, "Helvetica Neue", Arial, sans-serif';
const f = (size, weight = 800) => `${weight} ${size}px ${FONTE}`;

export const LOGO_D = 'M127.455,156.988h21.287l-21.859,102.835H105.69L127.455,156.988L127.455,156.988z M225.618,208.048 l-10.941,51.775H194.51l9.726-45.911c0.286-1.168,0.477-2.312,0.62-3.456c0.143-1.144,0.214-2.145,0.214-3.027 c0-2.86-0.834-4.982-2.527-6.412c-1.668-1.407-4.147-2.122-7.461-2.122c-5.078,0-9.392,1.406-12.968,4.219 c-3.552,2.836-5.888,6.698-6.96,11.633l-9.559,45.076h-20.31l16.186-75.946h19.905l-2.002,9.559 c3.957-3.886,8.105-6.794,12.491-8.701c4.362-1.907,9.011-2.86,13.945-2.86c6.508,0,11.656,1.501,15.447,4.529 c3.79,3.027,5.697,7.151,5.697,12.372c0,1.239-0.096,2.55-0.286,3.933S226.143,205.855,225.618,208.048L225.618,208.048z M282.709,222.636c-3.29,1.455-7.318,2.646-12.038,3.6c-4.744,0.954-7.557,1.55-8.438,1.788c-3.218,0.978-5.674,2.526-7.414,4.648 c-1.716,2.122-2.574,4.672-2.574,7.652c0,2.074,0.739,3.719,2.24,4.887c1.478,1.168,3.552,1.74,6.222,1.74 c5.078,0,9.487-1.574,13.206-4.721s6.15-7.342,7.271-12.61L282.709,222.636L282.709,222.636z M306.333,202.613l-9.154,43.145 c-0.238,1.313-0.405,2.432-0.524,3.361s-0.167,1.717-0.167,2.385c0,1.168,0.167,2.098,0.548,2.789 c0.381,0.715,1.049,1.406,2.026,2.098l-0.763,3.432h-21.025c-0.048-0.285-0.143-0.643-0.286-1.119 c-0.381-1.813-0.572-3.076-0.572-3.768c0-0.428,0.048-1,0.119-1.715c0.072-0.74,0.167-1.574,0.31-2.551 c-3.218,3.861-7.032,6.793-11.49,8.818c-4.458,2.027-9.344,3.053-14.708,3.053c-5.721,0-10.274-1.455-13.659-4.338 c-3.361-2.885-5.054-6.771-5.054-11.658c0-9.51,2.574-16.876,7.724-22.097c5.125-5.197,13.206-8.629,24.171-10.25 c1.788-0.287,4.195-0.645,7.271-1.049c10.131-1.168,15.185-4.53,15.185-10.108c0-2.098-0.834-3.623-2.527-4.577 c-1.669-0.954-4.338-1.43-8.033-1.43c-4.195,0-7.581,0.93-10.131,2.813c-2.574,1.883-4.052,4.529-4.481,7.914h-19.166 c1.359-8.2,5.292-14.684,11.824-19.451c6.507-4.768,14.731-7.151,24.672-7.151c8.987,0,15.971,1.454,20.954,4.362 s7.484,6.984,7.484,12.205c0,0.834-0.047,1.668-0.143,2.503C306.642,201.063,306.5,201.874,306.333,202.613L306.333,202.613z M335.081,163.281h20.31l-4.338,20.595h12.634l-3.004,14.303h-12.776l-8.844,42.026c0,0.238-0.048,0.547-0.144,0.93 c-0.095,0.404-0.144,0.668-0.144,0.811c0,1.119,0.549,1.93,1.67,2.406c1.119,0.502,3.051,0.74,5.792,0.74h4.409l-3.289,15.303 c-1.168,0.049-2.717,0.096-4.672,0.145c-3.528,0.094-5.84,0.143-6.913,0.143c-6.508,0-11.18-0.883-14.017-2.646 c-2.837-1.787-4.267-4.672-4.267-8.678c0-1.119,0.118-2.455,0.357-4.051c0.214-1.574,0.596-3.6,1.12-6.08l8.701-41.048h-10.752 l3.004-14.303h10.895L335.081,163.281L335.081,163.281z M432.339,227.213H383.4c-0.167,1.025-0.311,2.026-0.405,3.004 s-0.144,1.835-0.144,2.574c0,4.1,0.978,7.199,2.956,9.297s4.911,3.146,8.772,3.146c3.266,0,6.031-0.668,8.344-1.979 c2.313-1.334,4.434-3.48,6.389-6.46h20.309c-3.576,7.962-8.914,14.208-16.018,18.761c-7.105,4.553-14.994,6.842-23.695,6.842 c-8.63,0-15.424-2.551-20.43-7.676c-5.006-5.127-7.508-12.016-7.508-20.692c0-6.197,1.096-12.609,3.289-19.236 c2.17-6.627,5.077-12.325,8.725-17.092c4.172-5.435,9.059-9.559,14.588-12.348c5.531-2.789,11.633-4.195,18.283-4.195 c8.939,0,15.924,2.36,20.955,7.104c5.029,4.72,7.531,11.275,7.531,19.666c0,2.193-0.213,4.696-0.666,7.534 C434.246,218.322,433.458,222.232,432.339,227.213L432.339,227.213z M414.46,213.912c0.143-1.119,0.262-2.098,0.334-2.955 c0.07-0.858,0.096-1.55,0.096-2.05c0-3.385-0.979-6.031-2.957-7.914s-4.768-2.813-8.344-2.813c-4.146,0-7.676,1.335-10.607,4.005 s-5.172,6.579-6.697,11.728H414.46L414.46,213.912z M461.826,156.988h20.311l-21.932,102.835h-20.262L461.826,156.988 L461.826,156.988z';
const LOGO = new Path2D(LOGO_D);

// ------------------------------------------------------------------ tempos (presos às palavras)
export let T = {};
export let CHAPTERS = [];
let TELAS = {};

export function setup(VO, telas) {
  TELAS = telas.telas;
  const F = (i) => ph(VO, i).t0;
  const a = (i) => F(i) - 0.05;
  T = {
    dur: VO.dur,
    gancho: 0,
    prazo: wt(VO, 'prazo'),
    problema: a(1), email: wt(VO, 'e-mail'), muralFisico: wt(VO, 'mural', { after: F(1) }), grupo: wt(VO, 'grupo'),
    fechou: a(2), fechouW: wt(VO, 'fechou'),
    virada: a(3), viradaMural: wt(VO, 'Mural', { after: F(3) }), aplicativo: wt(VO, 'aplicativo', { after: F(3) }),
    alerta: a(4), avisa: wt(VO, 'avisa'), quatro: wt(VO, 'quatro'),
    filtro: a(5), curso: wt(VO, 'curso'), periodo: wt(VO, 'período'),
    vaga: a(6), confira: wt(VO, 'Confira'), bolsa: wt(VO, 'bolsa'), requisitos: wt(VO, 'requisitos'), beneficios: wt(VO, 'benefícios'),
    salvar: a(7), salve: wt(VO, 'Salve'), favoritos: wt(VO, 'favoritos', { after: F(7) }), depois: wt(VO, 'depois'),
    candidatar: a(8), curriculo: wt(VO, 'currículo'),
    toque: a(9), toqueW: wt(VO, 'toque'), enviada: wt(VO, 'enviada'), protocolo: wt(VO, 'protocolo'),
    minhas: a(10), enviado: wt(VO, 'enviado', { after: F(10) }), analise: wt(VO, 'análise'), entrevista: wt(VO, 'entrevista'),
    cta: a(11), ctaComeca: wt(VO, 'começa', { after: F(11) }),
  };
  CHAPTERS = [
    { t: T.gancho, titulo: 'O problema', sub: 'Prazos perdidos', tag: 'Contexto' },
    { t: T.problema, titulo: 'Divulgação espalhada', sub: 'E-mail, mural físico, grupos', tag: 'HTA · Problema' },
    { t: T.virada, titulo: 'Mural NESP no App Inatel', sub: 'A recomendação da HTA', tag: 'Virada' },
    { t: T.alerta, titulo: 'Alerta push de vagas', sub: 'NotificacaoPush.dispararAlertaPrazo()', tag: 'Tela 01 · HTA 1.1' },
    { t: T.filtro, titulo: 'Filtro automático', sub: 'Aluno.filtrarVagas(curso, periodo)', tag: 'Tela 03 · HTA 1.2' },
    { t: T.vaga, titulo: 'Avaliar a vaga', sub: 'VagaEstagio.exibirRequisitosBeneficios()', tag: 'Tela 04 · HTA 2.A' },
    { t: T.salvar, titulo: 'Salvar nos favoritos', sub: 'Aluno.salvarNosFavoritos(vagaId)', tag: 'Tela 04/05 · HTA 2.B' },
    { t: T.candidatar, titulo: 'Anexar currículo PDF', sub: 'Candidatura.anexarCurriculo(id)', tag: 'Tela 06 · HTA 3.1' },
    { t: T.toque, titulo: 'Confirmar e feedback', sub: 'confirmarCandidatura() · gerarFeedbackVisual()', tag: 'Tela 07 · HTA 3.2' },
    { t: T.minhas, titulo: 'Acompanhar status', sub: 'Aluno.acompanharStatus()', tag: 'Tela 08 · HTA 4' },
    { t: T.cta, titulo: 'Chamada final', sub: 'Mural de Vagas NESP', tag: 'CTA' },
  ];
  return T;
}

export const IMAGES = Object.fromEntries(
  ['home', 'mural', 'detalhe', 'detalhe2', 'detalhe_fav', 'favoritas', 'modal', 'sucesso', 'minhas', 'minhas2', 'minhas3']
    .map((k) => [k, `app/${k}.jpg`]),
);

// ------------------------------------------------------------------ utilidades de desenho
const sp = (t, t0, cfg = SPRING.gentle) => spring(t - t0, cfg);
const fadeIn = (t, t0, d = 0.3) => E.outCubic(prog(t, t0, t0 + d));
const fadeOut = (t, t1, d = 0.3) => 1 - E.inCubic(prog(t, t1 - d, t1));

function bgClaro(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#f6f9ff'); g.addColorStop(1, '#dfe9fb');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // halo azul que respira devagar
  const hx = 540 + 220 * noise1(t * 0.15, 4), hy = 760 + 160 * noise1(t * 0.12, 9);
  const r = ctx.createRadialGradient(hx, hy, 0, hx, hy, 900);
  r.addColorStop(0, 'rgba(18,106,226,0.16)'); r.addColorStop(1, 'rgba(18,106,226,0)');
  ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  pontos(ctx, 'rgba(18,106,226,0.07)', t);
}
function bgAzul(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, W * 0.4, H);
  g.addColorStop(0, C.azul); g.addColorStop(1, C.azulForte);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.07; ctx.strokeStyle = '#fff'; ctx.lineWidth = 70;
  ctx.beginPath(); ctx.arc(W + 40, 260, 380 + 10 * Math.sin(t), 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(-80, H - 200, 300, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  pontos(ctx, 'rgba(255,255,255,0.12)', t);
}
function bgNoite(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0b1a33'); g.addColorStop(1, '#050d1c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  pontos(ctx, 'rgba(255,255,255,0.05)', t);
}
function pontos(ctx, cor, t) {
  ctx.fillStyle = cor;
  const off = (t * 6) % 42;
  for (let y = -42 + off; y < H; y += 42) for (let x = 21; x < W; x += 42) ctx.fillRect(x, y, 3, 3);
}

// Faixa clara no topo: garante leitura do título quando o celular sobe por baixo dele.
function vinhetaTopo(ctx, altura = 470) {
  const g = ctx.createLinearGradient(0, 0, 0, altura);
  g.addColorStop(0, 'rgba(244,248,255,0.97)'); g.addColorStop(0.62, 'rgba(244,248,255,0.85)'); g.addColorStop(1, 'rgba(244,248,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, altura);
}

// Sprite de palavra em cache (um por nível de desfoque): o blur é aplicado num canvas pequeno,
// nunca no quadro inteiro, então o título com desfoque custa quase nada por quadro.
const SPR = new Map();
function sprite(txt, size, cor, blur) {
  const key = `${txt}|${size}|${cor}|${blur}`;
  let sp0 = SPR.get(key);
  if (sp0) return sp0;
  const m = document.createElement('canvas').getContext('2d');
  m.font = f(size);
  const pad = 32, w = Math.ceil(m.measureText(txt).width) + pad * 2, h = Math.ceil(size * 1.45) + pad * 2;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const c = cv.getContext('2d');
  c.font = f(size); c.fillStyle = cor; c.textBaseline = 'alphabetic';
  if (blur > 0) c.filter = `blur(${blur}px)`;
  c.fillText(txt, pad, pad + size * 1.08);
  sp0 = { cv, ox: pad, oy: pad + size * 1.08 };
  SPR.set(key, sp0);
  return sp0;
}

// Título com desfoque: cada palavra entra com blur 12→0, sobe 24px, 60 ms de atraso (técnica do guia).
// linhas: [[palavra | {w, c}]], tempos opcionais por palavra (karaokê).
function titulo(ctx, t, t0, linhas, { y = 260, size = 92, cor = C.texto, lh = 1.1, align = 'center', x = W / 2, tempos = null, sai = 1e9 } = {}) {
  ctx.save();
  ctx.font = f(size);
  let k = 0;
  const outA = fadeOut(t, sai, 0.25);
  linhas.forEach((linha, li) => {
    const pals = linha.map((p) => (typeof p === 'string' ? { w: p } : p));
    const larg = pals.map((p) => ctx.measureText(p.w).width);
    const esp = size * 0.28;
    const total = larg.reduce((s2, v) => s2 + v, 0) + esp * (pals.length - 1);
    let px = align === 'center' ? x - total / 2 : x;
    const py = y + li * size * lh;
    pals.forEach((p, i) => {
      const tw = tempos ? tempos[k] : t0 + k * 0.06;
      const s1 = sp(t, tw, SPRING.snappy);
      const a = clamp(clamp(s1 * 1.4) * outA);
      if (a > 0.003) {
        const spr = sprite(p.w, size, p.c || cor, Math.round(12 * (1 - clamp(s1))));
        ctx.globalAlpha = a;
        ctx.drawImage(spr.cv, px - spr.ox, py - spr.oy + 24 * (1 - s1));
      }
      px += larg[i] + esp; k++;
    });
  });
  ctx.restore();
}

function pilula(ctx, texto, cx, cy, { on = 1, size = 34, a = 1, icone = null, base = '#ffffff', baseTxt = C.azul } = {}) {
  a = clamp(a); on = clamp(on);
  if (a <= 0.003) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = f(size, 700);
  const iw = icone ? size * 1.05 : 0;
  const w = ctx.measureText(texto).width + size * 1.4 + iw, h = size * 2;
  if (on > 0.01) { ctx.shadowColor = `rgba(18,106,226,${0.55 * on})`; ctx.shadowBlur = 40 * on; }
  else { ctx.shadowColor = 'rgba(15,27,45,0.12)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; }
  rrect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fillStyle = mix(base, C.azul, on); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = mix(baseTxt, '#ffffff', on);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  let x = cx - w / 2 + size * 0.7;
  if (icone) { icone(ctx, x + size * 0.38, cy, size * 0.42, ctx.fillStyle); x += iw; }
  ctx.fillText(texto, x, cy + 1);
  ctx.restore();
}
const iCheck = (ctx, x, y, r, cor) => {
  ctx.save(); ctx.strokeStyle = cor; ctx.lineWidth = r * 0.42; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - r * 0.8, y); ctx.lineTo(x - r * 0.2, y + r * 0.6); ctx.lineTo(x + r * 0.9, y - r * 0.6); ctx.stroke(); ctx.restore();
};
const iEstrela = (ctx, x, y, r, cor) => {
  ctx.save(); ctx.fillStyle = cor; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); }
  ctx.closePath(); ctx.fill(); ctx.restore();
};

// ------------------------------------------------------------------ celular com a tela real
const SHOT_W = 1170, SHOT_H = 2532;
// Geometria: tela = largura w; status bar desenhada acima da captura.
function geo(cx, cy, w) {
  const s = w / SHOT_W, status = w * 0.1, sh = SHOT_H * s + status, b = w * 0.032;
  return { cx, cy, w, s, status, sh, b, x: cx - w / 2, y: cy - sh / 2 };
}
// Converte um retângulo da captura em coordenadas do quadro.
function mapa(g, r) { return [g.x + r[0] * g.s, g.y + g.status + r[1] * g.s, r[2] * g.s, r[3] * g.s]; }

function celular(ctx, IMG, g, camadas, { a = 1, corStatus = C.azul } = {}) {
  a = clamp(a);
  if (a <= 0.003) return;
  ctx.save(); ctx.globalAlpha = a;
  const R = g.w * 0.14;
  // corpo + sombra longa
  ctx.shadowColor = 'rgba(10,30,70,0.35)'; ctx.shadowBlur = 90; ctx.shadowOffsetY = 50;
  rrect(ctx, g.x - g.b, g.y - g.b, g.w + 2 * g.b, g.sh + 2 * g.b, R + g.b);
  ctx.fillStyle = '#0d1424'; ctx.fill();
  ctx.shadowColor = 'transparent';
  // aro metálico
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke();
  // tela
  ctx.save();
  rrect(ctx, g.x, g.y, g.w, g.sh, R); ctx.clip();
  ctx.fillStyle = corStatus; ctx.fillRect(g.x, g.y, g.w, g.status + 4);
  for (const c of camadas) {
    if (!c || c.a <= 0.003 || !IMG[c.img]) continue;
    ctx.globalAlpha = a * c.a;
    const dy = c.dy || 0, dx = c.dx || 0, z = c.zoom || 1;
    ctx.save();
    if (z !== 1) { const [fx, fy] = c.foco || [g.cx, g.cy]; ctx.translate(fx, fy); ctx.scale(z, z); ctx.translate(-fx, -fy); }
    ctx.drawImage(IMG[c.img], g.x + dx, g.y + g.status + dy, g.w, SHOT_H * g.s);
    ctx.restore();
  }
  ctx.globalAlpha = a;
  // status bar
  ctx.fillStyle = corStatus; ctx.fillRect(g.x, g.y, g.w, g.status);
  ctx.fillStyle = '#fff'; ctx.font = f(g.w * 0.042, 700); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText('9:41', g.x + g.w * 0.1, g.y + g.status * 0.55);
  // ícones (sinal + bateria)
  const by = g.y + g.status * 0.55;
  for (let i = 0; i < 4; i++) ctx.fillRect(g.x + g.w * 0.74 + i * g.w * 0.016, by + g.w * 0.012 - i * g.w * 0.006, g.w * 0.01, g.w * 0.006 + i * g.w * 0.006);
  ctx.lineWidth = 2; ctx.strokeStyle = '#fff';
  rrect(ctx, g.x + g.w * 0.82, by - g.w * 0.014, g.w * 0.065, g.w * 0.03, 5); ctx.stroke();
  ctx.fillRect(g.x + g.w * 0.825, by - g.w * 0.009, g.w * 0.045, g.w * 0.02);
  // ilha
  rrect(ctx, g.cx - g.w * 0.15, g.y + g.w * 0.025, g.w * 0.3, g.w * 0.075, g.w * 0.04);
  ctx.fillStyle = '#05070c'; ctx.fill();
  ctx.restore();
  // reflexo de vidro
  ctx.save(); rrect(ctx, g.x, g.y, g.w, g.sh, R); ctx.clip();
  const rg = ctx.createLinearGradient(g.x, g.y, g.x + g.w, g.y + g.sh * 0.6);
  rg.addColorStop(0, 'rgba(255,255,255,0.10)'); rg.addColorStop(0.35, 'rgba(255,255,255,0)');
  ctx.fillStyle = rg; ctx.fillRect(g.x, g.y, g.w, g.sh); ctx.restore();
  ctx.restore();
}

// Fragmento: recorte real da tela flutuando à frente do celular (camadas com parallax).
function fragmento(ctx, IMG, img, r, cx, cy, escala, { a = 1, brilho = 0, raio = 30 } = {}) {
  a = clamp(a); brilho = clamp(brilho);
  if (a <= 0.003 || !r || !IMG[img]) return;
  const w = r[2] * escala, h = r[3] * escala;
  ctx.save(); ctx.globalAlpha = a;
  ctx.shadowColor = brilho > 0.01 ? `rgba(18,106,226,${0.6 * brilho})` : 'rgba(10,30,70,0.28)';
  ctx.shadowBlur = brilho > 0.01 ? 60 : 60; ctx.shadowOffsetY = brilho > 0.01 ? 0 : 30;
  rrect(ctx, cx - w / 2, cy - h / 2, w, h, raio); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.save(); rrect(ctx, cx - w / 2, cy - h / 2, w, h, raio); ctx.clip();
  crop(ctx, IMG[img], r, cx - w / 2, cy - h / 2, w, h); ctx.restore();
  if (brilho > 0.01) { ctx.lineWidth = 5; ctx.strokeStyle = `rgba(18,106,226,${brilho})`; rrect(ctx, cx - w / 2, cy - h / 2, w, h, raio); ctx.stroke(); }
  ctx.restore();
}

// Dedo / toque: anda até o alvo com mola, toca, e um anel se expande.
function toque(ctx, t, tTap, de, para, { chega = 0.55, a = 1 } = {}) {
  const t0 = tTap - chega;
  if (t < t0 - 0.05 || a <= 0) return;
  const m = sp(t, t0, SPRING.snappy);
  const x = lerp(de[0], para[0], m), y = lerp(de[1], para[1], m);
  const press = t >= tTap ? 1 - E.outCubic(prog(t, tTap, tTap + 0.25)) * 0 : 0;
  const s = 1 - 0.18 * Math.exp(-((t - tTap) ** 2) / 0.006);
  const sai = fadeOut(t, tTap + 0.9, 0.3);
  ctx.save(); ctx.globalAlpha = a * clamp(m * 2) * sai;
  // anel
  if (t >= tTap) {
    const p = prog(t, tTap, tTap + 0.6);
    ctx.globalAlpha = a * (1 - p) * sai;
    ctx.lineWidth = 6; ctx.strokeStyle = C.azul;
    ctx.beginPath(); ctx.arc(x, y, 40 + 110 * E.outCubic(p), 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = a * clamp(m * 2) * sai;
  }
  ctx.shadowColor = 'rgba(10,30,70,0.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.beginPath(); ctx.arc(x, y, 46 * s * (1 + press * 0), 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 5; ctx.strokeStyle = C.azul; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, 14 * s, 0, Math.PI * 2); ctx.fillStyle = C.azul; ctx.fill();
  ctx.restore();
}

// Partículas com semente (confete / estrelas).
function confete(ctx, t, t0, cx, cy, n = 46, { raio = 520, cores = [C.azul, C.verde, '#f59e0b', '#7aa7ff'], estrela = false } = {}) {
  if (t < t0) return;
  const p = t - t0;
  if (p > 2.2) return;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const ang = hash01(i, 3) * Math.PI * 2, v = 0.45 + hash01(i, 7) * 0.55;
    const d = raio * v * E.outExpo(clamp(p / 1.1));
    const x = cx + Math.cos(ang) * d, y = cy + Math.sin(ang) * d + 260 * p * p * 0.5;
    ctx.globalAlpha = clamp(1.6 - p * 0.9);
    const cor = cores[i % cores.length];
    if (estrela) iEstrela(ctx, x, y, 14 + 10 * hash01(i, 11), cor);
    else {
      ctx.save(); ctx.translate(x, y); ctx.rotate(p * 8 * (hash01(i, 5) - 0.5) + ang);
      ctx.fillStyle = cor; ctx.fillRect(-9, -5, 18, 10); ctx.restore();
    }
  }
  ctx.restore();
}

// Varredura de luz (transição do guia): faixa clara atravessa a tela.
function varredura(ctx, t, t0, d = 0.55) {
  const p = prog(t, t0, t0 + d);
  if (p <= 0 || p >= 1) return;
  ctx.save();
  const x = lerp(-600, W + 600, E.inOutCubic(p));
  const g = ctx.createLinearGradient(x - 300, 0, x + 300, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.translate(W / 2, H / 2); ctx.rotate(-0.25); ctx.translate(-W / 2, -H / 2);
  ctx.fillStyle = g; ctx.fillRect(-600, -400, W + 1200, H + 800);
  ctx.restore();
}

function logo(ctx, cx, cy, largura, cor = '#fff', a = 1) {
  a = clamp(a);
  if (a <= 0.003) return;
  const s = largura / 390;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(cx - largura / 2, cy - (116 * s) / 2); ctx.scale(s, s); ctx.translate(-100, -150);
  ctx.fillStyle = cor; ctx.fill(LOGO); ctx.restore();
}

// ------------------------------------------------------------------ cenas
function cenaGancho(ctx, t) {
  bgClaro(ctx, t);
  const t0 = 0.15;
  titulo(ctx, t, t0, [['Quantas', 'vagas'], ['você', 'já', { w: 'perdeu?', c: C.vermelho }]], { y: 560, size: 118 });
  // cartão de prazo com contagem regressiva até zerar no "prazo"
  const a = sp(t, 0.6, SPRING.bouncy);
  if (a <= 0.001) return;
  const cx = 540, cy = 1160, w = 640, h = 420;
  const rest = Math.max(0, Math.ceil(3 - 3 * prog(t, 1.1, T.prazo + 0.2)));
  const zerou = rest === 0;
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(lerp(0.85, 1, a), lerp(0.85, 1, a)); ctx.rotate(-0.04 + 0.02 * noise1(t, 2));
  if (zerou) ctx.translate(14 * Math.exp(-(t - T.prazo) * 6) * Math.sin((t - T.prazo) * 70), 0);
  ctx.globalAlpha = clamp(a * 1.5);
  ctx.shadowColor = 'rgba(10,30,70,0.2)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 30;
  rrect(ctx, -w / 2, -h / 2, w, h, 44); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
  rrect(ctx, -w / 2, -h / 2, w, 110, 44); ctx.fillStyle = zerou ? C.vermelho : C.azul; ctx.fill();
  ctx.fillRect(-w / 2, -h / 2 + 60, w, 50);
  ctx.fillStyle = '#fff'; ctx.font = f(40, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(zerou ? 'INSCRIÇÕES ENCERRADAS' : 'INSCRIÇÕES ATÉ 20/11', 0, -h / 2 + 58);
  ctx.fillStyle = zerou ? C.vermelho : C.texto; ctx.font = f(190, 900);
  ctx.fillText(String(rest), -90, 50);
  ctx.font = f(54, 700); ctx.fillStyle = C.mudo; ctx.textAlign = 'left';
  ctx.fillText(rest === 1 ? 'dia' : 'dias', 10, 20); ctx.fillText('restantes', 10, 85);
  ctx.restore();
}

// Cartões do caos (problema): e-mail, mural do corredor, grupo da turma.
function cartaoEmail(ctx) {
  rrect(ctx, -300, -150, 600, 300, 34); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.fillStyle = '#e8f0fd'; ctx.beginPath(); ctx.arc(-220, -70, 46, 0, 7); ctx.fill();
  ctx.strokeStyle = C.azul; ctx.lineWidth = 6; ctx.strokeRect(-246, -90, 52, 38);
  ctx.beginPath(); ctx.moveTo(-246, -90); ctx.lineTo(-220, -68); ctx.lineTo(-194, -90); ctx.stroke();
  ctx.fillStyle = C.texto; ctx.font = f(34, 800); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Caixa de entrada', -150, -86);
  ctx.fillStyle = C.mudo; ctx.font = f(26, 600); ctx.fillText('38 não lidos', -150, -46);
  ctx.fillStyle = C.texto2; ctx.font = f(28, 700); ctx.fillText('[Estágio] Vaga Front-End', -250, 30);
  ctx.fillStyle = '#dfe5ee'; rrect(ctx, -250, 66, 470, 18, 9); ctx.fill(); rrect(ctx, -250, 100, 330, 18, 9); ctx.fill();
}
function cartaoMural(ctx) {
  rrect(ctx, -270, -170, 540, 340, 20); ctx.fillStyle = '#b98a5c'; ctx.fill();
  for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(60,30,10,0.15)'; ctx.fillRect(-250 + hash01(i, 2) * 500, -150 + hash01(i, 4) * 300, 5, 5); }
  ctx.save(); ctx.rotate(0.06);
  ctx.fillStyle = '#ffe680'; ctx.fillRect(-150, -110, 300, 240);
  ctx.fillStyle = '#5b4a12'; ctx.font = f(36, 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('VAGA DE', 0, -40); ctx.fillText('ESTÁGIO!', 0, 4);
  ctx.font = f(24, 600); ctx.fillText('procurar o NESP', 0, 64);
  ctx.fillStyle = C.vermelho; ctx.beginPath(); ctx.arc(0, -110, 16, 0, 7); ctx.fill();
  ctx.restore();
}
function cartaoGrupo(ctx) {
  rrect(ctx, -290, -150, 580, 300, 34); ctx.fillStyle = '#eef3f0'; ctx.fill();
  ctx.fillStyle = C.texto; ctx.font = f(30, 800); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Turma GES 2026', -240, -100);
  ctx.fillStyle = '#fff'; rrect(ctx, -250, -60, 420, 70, 26); ctx.fill();
  ctx.fillStyle = C.texto2; ctx.font = f(27, 600); ctx.fillText('alguém viu aquela vaga?', -225, -24);
  ctx.fillStyle = '#d6f5dc'; rrect(ctx, -110, 30, 370, 70, 26); ctx.fill();
  ctx.fillStyle = '#14532d'; ctx.fillText('acho que já fechou...', -85, 66);
}

function cenaProblema(ctx, t) {
  bgNoite(ctx, t);
  const cartas = [
    { t: T.email, x: 470, y: 760, r: -0.08, fn: cartaoEmail },
    { t: T.muralFisico, x: 610, y: 1140, r: 0.07, fn: cartaoMural },
    { t: T.grupo, x: 470, y: 1500, r: -0.05, fn: cartaoGrupo },
  ];
  const fecha = sp(t, T.fechouW, SPRING.snappy);
  if (t > T.fechouW) {
    const k = 22 * Math.exp(-(t - T.fechouW) * 7);
    ctx.translate(k * noise1(t * 40, 1), k * noise1(t * 40, 5));
  }
  cartas.forEach((c, i) => {
    const s = sp(t, c.t - 0.3, SPRING.bouncy);
    if (s <= 0.001) return;
    ctx.save();
    const drift = 14 * noise1(t * 0.6 + i * 3, i + 1);
    ctx.translate(c.x + drift, c.y + (1 - s) * 140 + drift * 0.6);
    ctx.rotate(c.r + 0.04 * noise1(t * 0.4, i + 7));
    ctx.scale(lerp(0.6, 1, s), lerp(0.6, 1, s));
    ctx.globalAlpha = clamp(s * 1.6) * lerp(1, 0.35, fecha);
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 26;
    c.fn(ctx); ctx.restore();
  });
  titulo(ctx, t, T.problema + 0.05, [['Espalhadas'], [{ w: 'por', c: '#9fb6da' }, { w: 'todo', c: '#9fb6da' }, { w: 'lado', c: '#9fb6da' }]], { y: 300, size: 96, cor: '#fff' });
  // carimbo
  if (t >= T.fechouW - 0.05) {
    const s = sp(t, T.fechouW - 0.05, { stiffness: 420, damping: 22 });
    ctx.save(); ctx.translate(540, 1130); ctx.rotate(-0.18); const k = lerp(2.4, 1, s); ctx.scale(k, k);
    ctx.globalAlpha = clamp(s * 2);
    ctx.lineWidth = 12; ctx.strokeStyle = C.vermelho; rrect(ctx, -400, -95, 800, 190, 26); ctx.stroke();
    ctx.lineWidth = 4; rrect(ctx, -380, -75, 760, 150, 18); ctx.stroke();
    ctx.fillStyle = C.vermelho; ctx.font = f(70, 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('INSCRIÇÃO ENCERRADA', 0, 4); ctx.restore();
  }
}

function cenaVirada(ctx, t, IMG) {
  bgAzul(ctx, t);
  logo(ctx, 540, 200, 240, '#fff', fadeIn(t, T.virada + 0.1, 0.4));
  titulo(ctx, t, T.viradaMural, [['Mural', 'de', 'Vagas'], [{ w: 'NESP', c: '#bcd5ff' }]], { y: 470, size: 120, cor: '#fff' });
  pilula(ctx, 'dentro do App Inatel', 540, 790, { size: 38, on: 0, a: fadeIn(t, T.aplicativo - 0.1), base: '#ffffff', baseTxt: C.azul });
  const s = sp(t, T.aplicativo - 0.25, SPRING.gentle);
  const g = geo(540, lerp(2300, 1520, s), 640);
  celular(ctx, IMG, g, [{ img: 'home', a: 1 }], { a: clamp(s * 3) });
}

function cenaAlerta(ctx, t, IMG) {
  bgClaro(ctx, t);
  const t0 = T.alerta;
  // câmera: celular sobe da cena anterior e assenta
  const s = sp(t, t0 - 0.1, SPRING.gentle);
  const g = geo(540, lerp(1520, 1150, s), lerp(640, 600, s));
  // contador "0 → 4" no título
  celular(ctx, IMG, g, [{ img: 'home', a: 1 }]);
  vinhetaTopo(ctx, 400);
  pilula(ctx, 'Alerta push do NESP', 540, 230, { size: 38, on: 0, a: fadeIn(t, t0 + 0.1) * fadeOut(t, T.quatro - 0.05, 0.2), icone: iEstrela });
  const tq = T.quatro - 0.08, base = Math.min(t0 + 0.1, tq - 0.4);
  titulo(ctx, t, t0, [[{ w: '4', c: C.azul }, 'vagas', 'para'], ['o', 'seu', 'perfil']],
    { y: 210, size: 92, tempos: [tq, tq + 0.06, tq + 0.12, tq + 0.18, tq + 0.24, tq + 0.3].map((x, i) => (i === 0 ? x : Math.max(base, x))) });
  // push banner deslizando do topo da tela (NotificacaoPush)
  const pb = sp(t, T.avisa - 0.35, SPRING.snappy) * fadeOut(t, T.quatro + 0.25, 0.3);
  if (pb > 0.002) {
    const bx = g.x + 20, bw = g.w - 40, by = lerp(g.y - 160, g.y + g.status + 14, pb);
    ctx.save(); ctx.globalAlpha = clamp(pb * 2);
    ctx.shadowColor = 'rgba(10,30,70,0.3)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
    rrect(ctx, bx, by, bw, 128, 32); ctx.fillStyle = 'rgba(255,255,255,0.97)'; ctx.fill(); ctx.shadowColor = 'transparent';
    rrect(ctx, bx + 20, by + 24, 80, 80, 20); ctx.fillStyle = C.azul; ctx.fill();
    logo(ctx, bx + 60, by + 64, 64, '#fff');
    ctx.fillStyle = C.texto; ctx.font = f(28, 800); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('NESP Inatel', bx + 120, by + 46);
    ctx.fillStyle = C.texto2; ctx.font = f(26, 600); ctx.fillText('4 novas vagas • prazo em 8 dias', bx + 120, by + 86);
    ctx.fillStyle = C.mudo; ctx.font = f(22, 600); ctx.textAlign = 'right'; ctx.fillText('agora', bx + bw - 24, by + 46);
    ctx.restore();
  }
  // fragmento do alerta real saindo da tela
  const r = TELAS.home.alerta;
  const fs = sp(t, T.quatro - 0.15, SPRING.bouncy);
  const [rx, ry, rw, rh] = mapa(g, r);
  const ox = rx + rw / 2, oy = ry + rh / 2;
  fragmento(ctx, IMG, 'home', r, lerp(ox, 540, fs), lerp(oy, 700, fs), lerp(g.s, 0.86, fs), { a: clamp(fs * 3), brilho: 0.8 * fs * (0.6 + 0.4 * Math.sin((t - T.quatro) * 6)) });
}

function cenaFiltro(ctx, t, IMG) {
  bgClaro(ctx, t);
  const t0 = T.filtro;
  const g = geo(540, 1230, 600);
  const troca = fadeIn(t, t0, 0.35);
  celular(ctx, IMG, g, [{ img: 'home', a: 1 - troca }, { img: 'mural', a: troca, dy: 60 * (1 - troca) }]);
  vinhetaTopo(ctx, 560);
  titulo(ctx, t, t0 + 0.05, [['Filtra', { w: 'sozinho', c: C.azul }]], { y: 210, size: 100 });
  // pílulas grandes acendendo na palavra
  const p1 = sp(t, T.curso - 0.1, SPRING.bouncy), p2 = sp(t, T.periodo - 0.1, SPRING.bouncy);
  pilula(ctx, 'Engenharia de Software', 540, 340, { size: 40, on: clamp(p1), a: clamp(fadeIn(t, t0 + 0.2) * 1), icone: iCheck });
  pilula(ctx, '6º período', 540, 470, { size: 40, on: clamp(p2), a: clamp(fadeIn(t, t0 + 0.35)), icone: iCheck });
  // fragmento dos chips reais + card compatível
  const rc = TELAS.mural.chips, [cx0, cy0, cw, ch] = mapa(g, rc);
  const fc = sp(t, T.curso, SPRING.gentle);
  fragmento(ctx, IMG, 'mural', rc, lerp(cx0 + cw / 2, 560, fc), lerp(cy0 + ch / 2, 640, fc), lerp(g.s, 0.82, fc), { a: clamp(fc * 3), raio: 50 });
  const rk = TELAS.mural.card1, [kx, ky, kw, kh] = mapa(g, rk);
  const fk = sp(t, T.periodo + 0.15, SPRING.gentle);
  fragmento(ctx, IMG, 'mural', rk, lerp(kx + kw / 2, 560, fk) + 8 * noise1(t, 3), lerp(ky + kh / 2, 1380, fk), lerp(g.s, 0.78, fk), { a: clamp(fk * 3), brilho: 0.5 * fk });
}

function cenaVaga(ctx, t, IMG) {
  bgClaro(ctx, t);
  const t0 = T.vaga;
  const tTap = t0 + 0.45;
  // celular: mural → toque no card → detalhe; depois desliza para a esquerda
  const lado = sp(t, T.bolsa - 0.3, SPRING.gentle);
  const g = geo(lerp(540, 330, lado), lerp(1230, 1240, lado), lerp(600, 520, lado));
  const card = mapa(g, TELAS.mural.card1);
  const abre = E.inOutCubic(prog(t, tTap + 0.12, tTap + 0.34));
  const sc = 1 + 0.18 * E.inCubic(prog(t, tTap + 0.05, tTap + 0.34));
  celular(ctx, IMG, g, [
    { img: 'mural', a: 1 - abre, zoom: sc, foco: [card[0] + card[2] / 2, card[1] + card[3] / 2] },
    { img: 'detalhe', a: abre, zoom: lerp(1.08, 1, abre), foco: [card[0] + card[2] / 2, card[1] + card[3] / 2] },
  ]);
  toque(ctx, t, tTap, [900, 1700], [card[0] + card[2] * 0.4, card[1] + card[3] * 0.4]);
  // título com as três palavras acendendo
  const on = (tw) => clamp(sp(t, tw - 0.08, SPRING.snappy));
  const a = fadeIn(t, t0 + 0.1);
  pilula(ctx, 'Bolsa', 250, 260, { size: 40, on: on(T.bolsa), a });
  pilula(ctx, 'Requisitos', 540, 260, { size: 40, on: on(T.requisitos), a });
  pilula(ctx, 'Benefícios', 840, 260, { size: 40, on: on(T.beneficios), a });
  // fragmentos reais em pilha à direita
  const fr = [
    ['detalhe', TELAS.detalhe.fatos, T.bolsa, 690, 0.62],
    ['detalhe2', TELAS.detalhe2.requisitos, T.requisitos, 1050, 0.58],
    ['detalhe2', TELAS.detalhe2.beneficios, T.beneficios, 1430, 0.58],
  ];
  fr.forEach(([img, r, tw, y, e], i) => {
    const s = sp(t, tw - 0.12, SPRING.bouncy);
    fragmento(ctx, IMG, img, r, lerp(1300, 720, s) + 6 * noise1(t * 0.8, i), y + 6 * noise1(t * 0.7, i + 4), e, { a: clamp(s * 2), brilho: 0.7 * Math.exp(-Math.max(0, t - tw) * 2.2) * (t > tw ? 1 : 0) });
  });
}

function cenaSalvar(ctx, t, IMG) {
  bgClaro(ctx, t);
  const t0 = T.salvar;
  const s = sp(t, t0 - 0.05, SPRING.gentle);
  const g = geo(540, lerp(1240, 1290, s), lerp(520, 600, s));
  const rf = mapa(g, TELAS.detalhe.favoritar);
  const tTap = T.salve + 0.05;
  const fav = t >= tTap ? 1 : 0;
  // zoom de câmera no botão favoritar
  const z = 1 + 0.16 * E.inOutCubic(prog(t, t0 + 0.2, tTap)) * fadeOut(t, T.depois + 0.3, 0.6);
  ctx.save();
  ctx.translate(rf[0] + rf[2] / 2, rf[1]); ctx.scale(z, z); ctx.translate(-(rf[0] + rf[2] / 2), -rf[1]);
  celular(ctx, IMG, g, [{ img: 'detalhe', a: 1 - fav }, { img: 'detalhe_fav', a: fav }]);
  toque(ctx, t, tTap, [900, 1900], [rf[0] + rf[2] / 2, rf[1] + rf[3] / 2]);
  confete(ctx, t, tTap, rf[0] + rf[2] / 2, rf[1] + rf[3] / 2, 18, { raio: 220, estrela: true, cores: ['#f59e0b', '#fbbf24', C.azul] });
  ctx.restore();
  vinhetaTopo(ctx);
  titulo(ctx, t, t0 + 0.05, [['Salve', 'para'], [{ w: 'decidir', c: C.azul }, { w: 'depois', c: C.azul }]], { y: 210, size: 96 });
  pilula(ctx, 'Salva nos favoritos', 540, 1650, { size: 38, on: 1, a: sp(t, T.favoritos - 0.1, SPRING.bouncy) * fadeOut(t, T.candidatar + 0.2), icone: iEstrela });
}

function cenaCandidatar(ctx, t, IMG) {
  bgClaro(ctx, t);
  const t0 = T.candidatar;
  const g = geo(540, 1170, 600);
  const rc = mapa(g, TELAS.detalhe_fav.candidatar);
  const tTap = t0 + 0.45;
  const sheet = E.outCubic(prog(t, tTap + 0.05, tTap + 0.5));
  celular(ctx, IMG, g, [{ img: 'detalhe_fav', a: 1 - sheet }, { img: 'modal', a: sheet, dy: 380 * (1 - sheet) }]);
  toque(ctx, t, tTap, [880, 1880], [rc[0] + rc[2] / 2, rc[1] + rc[3] / 2]);
  vinhetaTopo(ctx);
  titulo(ctx, t, t0 + 0.05, [['Currículo', { w: 'padrão', c: C.azul }], ['já', 'no', 'perfil']], { y: 210, size: 92 });
  const r = TELAS.modal.curriculo, [x, y, w, h] = mapa(g, r);
  const fs = sp(t, T.curriculo - 0.1, SPRING.bouncy);
  fragmento(ctx, IMG, 'modal', r, lerp(x + w / 2, 540, fs), lerp(y + h / 2, 1460, fs), lerp(g.s, 0.82, fs), { a: clamp(fs * 3) * sheet, brilho: 0.9 * fs, raio: 40 });
  pilula(ctx, '1 toque', 540, 1630, { size: 36, on: 1, a: clamp(sp(t, T.curriculo + 0.25, SPRING.bouncy)) });
}

function cenaToque(ctx, t, IMG) {
  const t0 = T.toque;
  const fim = T.enviada - 0.15;
  const flash = prog(t, fim, fim + 0.35);
  bgClaro(ctx, t);
  if (flash > 0) { ctx.save(); ctx.globalAlpha = 0.9 * flash; bgAzul(ctx, t); ctx.restore(); }
  const g = geo(540, lerp(1170, 1300, flash), lerp(600, 560, flash));
  const rc = mapa(g, TELAS.modal.confirmar);
  const tTap = T.toqueW + 0.05;
  const ok = E.outCubic(prog(t, tTap + 0.35, tTap + 0.7));
  celular(ctx, IMG, g, [{ img: 'modal', a: 1 - ok }, { img: 'sucesso', a: ok }]);
  // botão "carregando" entre o toque e o sucesso
  if (t > tTap && ok < 1) {
    ctx.save(); ctx.globalAlpha = 1 - ok; rrect(ctx, rc[0], rc[1], rc[2], rc[3], 14); ctx.fillStyle = C.azulForte; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(rc[0] + rc[2] / 2, rc[1] + rc[3] / 2, 16, (t - tTap) * 10, (t - tTap) * 10 + 4.4); ctx.stroke(); ctx.restore();
  }
  toque(ctx, t, tTap, [900, 1880], [rc[0] + rc[2] / 2, rc[1] + rc[3] / 2]);
  titulo(ctx, t, t0 + 0.05, [['Um', { w: 'toque', c: C.azul }, 'e', 'pronto']], { y: 230, size: 96, sai: fim + 0.2 });
  // grande check + título de sucesso
  const ck = sp(t, T.enviada - 0.1, SPRING.bouncy);
  if (ck > 0.001) {
    ctx.save(); ctx.translate(540, 360); ctx.scale(ck, ck);
    ctx.shadowColor = 'rgba(18,161,80,0.5)'; ctx.shadowBlur = 50;
    ctx.beginPath(); ctx.arc(0, 0, 110, 0, 7); ctx.fillStyle = C.verde; ctx.fill(); ctx.shadowColor = 'transparent';
    iCheck(ctx, 0, 0, 62, '#fff'); ctx.restore();
  }
  titulo(ctx, t, T.enviada, [['Candidatura', 'enviada!']], { y: 570, size: 84, cor: '#fff' });
  confete(ctx, t, T.enviada - 0.05, 540, 400, 60, { raio: 640 });
  const r = TELAS.sucesso.protocolo, fs = sp(t, T.protocolo - 0.1, SPRING.bouncy);
  const [x, y, w, h] = mapa(g, r);
  fragmento(ctx, IMG, 'sucesso', r, lerp(x + w / 2, 540, fs), lerp(y + h / 2, 1560, fs), lerp(g.s, 0.88, fs), { a: clamp(fs * 3), brilho: 0.7 * fs });
}

function cenaMinhas(ctx, t, IMG) {
  bgClaro(ctx, t);
  const t0 = T.minhas;
  const g = geo(540, 1300, 580);
  const e2 = t >= T.analise - 0.05 ? 1 : 0, e3 = t >= T.entrevista - 0.05 ? 1 : 0;
  const img = e3 ? 'minhas3' : e2 ? 'minhas2' : 'minhas';
  const ent = sp(t, t0 - 0.05, SPRING.gentle);
  celular(ctx, IMG, geo(540, lerp(1500, g.cy, ent), g.w), [{ img, a: 1 }]);
  vinhetaTopo(ctx, 420);
  titulo(ctx, t, t0 + 0.05, [['Acompanhe', 'cada'], [{ w: 'etapa', c: C.azul }]], { y: 200, size: 96 });
  // linha do tempo real ampliada à frente do celular
  const r = TELAS[img].timeline;
  const fs = sp(t, T.enviado - 0.25, SPRING.gentle);
  const pulso = (tw) => Math.exp(-Math.max(0, t - tw) * 3) * (t >= tw ? 1 : 0);
  const brilho = Math.max(pulso(T.enviado), pulso(T.analise), pulso(T.entrevista));
  fragmento(ctx, IMG, img, r, 540, lerp(1300, 640, fs), lerp(0.5, 0.98, fs), { a: clamp(fs * 3), brilho: 0.4 + 0.6 * brilho, raio: 36 });
  if (e3) confete(ctx, t, T.entrevista, 540, 640, 40, { raio: 500 });
}

function cenaCTA(ctx, t, IMG) {
  bgAzul(ctx, t);
  const t0 = T.cta;
  // três telas em leque atrás (prova do fluxo completo)
  const telas = ['mural', 'sucesso', 'minhas3'];
  telas.forEach((k, i) => {
    const s = sp(t, t0 + 0.1 + i * 0.12, SPRING.gentle);
    const ang = (i - 1) * 0.16 * s;
    const g = geo(540 + (i - 1) * 300 * s, 1430 + Math.abs(i - 1) * 60, 400);
    ctx.save(); ctx.translate(g.cx, g.cy); ctx.rotate(ang); ctx.translate(-g.cx, -g.cy - (1 - s) * 500);
    celular(ctx, IMG, g, [{ img: k, a: 1 }], { a: clamp(s * 2) * (i === 1 ? 1 : 0.92) });
    ctx.restore();
  });
  const ls = sp(t, t0 + 0.05, SPRING.bouncy);
  logo(ctx, 540, 300, lerp(200, 380, ls), '#fff', clamp(ls * 2));
  titulo(ctx, t, T.cta + 0.3, [['Mural', 'de', 'Vagas'], [{ w: 'NESP', c: '#bcd5ff' }]], { y: 560, size: 104, cor: '#fff' });
  pilula(ctx, 'Seu estágio começa no App Inatel', 540, 860, { size: 36, on: 0, a: sp(t, T.ctaComeca - 0.1, SPRING.bouncy) });
  varredura(ctx, t, t0 + 0.25, 0.8);
}

// ------------------------------------------------------------------ montagem
const CENAS = [
  ['gancho', 'problema', cenaGancho],
  ['problema', 'virada', cenaProblema],
  ['virada', 'alerta', cenaVirada],
  ['alerta', 'filtro', cenaAlerta],
  ['filtro', 'vaga', cenaFiltro],
  ['vaga', 'salvar', cenaVaga],
  ['salvar', 'candidatar', cenaSalvar],
  ['candidatar', 'toque', cenaCandidatar],
  ['toque', 'minhas', cenaToque],
  ['minhas', 'cta', cenaMinhas],
  ['cta', 'dur', cenaCTA],
];
const XF = 0.28; // duração do cruzamento entre cenas

export function draw(ctx, t, IMG) {
  ctx.save();
  ctx.fillStyle = C.fundo; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < CENAS.length; i++) {
    const [a, b, fn] = CENAS[i];
    const t0 = T[a], t1 = T[b];
    if (t < t0 || t >= t1 + XF) continue;
    const entrada = i === 0 ? 1 : E.outCubic(prog(t, t0, t0 + XF));
    ctx.save();
    if (entrada < 1) {
      // zoom de entrada: a cena nova já aparece no primeiro quadro do corte
      ctx.globalAlpha = entrada;
      const z = lerp(1.06, 1, entrada);
      ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    }
    fn(ctx, t, IMG);
    ctx.restore();
  }
  // virada com varredura de luz
  varredura(ctx, t, T.virada - 0.1, 0.6);
  ctx.restore();
}
