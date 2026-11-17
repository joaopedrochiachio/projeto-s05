/** Dias entre hoje e uma data no formato dd/mm/aaaa (negativo = encerrado). */
export function diasAte(dataBR: string): number | null {
  const [d, m, a] = dataBR.split("/").map(Number);
  if (!d || !m || !a) return null;
  const alvo = new Date(a, m - 1, d);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000);
}

/** Texto curto de prazo + se é urgente (≤ 3 dias). VagaEstagio.verificarPrazoAtivo() */
export function descreverPrazo(dataBR: string): {
  texto: string;
  urgente: boolean;
  encerrado: boolean;
} {
  const dias = diasAte(dataBR);
  const curta = dataBR.slice(0, 5);
  if (dias === null) return { texto: `Até ${curta}`, urgente: false, encerrado: false };
  if (dias < 0) return { texto: "Encerrada", urgente: false, encerrado: true };
  if (dias === 0) return { texto: "Encerra hoje", urgente: true, encerrado: false };
  if (dias <= 3)
    return { texto: `Encerra em ${dias}d`, urgente: true, encerrado: false };
  return { texto: `Até ${curta}`, urgente: false, encerrado: false };
}

/** "Híbrido • Santa Rita / Pouso Alegre" → "Santa Rita / Pouso Alegre" (null se só modalidade). */
export function extrairLocal(localidade: string): string | null {
  const partes = localidade.split("•");
  return partes.length > 1 ? partes[1].trim() : null;
}
