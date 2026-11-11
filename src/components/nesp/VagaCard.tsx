"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Building2,
  Calendar,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { VagaEstagio } from "@/types";

interface VagaCardProps {
  vaga: VagaEstagio;
  onCandidatar: (vaga: VagaEstagio) => void;
}

export function VagaCard({ vaga, onCandidatar }: VagaCardProps) {
  const { aluno, isFavorita, toggleFavorito, getCandidaturaPorVaga } =
    useApp();

  const favorita = isFavorita(vaga.vagaId);
  const candidatura = getCandidaturaPorVaga(vaga.vagaId);
  const compativel =
    vaga.cursoAlvo === aluno.curso && vaga.periodoMinimo <= aluno.periodo;

  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] hover:border-[var(--accent)]/60 transition-all">
      <div className="space-y-3.5">
        {/* Top Metadata + Favorite */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {compativel ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--success)]">
                <Sparkles className="h-3 w-3" />
                Compatível
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--accent)]">
                {vaga.cursoAlvo.replace("Engenharia de ", "Eng. ")}
              </span>
            )}

            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
              <Calendar className="h-3 w-3 text-[var(--accent)]" />
              Até {vaga.prazoInscricao}
            </span>
          </div>

          <button
            type="button"
            onClick={() => toggleFavorito(vaga.vagaId)}
            aria-label={
              favorita ? "Remover vaga dos favoritos" : "Salvar vaga nos favoritos"
            }
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition cursor-pointer ${
              favorita
                ? "border-amber-400/50 bg-amber-400/15 text-amber-500"
                : "border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
            title={favorita ? "Salva nos Favoritos" : "Salvar nos Favoritos"}
          >
            {favorita ? (
              <BookmarkCheck className="h-4 w-4 fill-current" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Title & Company */}
        <div>
          <Link
            href={`/vagas/${vaga.vagaId}`}
            className="group inline-flex items-start gap-1 text-base font-extrabold text-[var(--text-primary)] hover:text-[var(--accent)] transition leading-snug"
          >
            <span>{vaga.titulo}</span>
            <ArrowUpRight className="h-4 w-4 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition" />
          </Link>
          <div className="mt-1.5 flex flex-col gap-1 text-xs text-[var(--text-secondary)]">
            <p className="flex items-center gap-1.5 font-semibold">
              <Building2 className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
              {vaga.empresa}
            </p>
            <p className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {vaga.localidade} • {vaga.cargaHoraria}
            </p>
          </div>
        </div>

        {/* Stipend & Period Highlights */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[var(--bg-surface-muted)] p-3 border border-[var(--border-subtle)]">
          <div>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <Wallet className="h-3 w-3 text-[var(--accent)]" />
              Bolsa-Auxílio
            </span>
            <p className="mt-0.5 text-sm font-extrabold text-[var(--text-primary)]">
              R$ {vaga.bolsaAuxilio.toLocaleString("pt-BR")}
            </p>
          </div>
          <div>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <GraduationCap className="h-3 w-3 text-[var(--accent)]" />
              Período Mínimo
            </span>
            <p className="mt-0.5 text-sm font-extrabold text-[var(--text-primary)]">
              {vaga.periodoMinimo}º Período+
            </p>
          </div>
        </div>

        {/* Requirement Tags */}
        <div className="flex flex-wrap gap-1.5">
          {vaga.requisitos.slice(0, 3).map((req) => (
            <span
              key={req}
              className="rounded-lg bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)]"
            >
              {req}
            </span>
          ))}
          {vaga.requisitos.length > 3 && (
            <span className="rounded-lg bg-[var(--bg-surface-muted)] px-2 py-1 text-[11px] font-semibold text-[var(--text-muted)]">
              +{vaga.requisitos.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-2.5">
        <Link
          href={`/vagas/${vaga.vagaId}`}
          className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2.5 text-center text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
        >
          Ler Requisitos
        </Link>

        {candidatura ? (
          <Link
            href="/minhas-vagas"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--success-soft)] border border-[var(--success)]/30 px-3 py-2.5 text-xs font-bold text-[var(--success)] hover:opacity-90 transition"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Enviada (#{candidatura.candidaturaId})
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onCandidatar(vaga)}
            className="flex-1 rounded-xl bg-[var(--accent)] px-3 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--accent-hover)] transition cursor-pointer"
          >
            Candidatar-se
          </button>
        )}
      </div>
    </article>
  );
}

