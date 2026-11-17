"use client";

import React from "react";
import Link from "next/link";
import { Bookmark, CheckCircle2, Clock, MapPin } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { descreverPrazo, extrairLocal } from "@/lib/prazo";
import type { VagaEstagio } from "@/types";
import { EmpresaAvatar } from "./EmpresaAvatar";

interface VagaCardProps {
  vaga: VagaEstagio;
  onCandidatar: (vaga: VagaEstagio) => void;
}

export function VagaCard({ vaga, onCandidatar }: VagaCardProps) {
  const { aluno, isFavorita, toggleFavorito, getCandidaturaPorVaga } = useApp();

  const favorita = isFavorita(vaga.vagaId);
  const candidatura = getCandidaturaPorVaga(vaga.vagaId);
  const compativel =
    vaga.cursoAlvo === aluno.curso && vaga.periodoMinimo <= aluno.periodo;
  const prazo = descreverPrazo(vaga.prazoInscricao);
  const cidade = extrairLocal(vaga.localidade)?.split("/")[0].trim();

  return (
    <article className="card group relative flex h-full flex-col p-4 sm:p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(15,27,45,0.18)]">
      <div className="flex items-start gap-3">
        <EmpresaAvatar empresa={vaga.empresa} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/vagas/${vaga.vagaId}`}
            className="block text-[15px] font-bold leading-snug text-[var(--text-primary)] hover:text-[var(--accent)] after:absolute after:inset-0 after:content-['']"
          >
            {vaga.titulo.replace(/^Estágio em /, "")}
          </Link>
          <p className="mt-0.5 truncate text-[13px] text-[var(--text-secondary)]">
            {vaga.empresa}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleFavorito(vaga.vagaId)}
          aria-label={favorita ? "Remover dos favoritos" : "Salvar nos favoritos"}
          aria-pressed={favorita}
          className={`relative z-10 -mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition cursor-pointer ${
            favorita
              ? "text-amber-500 hover:bg-amber-500/10"
              : "text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
          }`}
        >
          <Bookmark className={`h-5 w-5 ${favorita ? "fill-current animate-pop" : ""}`} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {compativel && (
          <span className="chip bg-[var(--success-soft)] text-[var(--success)]">
            <CheckCircle2 className="h-3 w-3" />
            Compatível
          </span>
        )}
        <span className="chip bg-[var(--bg-surface-muted)] text-[var(--text-secondary)]">
          {vaga.modalidade}
        </span>
        {cidade && (
          <span className="chip bg-[var(--bg-surface-muted)] text-[var(--text-secondary)]">
            <MapPin className="h-3 w-3" />
            {cidade}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
        <div>
          <p className="text-lg font-extrabold leading-none text-[var(--text-primary)] tabular-nums">
            R$ {vaga.bolsaAuxilio.toLocaleString("pt-BR")}
            <span className="text-xs font-semibold text-[var(--text-muted)]">/mês</span>
          </p>
          <p
            className={`mt-1.5 inline-flex items-center gap-1 text-xs font-semibold ${
              prazo.urgente ? "text-[var(--warning)]" : "text-[var(--text-muted)]"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {prazo.texto}
          </p>
        </div>

        {candidatura ? (
          <Link
            href="/minhas-vagas"
            className="chip relative z-10 bg-[var(--success-soft)] py-2 px-3 text-xs font-bold text-[var(--success)]"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Enviada
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onCandidatar(vaga)}
            disabled={prazo.encerrado}
            className="btn btn-primary relative z-10 px-4 py-2.5"
          >
            Candidatar
          </button>
        )}
      </div>
    </article>
  );
}
