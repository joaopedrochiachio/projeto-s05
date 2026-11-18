// Quais telas do Wallet AI o Reel usa e onde estão os elementos que o filme anima.
// Chamado por vitrine-wallet.mjs (que monta o app real com dados de demonstração).
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function capturar({ page, abrir, saida, dpr }) {
  const telas = {};
  const rect = async (loc) => {
    const bb = await loc.boundingBox();
    return bb ? [bb.x, bb.y, bb.width, bb.height].map((v) => Math.round(v * dpr)) : null;
  };
  const foto = async (nome, alvos = {}) => {
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(saida, `${nome}.jpg`), type: 'jpeg', quality: 88 });
    telas[nome] = {};
    for (const [k, loc] of Object.entries(alvos)) telas[nome][k] = await rect(loc);
    console.log('✓', nome, JSON.stringify(telas[nome]));
  };
  // o menor elemento que contém todos os textos (o último na ordem do documento é o mais interno)
  const menor = (...textos) => page.locator(textos.map((t) => `:has-text("${t}")`).join('')).filter({ visible: true }).last();

  await abrir('/dashboard');
  await foto('inicio');
  // a variação "outra cor" usa o modo escuro real do app
  await page.evaluate(() => document.documentElement.classList.add('theme-dark'));
  await foto('inicio_escuro');

  await abrir('/transactions');
  const linha = menor('iFood', '68,90');
  await foto('lista', { alvo: linha });

  await linha.click();
  await page.waitForTimeout(900);
  await foto('detalhe');

  await abrir('/goals');
  await foto('insight', { destaque: menor('Viagem para o Japão', 'Aportar') });

  await writeFile(path.join(saida, 'telas.json'), JSON.stringify({ dpr, w: 390 * dpr, h: 844 * dpr, telas }, null, 1));
}
