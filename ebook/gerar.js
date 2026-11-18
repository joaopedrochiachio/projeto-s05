// Gera o PDF do ebook a partir de ebook.html (Chromium/Playwright).
// uso: node ebook/gerar.js   (com NODE_PATH apontando para o Playwright global, se preciso)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.join(__dirname, 'ebook.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  // confere estouro de conteúdo por página
  const estouros = await p.evaluate(() => [...document.querySelectorAll('.pg')].map((pg, i) => {
    const lim = pg.getBoundingClientRect().bottom - 18 * 3.78; // acima do rodapé
    const fundo = Math.max(...[...pg.querySelectorAll(':scope > *:not(.rodape):not(.brilho)')].map((e) => e.getBoundingClientRect().bottom));
    return fundo > lim ? `página ${i + 1}: ${Math.round(fundo - lim)}px além` : null;
  }).filter(Boolean));
  console.log(estouros.length ? 'ESTOURO: ' + estouros.join('; ') : 'sem estouro');
  await p.pdf({ path: path.join(__dirname, 'Reels-em-Codigo-ebook.pdf'), format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await b.close();
})();
