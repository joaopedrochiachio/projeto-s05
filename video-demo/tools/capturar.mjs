// Captura as telas reais do App Inatel (build de produção) para o filme.
// uso: node video-demo/tools/capturar.mjs [url-base]
// Grava video-demo/app/<tela>.png (1170×2532, iPhone @3x) e video-demo/app/telas.json com os
// retângulos (em px da captura) dos elementos que viram fragmentos no filme.
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Playwright local ou global (NODE_PATH=$(npm root -g)).
const { chromium } = createRequire(import.meta.url)('playwright');

const BASE = process.argv[2] || 'http://localhost:3100';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'app');
const DPR = 3;
mkdirSync(OUT, { recursive: true });

const telas = {};
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: DPR, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
const espera = (ms) => p.waitForTimeout(ms);

async function rect(loc) {
  const bb = await loc.first().boundingBox();
  if (!bb) return null;
  return [bb.x, bb.y, bb.width, bb.height].map((v) => Math.round(v * DPR));
}
async function shot(nome, alvos = {}) {
  await espera(450);
  await p.screenshot({ path: join(OUT, `${nome}.png`) });
  const r = {};
  for (const [k, loc] of Object.entries(alvos)) r[k] = await rect(loc);
  telas[nome] = r;
  console.log('✓', nome, Object.keys(r).join(', '));
}
const visivel = (sel) => p.locator(sel).filter({ visible: true });

// --- login com a persona da documentação
await p.goto(BASE + '/', { waitUntil: 'networkidle' });
await espera(500);
await shot('login', { card: p.locator('main .shadow-xl') });
await p.getByRole('button', { name: /Outro Usuário/ }).click();
await p.fill('#login-nome', 'Lucas Estagiário');
await p.selectOption('#login-curso', 'GES');
await p.fill('#login-matricula', '853');
await p.selectOption('#login-periodo', '6');
await p.getByRole('button', { name: /Entrar e Salvar Perfil/ }).click();
await p.waitForURL(BASE + '/');
await espera(5200); // deixa o toast de boas-vindas sumir

// --- 01 Home
const banner = p.locator('section[aria-label="Resumo do aluno"]');
await shot('home', {
  banner,
  alerta: banner.locator('a').first(),
  stats: banner.locator(':scope > div.relative > div').last(),
  sino: p.getByRole('button', { name: 'Notificações' }),
});

// --- 03 Mural
await p.goto(BASE + '/vagas', { waitUntil: 'networkidle' });
await espera(600);
await shot('mural', {
  abas: p.locator('nav[aria-label="Seções do Mural NESP"]'),
  busca: p.locator('#vaga-search-input'),
  chips: p.locator('section[aria-label="Filtros de vagas"] > div').nth(1),
  card1: p.locator('article').nth(0),
  card2: p.locator('article').nth(1),
});

// --- 04 Detalhe
await p.goto(BASE + '/vagas/1', { waitUntil: 'networkidle' });
await espera(700);
await shot('detalhe', {
  hero: p.locator('section.card').first(),
  fatos: p.locator('dl').first(),
  favoritar: visivel('button[aria-label="Salvar nos favoritos"]'),
  candidatar: visivel('button:has-text("Candidatar-se agora")'),
});
await p.locator('h2:text("Requisitos")').scrollIntoViewIfNeeded();
await p.evaluate(() => {
  const h = [...document.querySelectorAll('h2')].find((e) => e.textContent === 'Requisitos');
  window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 70);
});
await shot('detalhe2', {
  requisitos: p.locator('section:has(> h2:text("Requisitos"))'),
  beneficios: p.locator('section:has(> h2:text("Benefícios"))'),
});
await p.evaluate(() => window.scrollTo(0, 0));
await visivel('button[aria-label="Salvar nos favoritos"]').first().click();
await espera(5200);
await shot('detalhe_fav', {
  favoritar: visivel('button[aria-label="Remover dos favoritos"]'),
  candidatar: visivel('button:has-text("Candidatar-se agora")'),
});

// --- 05 Favoritas
await p.goto(BASE + '/vagas?tab=favoritas', { waitUntil: 'networkidle' });
await espera(600);
await shot('favoritas', { abas: p.locator('nav[aria-label="Seções do Mural NESP"]'), card1: p.locator('article').nth(0) });

// --- 06 Enviar currículo
await p.goto(BASE + '/vagas/1', { waitUntil: 'networkidle' });
await espera(600);
await visivel('button:has-text("Candidatar-se agora")').first().click();
await espera(700);
const dlg = p.locator('[role=dialog]');
await shot('modal', {
  dialog: dlg,
  etapas: dlg.locator('ol'),
  curriculo: dlg.locator('button:has-text("1 toque")'),
  confirmar: dlg.getByRole('button', { name: /Confirmar envio/ }),
});

// --- 07 Feedback
await dlg.getByRole('button', { name: /Confirmar envio/ }).click();
await espera(5200); // espera o toast sumir para a tela ficar limpa
await shot('sucesso', {
  dialog: dlg,
  check: dlg.locator('.animate-pop').first(),
  protocolo: dlg.locator('dl'),
  ver: dlg.getByRole('link', { name: /Ver em Minhas Vagas/ }),
});

// --- 08 Minhas vagas (três estados)
await p.goto(BASE + '/minhas-vagas', { waitUntil: 'networkidle' });
await espera(800);
const alvosMinhas = () => ({
  card: p.locator('article').first(),
  timeline: p.locator('ol[aria-label="Andamento"]').first(),
  resumo: p.locator('section[aria-label="Candidaturas"] > div.card').first(),
});
await shot('minhas', alvosMinhas());
for (const nome of ['minhas2', 'minhas3']) {
  await p.getByRole('button', { name: /Simular NESP/ }).first().click();
  await espera(5200);
  await shot(nome, alvosMinhas());
}

writeFileSync(join(OUT, 'telas.json'), JSON.stringify({ dpr: DPR, w: 390 * DPR, h: 844 * DPR, telas }, null, 1));
await b.close();
