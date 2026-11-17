// Narração no tempo (capítulo 05 do guia): as cenas começam na palavra falada.
// vo.json = { words: [{w, t0, t1}], frases: [{texto, t0, t1, words: [i0, i1]}], dur }
export const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

export async function loadVO(url = 'vo.json') {
  const r = await fetch(url, { cache: 'no-store' });
  return r.json();
}

// Início da palavra (primeira ocorrência depois de `after` segundos, ou a n-ésima).
export function wt(VO, palavra, { after = -1, n = 0, end = false } = {}) {
  const alvo = norm(palavra);
  let k = 0;
  for (const w of VO.words) {
    if (w.t0 < after) continue;
    if (norm(w.w) === alvo) { if (k++ === n) return end ? w.t1 : w.t0; }
  }
  console.warn(`palavra "${palavra}" não encontrada na narração`);
  return after > 0 ? after : 0;
}

// Frase i (negativo conta do fim).
export const ph = (VO, i) => VO.frases[i < 0 ? VO.frases.length + i : i];
