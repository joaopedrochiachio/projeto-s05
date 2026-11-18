// Exporta os tempos das cenas e a lista de efeitos (HITS) do filme para o som.
// uso: NODE_PATH=$(npm root -g) node promo/tools/hits.mjs <url-do-index>
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
const DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch();
const p = await b.newPage();
await p.goto(process.argv[2] + '?render=1', { waitUntil: 'networkidle' });
await p.waitForFunction(() => window.filmReady);
const dados = await p.evaluate(() => ({ dur: window.DURATION, T: window.TEMPOS, hits: window.HITS }));
writeFileSync(join(DIR, 'hits.json'), JSON.stringify(dados, null, 1));
console.log(`hits.json: ${dados.hits.length} efeitos, ${dados.dur}s`);
await b.close();
