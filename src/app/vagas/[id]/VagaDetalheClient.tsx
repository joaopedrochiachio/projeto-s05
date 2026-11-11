"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  Gift,
  GraduationCap,
  ListChecks,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";
import { IhcBadge } from "@/components/layout/IhcBadge";
import { CandidaturaModal } from "@/components/nesp/CandidaturaModal";
import { useApp } from "@/context/AppContext";

export function VagaDetalheClient({ vagaId }: { vagaId: number }) {
  const {
    aluno,
    vagas,
    isFavorita,
    toggleFavorito,
    curriculoPerfil,
    getCandidaturaPorVaga,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);

  const vaga = vagas.find((v) => v.vagaId === vagaId);

  if (!vaga) {
    return (
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-10 text-center space-y-3 shadow-[var(--shadow-card)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--warning-soft)] text-[var(--warning)]">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">
          Vaga não encontrada
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          A oportunidade solicitada não está disponível ou foi encerrada no
          Mural NESP.
        </p>
        <Link
          href="/vagas"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Mural de Vagas
        </Link>
      </div>
    );
  }

  const favorita = isFavorita(vaga.vagaId);
  const candidatura = getCandidaturaPorVaga(vaga.vagaId);
  const cursoCompativel = vaga.cursoAlvo === aluno.curso;
  const periodoCompativel = vaga.periodoMinimo <= aluno.periodo;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Back */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/vagas"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Mural NESP
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <IhcBadge etapa="HTA 2.B" metodo="salvarNosFavoritos()" />
          <button
            type="button"
            onClick={() => toggleFavorito(vaga.vagaId)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
              favorita
                ? "border-amber-400/50 bg-amber-400/15 text-amber-600 dark:text-amber-400"
                : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent)]"
            }`}
          >
            {favorita ? (
              <>
                <BookmarkCheck className="h-4 w-4 fill-current" />
                Salva nos Favoritos
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                Salvar nos Favoritos
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Job Summary Card */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-card)] space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold text-white">
            <Briefcase className="h-3.5 w-3.5" />
            {vaga.area}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)]">
            {vaga.modalidade}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
            <Calendar className="h-3.5 w-3.5 text-[var(--accent)]" />
            Inscrições até {vaga.prazoInscricao}
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {vaga.titulo}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
              <Building2 className="h-4 w-4 text-[var(--accent)]" />
              {vaga.empresa}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[var(--accent)]" />
              {vaga.localidade}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[var(--accent)]" />
              {vaga.cargaHoraria}
            </span>
          </div>
        </div>

        {/* Highlight Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3.5">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <Wallet className="h-3.5 w-3.5 text-[var(--accent)]" />
              Bolsa-Auxílio
            </span>
            <p className="mt-1 text-lg font-extrabold text-[var(--text-primary)]">
              R$ {vaga.bolsaAuxilio.toLocaleString("pt-BR")},00/mês
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3.5">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <GraduationCap className="h-3.5 w-3.5 text-[var(--accent)]" />
              Curso Alvo
            </span>
            <p className="mt-1 text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
              {vaga.cursoAlvo}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3.5">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              Período Mínimo
            </span>
            <p className="mt-1 text-lg font-extrabold text-[var(--text-primary)]">
              {vaga.periodoMinimo}º Período+
            </p>
          </div>
        </div>
      </section>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Description, Activities, Requirements, Benefits */}
        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] space-y-3">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Sobre a Oportunidade
            </h2>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {vaga.descricao}
            </p>
          </section>

          <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] space-y-4">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Principais Atividades
              </h2>
            </div>
            <ul className="space-y-2.5">
              {vaga.atividades.map((ativ) => (
                <li
                  key={ativ}
                  className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>{ativ}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Requirements */}
            <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[var(--accent)]" />
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Requisitos da Oportunidade
                  </h2>
                </div>
                <IhcBadge
                  etapa="HTA 2.A"
                  metodo="VagaEstagio.exibirDetalhes()"
                />
              </div>
              <ul className="space-y-2.5">
                {vaga.requisitos.map((req) => (
                  <li
                    key={req}
                    className="flex items-center gap-2.5 rounded-xl bg-[var(--bg-surface-muted)] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" />
                    {req}
                  </li>
                ))}
              </ul>
            </section>

            {/* Benefits */}
            <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] space-y-4">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-[var(--accent)]" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Benefícios Oferecidos
                </h2>
              </div>
              <ul className="space-y-2.5">
                {vaga.beneficios.map((ben) => (
                  <li
                    key={ben}
                    className="flex items-center gap-2.5 rounded-xl bg-[var(--bg-surface-muted)] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  >
                    <Gift className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    {ben}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Right: Sticky Application Panel */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] space-y-5">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-extrabold text-[var(--text-primary)]">
                  Elegibilidade & Envio
                </h2>
                <IhcBadge etapa="HTA 3.1" metodo="anexarArquivoPDF()" />
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Conferência automática para {aluno.siglaCurso} -{" "}
                {aluno.matricula}
              </p>
            </div>

            {/* Compatibility Check */}
            <div className="space-y-2 rounded-xl bg-[var(--bg-surface-muted)] p-3.5 border border-[var(--border-subtle)] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">
                  Curso ({aluno.siglaCurso})
                </span>
                <span
                  className={`font-bold ${
                    cursoCompativel
                      ? "text-[var(--success)]"
                      : "text-[var(--warning)]"
                  }`}
                >
                  {cursoCompativel ? "✓ Compatível" : "Outro Curso"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">
                  Período ({aluno.periodo}º atual)
                </span>
                <span
                  className={`font-bold ${
                    periodoCompativel
                      ? "text-[var(--success)]"
                      : "text-[var(--warning)]"
                  }`}
                >
                  {periodoCompativel
                    ? "✓ Atende ao mínimo"
                    : `Exige ${vaga.periodoMinimo}º+`}
                </span>
              </div>
            </div>

            {/* Application Status or 1-Touch Action */}
            {candidatura ? (
              <div className="space-y-3 rounded-xl border border-[var(--success)]/30 bg-[var(--success-soft)] p-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--success)]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Candidatura Enviada (#{candidatura.candidaturaId})
                </div>
                <p className="text-xs text-[var(--text-primary)]">
                  <strong>Status atual:</strong> {candidatura.status}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Currículo: {candidatura.curriculoUsado}
                </p>
                <Link
                  href="/minhas-vagas"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--success)] px-4 py-2.5 text-xs font-bold text-white hover:opacity-90 transition"
                >
                  Acompanhar em Minhas Vagas
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                      <FileCheck2 className="h-4 w-4 text-[var(--accent)]" />
                      Currículo Padrão Salvo
                    </span>
                    <span className="rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--success)]">
                      1-Toque
                    </span>
                  </div>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {curriculoPerfil.nomeArquivo}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {curriculoPerfil.tamanhoKB} KB • Você pode enviar este ou
                    anexar um novo PDF
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--success)] px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:opacity-90 transition cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Candidatar-se Agora
                </button>
              </>
            )}
          </div>
        </aside>
      </div>

      <CandidaturaModal
        vaga={vaga}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

