// Vitrine do Wallet AI: renderiza as telas REAIS do app (AppShell + páginas) com dados de demonstração,
// sem Firebase e sem rede, no mesmo esquema dos testes e2e do próprio Wallet (e2e/helpers/buildFixture.ts).
// uso:  cd <wallet-app> && NODE_PATH=$(npm root -g) node <projeto-s05>/promo/tools/vitrine-wallet.mjs [explorar]
//   explorar → um print de cada rota em promo/assets/explorar/
//   (padrão) → as telas do Reel em promo/assets/*.jpg + promo/assets/telas.json
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const PROMO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const requireWallet = createRequire(path.join(ROOT, 'package.json'));
const { chromium } = createRequire(import.meta.url)('playwright');
const file = (name) => JSON.stringify(path.join(ROOT, name).replaceAll('\\', '/'));

const PAGES = {
  '/dashboard': 'app/dashboard/page.tsx', '/transactions': 'app/transactions/page.tsx', '/planning': 'app/planning/page.tsx',
  '/cards': 'app/cards/page.tsx', '/goals': 'app/goals/page.tsx', '/profile': 'app/profile/page.tsx', '/ai': 'app/ai/page.tsx',
};

// Dados de demonstração: persona fictícia, valores plausíveis.
const WALLET_MOCK = `
import React from "react";
const now = new Date();
const iso = (d, h = 12) => new Date(now.getFullYear(), now.getMonth(), d, h).toISOString();
const scheme = (g, accent) => ({ gradient: g, border: "border-white/10", accent, badgeText: "Pass", chipGradient: "from-zinc-300 to-zinc-500" });
const cards = [
  { id: "conta", name: "Conta Itaú", brand: "Itaú", type: "checking", openingBalance: 12480.35, balance: 12480.35, limit: 0, spent: 0, colorScheme: scheme("from-zinc-800 to-zinc-950", "#111") },
  { id: "nubank", name: "Nubank Ultravioleta", brand: "Mastercard", type: "credit", limit: 14000, spent: 2874.6, closingDay: 28, dueDay: 5, colorScheme: scheme("from-violet-600 to-indigo-900", "#6d28d9") },
  { id: "inter", name: "Inter Black", brand: "Mastercard", type: "credit", limit: 9000, spent: 1135.2, closingDay: 10, dueDay: 17, colorScheme: scheme("from-orange-500 to-amber-700", "#ea580c") },
  { id: "xp", name: "XP Visa Infinite", brand: "Visa", type: "credit", limit: 20000, spent: 640.0, closingDay: 2, dueDay: 9, colorScheme: scheme("from-slate-700 to-slate-950", "#0f172a") },
];
const base = [
  ["Salário", 9800, "receita", "Salário / Extra", "conta", 5],
  ["iFood", 68.9, "despesa", "Alimentação & Delivery", "nubank", 14],
  ["Uber", 23.4, "despesa", "Transporte & Combustível", "nubank", 14],
  ["Pão de Açúcar", 412.37, "despesa", "Alimentação & Delivery", "inter", 13],
  ["Spotify", 21.9, "despesa", "Assinaturas", "nubank", 12],
  ["Drogasil", 57.8, "despesa", "Saúde & Bem-estar", "inter", 11],
  ["Academia Smart Fit", 129.9, "despesa", "Saúde & Bem-estar", "conta", 10],
  ["Aluguel", 2350, "despesa", "Moradia & Contas", "conta", 10],
  ["Cinema Kinoplex", 64.0, "despesa", "Lazer", "xp", 9],
  ["Posto Shell", 210.0, "despesa", "Transporte & Combustível", "xp", 8],
  ["Freelance UI", 1800, "receita", "Salário / Extra", "conta", 7],
  ["Amazon", 189.9, "despesa", "Compras", "nubank", 6],
];
const nome = (id) => cards.find((c) => c.id === id).name;
const transactions = base.map(([title, amount, type, category, cardId, d], i) => ({
  id: "tx-" + i, title, amount, type, category, account: nome(cardId), cardId, kind: "regular", date: iso(d, 9 + (i % 9)), occurredAt: iso(d, 9 + (i % 9)),
}));
const recurringItems = [
  { id: "aluguel", title: "Aluguel", amount: 2350, type: "expense", account: "Conta Itaú", cardId: "conta", category: "Moradia & Contas", dueDay: 10, active: true, startYear: now.getFullYear(), startMonth: now.getMonth() },
  { id: "salario", title: "Salário", amount: 9800, type: "income", account: "Conta Itaú", cardId: "conta", category: "Salário / Extra", dueDay: 5, recurrenceType: "business_day_5", active: true, startYear: now.getFullYear(), startMonth: now.getMonth() },
  { id: "iphone", title: "iPhone 17", amount: 549.9, type: "expense", account: "Nubank Ultravioleta", cardId: "nubank", category: "Tecnologia", dueDay: 5, installmentsCount: 12, active: true, startYear: now.getFullYear(), startMonth: now.getMonth() },
];
const goals = [
  { id: "japao", title: "Viagem para o Japão", category: "Lazer", current: 8400, target: 20000, deadline: now.getFullYear() + 1 + "-06-15" },
  { id: "reserva", title: "Reserva de emergência", category: "Segurança", current: 15200, target: 30000 },
];
const userProfile = { name: "Marina Costa", email: "marina@exemplo.com", role: "", avatarInitials: "MC", monthlyIncomeBase: 9800, currency: "BRL", persona: "optimizer", riskTolerance: "moderate", aiTone: "direct", maxCommitmentAlertPercent: 60, primaryFocus: "Viagem", targetMonthEndBalance: 3000, isOnboarded: true, categoryBudgets: [{ id: "b1", category: "Alimentação & Delivery", amount: 1200, alertPercent: 80 }, { id: "b2", category: "Lazer", amount: 400, alertPercent: 80 }] };
const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
function getMonthlyProjection(index = 0) {
  const d = new Date(now.getFullYear(), now.getMonth() + index, 1);
  return { monthName: monthNames[d.getMonth()], year: d.getFullYear(), baseIncome: 9800, plannedIncomesTotal: 11600, projectedIncome: 11600, recurringDebitTotal: 2350, recurringCreditTotal: 549.9, cardInstallments: 549.9, totalCommitted: 2899.9, actualIncomeTotal: 11600, actualOutflowTotal: 3577.86, balanceReconciliationTotal: 0, pendingCommitted: 0, projectedFreeBalance: 7230.4, openingBalance: 12480.35, actualClosingBalance: 15852.15, cardInvoices: cards.filter(c => c.type === "credit").map(c => ({ cardId: c.id, cardName: c.name, dueDay: c.dueDay, closingDay: c.closingDay, installmentsAmount: c.id === "nubank" ? 549.9 : 0, recurringAmount: 0, totalInvoice: c.spent, paidAmount: 0, pendingInvoice: c.spent, isPaid: false, recurringItems: [], transactions: transactions.filter(t => t.cardId === c.id), invoicePeriodKey: d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"), invoiceDueMonthName: monthNames[d.getMonth()] })), totalInvoicesScheduled: 4649.8, totalInvoicesPending: 4649.8, totalInvoicesPaid: 0, monthNetSurplus: 4372.2 };
}
const noop = async () => {};
const wallet = {
  userProfile, cards, activeCardId: "nubank", activeCard: cards[1], transactions, recurringItems, goals, isDataLoaded: true,
  mainBalance: 12480.35, totalInvoices: 4649.8, monthIncome: 11600, monthExpense: 3577.86,
  accountOptions: cards.map(c => c.name),
  selectCard(){}, updateCardLimit(){}, updateCardBillingCycle: noop, addCard: (c) => ({ ...c, id: "new", spent: 0 }), deleteCard(){},
  updateUserProfile(){}, saveCategoryBudgets: noop, addTransaction: noop, reconcileCheckingBalance: async () => 0,
  updateTransaction: noop, payInvoice: noop, unpayInvoice: noop, deleteTransaction: noop, addRecurringItem: noop,
  updateRecurringItem: noop, updateRecurringItemOccurrence: noop, deleteRecurringItemOccurrence: noop, toggleRecurringItem: noop,
  deleteRecurringItem: noop, realizeRecurringItemNow: noop, unrealizeRecurringItem: noop, getMonthlyProjection,
  addGoal: async (g) => ({ ...g, id: "new-goal" }), contributeToGoal: noop, withdrawFromGoal: noop, updateGoal: noop, deleteGoal(){},
};
export function WalletProvider({children}){ return children; }
export function useWallet(){ return wallet; }
`;

const MOCKS = {
  'next/link': 'import React from "react"; export default function Link({children,href,prefetch,...props}){return <a href={typeof href==="string"?href:"#"} {...props}>{children}</a>}',
  'next/navigation': 'export const usePathname = () => location.pathname; export const useRouter = () => ({ push(){}, replace(){}, back(){}, prefetch(){}, refresh(){} }); export const useSearchParams = () => new URLSearchParams(location.search); export const redirect = () => {};',
  '@/lib/firebase': 'export const auth = { currentUser: { uid: "user-1", getIdToken: async () => "token" }, onAuthStateChanged: () => () => {} }; export const db = {}; export const app = {}; export default {};',
  '@/context/AuthContext': 'import React from "react"; const user = { uid: "user-1", email: "marina@exemplo.com", displayName: "Marina Costa", getIdToken: async () => "token" }; const value = { user, loading: false, authError: null, clearAuthError(){}, signIn: async () => user, signUp: async () => user, signInWithGoogle: async () => user, signOut: async () => {}, resetPassword: async () => {}, deleteAccount: async () => {} }; export function AuthProvider({children}){ return children; } export function useAuth(){ return value; }',
  '@/lib/services/aiChatService': 'export const loadChatSessions = async () => []; export const saveChatSessions = async () => {}; export const createChatSession = (title = "Nova Consulta") => ({ id: "s1", title, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: [] }); export const loadPersistentDiagnosis = async () => null; export const savePersistentDiagnosis = async () => {}; export const loadInitialDiagnosisSync = () => null; export const loadDismissedPatterns = () => []; export const dismissPattern = () => []; export const loadCachedBriefing = () => null; export const saveCachedBriefing = () => {}; export const loadRemoteBriefing = async () => null; export const saveBriefing = async () => {}; export const loadPatternMemory = async () => ({}); export const savePatternMemory = async () => {};',
  '@/context/WalletContext': WALLET_MOCK,
};

async function buildFixture() {
  const dir = path.join(ROOT, 'node_modules/.cache', 'wallet-vitrine');
  await mkdir(dir, { recursive: true });
  const imports = Object.values(PAGES).map((p, i) => `import Page${i} from ${file(p)};`).join('\n');
  const routes = Object.keys(PAGES).map((r, i) => `${JSON.stringify(r)}: Page${i}`).join(',');
  await writeFile(path.join(dir, 'entry.tsx'), `
    import React from "react"; import {createRoot} from "react-dom/client";
    import {AppShell} from ${file('components/layout/AppShell.tsx')};
    ${imports}
    const routes = {${routes}};
    const Page = routes[location.pathname] || routes["/dashboard"];
    createRoot(document.getElementById("root")).render(<AppShell><Page /></AppShell>);`);
  const loader = path.join(dir, 'loader.cjs');
  await writeFile(loader, `const ts=require(${JSON.stringify(requireWallet.resolve('typescript'))});module.exports=function(s){return ts.transpileModule(s,{fileName:this.resourcePath,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText;};`);
  const alias = {};
  let i = 0;
  for (const [mod, src] of Object.entries(MOCKS)) { const f = path.join(dir, `mock-${i++}.tsx`); await writeFile(f, src); alias[`${mod}$`] = f; }
  const img = path.join(dir, 'next-image.tsx');
  await writeFile(img, 'import React from "react"; export default function Image({fill,priority,unoptimized,...props}) { return <img {...props}/>; }');
  alias['next/image$'] = img;
  alias['@'] = ROOT; // por último: os mocks exatos acima têm prioridade
  const { webpack } = requireWallet('next/dist/compiled/webpack/webpack');
  await new Promise((ok, err) => {
    const c = webpack({ mode: 'development', devtool: false, entry: path.join(dir, 'entry.tsx'), output: { path: dir, filename: 'bundle.js' }, resolve: { extensions: ['.tsx', '.ts', '.js'], alias }, module: { rules: [{ test: /\.tsx?$/, use: loader }] } });
    c.run((e, s) => { c.close(() => {}); if (e || s.hasErrors()) err(e || new Error(s.toString({ all: false, errors: true }))); else ok(); });
  });
  const postcss = requireWallet('postcss'); const tailwind = requireWallet('@tailwindcss/postcss');
  const css = await postcss([tailwind()]).process(await readFile(path.join(ROOT, 'app/globals.css'), 'utf8'), { from: path.join(ROOT, 'app/globals.css') });
  return { bundle: await readFile(path.join(dir, 'bundle.js'), 'utf8'), css: `:root{--font-sf-pro:-apple-system,"SF Pro Display",Inter,system-ui,sans-serif;--font-sf-mono:ui-monospace,monospace;}\n${css.css}` };
}

const fx = await buildFixture();
console.log('fixture pronto');
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, colorScheme: 'light', timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.error('erro na página:', (e.stack || e.message).split('\n').slice(0, 4).join(' | ')));
async function abrir(rota) {
  await page.route('https://wallet.vitrine/**', async (r) => {
    const p = new URL(r.request().url()).pathname;
    if (/\.[a-z0-9]+$/i.test(p)) {
      try { return r.fulfill({ body: await readFile(path.join(ROOT, 'public', decodeURIComponent(p))), contentType: p.endsWith('.svg') ? 'image/svg+xml' : p.endsWith('.png') ? 'image/png' : p.endsWith('.jpg') || p.endsWith('.jpeg') ? 'image/jpeg' : p.endsWith('.webp') ? 'image/webp' : 'application/octet-stream' }); }
      catch { return r.fulfill({ status: 404, body: '' }); }
    }
    return r.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"></head><body><div id="root"></div></body></html>' });
  });
  await page.goto(`https://wallet.vitrine${rota}`);
  await page.addStyleTag({ content: fx.css });
  await page.addScriptTag({ content: 'window.process = { env: { NODE_ENV: "development" } };' });
  await page.addScriptTag({ content: fx.bundle });
  await page.waitForTimeout(1800);
}

if (process.argv[2] === 'explorar') {
  const out = path.join(PROMO, 'assets', 'explorar'); await mkdir(out, { recursive: true });
  for (const rota of Object.keys(PAGES)) { await abrir(rota); await page.screenshot({ path: path.join(out, rota.slice(1) + '.jpg'), quality: 80, fullPage: true }); console.log('✓', rota); }
} else {
  const { capturar } = await import(path.join(PROMO, 'tools', 'roteiro-capturas.mjs'));
  await capturar({ page, abrir, saida: path.join(PROMO, 'assets'), dpr: 3 });
}
await b.close();
