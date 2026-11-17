"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FastForward,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Upload,
  UserCog,
} from "lucide-react";
import { IhcBadge } from "@/components/layout/IhcBadge";
import { CurriculoPreviewModal } from "@/components/nesp/CurriculoPreviewModal";
import { EditarCurriculoModal } from "@/components/nesp/EditarCurriculoModal";
import { EditarPerfilModal } from "@/components/nesp/EditarPerfilModal";
import { EmpresaAvatar } from "@/components/nesp/EmpresaAvatar";
import { NespTabs } from "@/components/nesp/NespTabs";
import { useApp } from "@/context/AppContext";
import type { StatusCandidatura } from "@/types";

const ETAPAS_TIMELINE: { status: StatusCandidatura; titulo: string }[] = [
  { status: "Recebido no NESP", titulo: "Enviado" },
  { status: "Em análise pela Empresa", titulo: "Em análise" },
  { status: "Entrevista Agendada", titulo: "Entrevista" },
];

function getStepIndex(status: StatusCandidatura): number {
  if (status === "Recebido no NESP") return 0;
  if (status === "Em análise pela Empresa") return 1;
  return 2;
}

export default function MinhasVagasPage() {
  const {
    aluno,
    curriculoPerfil,
    curriculoDados,
    uploadCurriculo,
    candidaturas,
    simularAvancoStatus,
  } = useApp();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [editPerfilOpen, setEditPerfilOpen] = useState(false);
  const [editCurriculoOpen, setEditCurriculoOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadCurriculo(file);
    e.target.value = "";
  };

  const emAnaliseCount = candidaturas.filter(
    (c) => c.status === "Em análise pela Empresa"
  ).length;
  const entrevistasCount = candidaturas.filter(
    (c) => c.status === "Entrevista Agendada"
  ).length;

  const resumo = [
    { label: "Enviadas", valor: candidaturas.length, cor: "text-[var(--text-primary)]" },
    { label: "Em análise", valor: emAnaliseCount, cor: "text-[var(--accent)]" },
    { label: "Entrevistas", valor: entrevistasCount, cor: "text-[var(--success)]" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] lg:sr-only">
            Minhas Vagas
          </h1>
          <IhcBadge etapa="HTA 4" metodo="Aluno.acompanharStatus()" />
        </div>
        <NespTabs ativa="minhas" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        {/* Candidaturas */}
        <section className="space-y-4 lg:col-span-8" aria-label="Candidaturas">
          <div className="card grid grid-cols-3 divide-x divide-[var(--border-subtle)] py-3.5">
            {resumo.map((r) => (
              <div key={r.label} className="text-center">
                <p className={`text-2xl font-extrabold tabular-nums ${r.cor}`}>{r.valor}</p>
                <p className="text-[11px] font-semibold text-[var(--text-muted)]">{r.label}</p>
              </div>
            ))}
          </div>

          {candidaturas.length === 0 ? (
            <div className="card p-10 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Nenhuma candidatura ainda
              </h2>
              <p className="mx-auto max-w-xs text-sm text-[var(--text-muted)]">
                Candidate-se em 1 toque e acompanhe tudo por aqui.
              </p>
              <Link href="/vagas" className="btn btn-primary">
                Explorar vagas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            candidaturas.map((c) => {
              const activeIdx = getStepIndex(c.status);
              const concluida = c.status === "Entrevista Agendada";

              return (
                <article key={c.candidaturaId} className="card p-4 sm:p-5 space-y-4 animate-fade-up">
                  <div className="flex items-start gap-3">
                    <EmpresaAvatar empresa={c.vaga.empresa} />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/vagas/${c.vaga.vagaId}`}
                        className="block text-[15px] font-bold leading-snug text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.vaga.titulo.replace(/^Estágio em /, "")}
                      </Link>
                      <p className="truncate text-[13px] text-[var(--text-secondary)]">
                        {c.vaga.empresa}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        #{c.candidaturaId} • Enviado em {c.dataEnvio.split(",")[0].split(" ")[0]}
                      </p>
                    </div>
                  </div>

                  {/* Linha do tempo: Enviado → Em análise → Entrevista */}
                  <ol className="relative grid grid-cols-3" aria-label="Andamento">
                    <span
                      aria-hidden
                      className="absolute left-[16.66%] right-[16.66%] top-3.5 h-0.5 bg-[var(--border-subtle)]"
                    />
                    <span
                      aria-hidden
                      className="absolute left-[16.66%] top-3.5 h-0.5 bg-[var(--success)] transition-all duration-500"
                      style={{ width: `${activeIdx * 33.33}%` }}
                    />
                    {ETAPAS_TIMELINE.map((etapa, idx) => {
                      const completed = idx <= activeIdx;
                      const isCurrent = idx === activeIdx;
                      return (
                        <li key={etapa.status} className="relative flex flex-col items-center gap-1.5">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                              completed
                                ? "bg-[var(--success)] text-white"
                                : "border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)]"
                            } ${isCurrent ? "ring-4 ring-[var(--success-soft)]" : ""}`}
                          >
                            {completed ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : idx + 1}
                          </span>
                          <span
                            className={`text-[11px] font-bold ${
                              isCurrent
                                ? "text-[var(--success)]"
                                : completed
                                  ? "text-[var(--text-primary)]"
                                  : "text-[var(--text-muted)]"
                            }`}
                          >
                            {etapa.titulo}
                          </span>
                        </li>
                      );
                    })}
                  </ol>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3">
                    {concluida ? (
                      <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--success)]">
                        <CheckCircle2 className="h-4 w-4" />
                        Entrevista agendada — confira seu e-mail
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--text-muted)]">
                        Status: <strong className="text-[var(--text-primary)]">{c.status}</strong>
                      </p>
                    )}
                    {!concluida && (
                      <div className="flex items-center gap-2">
                        <IhcBadge etapa="Coord. NESP" metodo="atualizarStatusCandidatura()" />
                        <button
                          type="button"
                          onClick={() => simularAvancoStatus(c.candidaturaId)}
                          title="Simula a ação do Coordenador NESP (demonstração)"
                          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[var(--border-subtle)] px-3 py-1.5 text-[11px] font-bold text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition cursor-pointer"
                        >
                          <FastForward className="h-3.5 w-3.5" />
                          Simular NESP
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* Currículo + Perfil */}
        <aside className="space-y-4 lg:col-span-4">
          <section className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Currículo padrão</h2>
              <IhcBadge etapa="HTA 3.1" metodo="definirComoPadrao()" />
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-[var(--bg-surface-muted)] p-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                  {curriculoPerfil.nomeArquivo}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {curriculoPerfil.tamanhoKB} KB • {curriculoPerfil.dataUpload.split(" ")[0]}
                </p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {curriculoDados.skills.length} competências • {curriculoDados.experiencias.length} experiência(s)
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setPreviewOpen(true)} className="btn btn-ghost">
                <Eye className="h-4 w-4" />
                Ver
              </button>
              <button type="button" onClick={() => setEditCurriculoOpen(true)} className="btn btn-ghost">
                <Pencil className="h-4 w-4" />
                Editar
              </button>
            </div>
            <label className="btn w-full border border-dashed border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent-soft)]">
              <Upload className="h-4 w-4" />
              Enviar novo PDF
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="sr-only" />
            </label>
          </section>

          <section className="card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-base font-extrabold text-white">
                {aluno.avatarIniciais}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[15px] font-bold text-[var(--text-primary)]">
                  {aluno.nome}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Mat. {aluno.matricula} • CRA {aluno.cra.toFixed(1)}
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                {aluno.curso} • {aluno.periodo}º período
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                <span className="truncate">{aluno.email}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                {aluno.telefone}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                {aluno.cidade}
              </li>
              {aluno.acessibilidade && (
                <li className="flex items-center gap-2 font-semibold text-[var(--success)]">
                  <Accessibility className="h-4 w-4 shrink-0" />
                  Acessibilidade ativa
                </li>
              )}
            </ul>

            <button type="button" onClick={() => setEditPerfilOpen(true)} className="btn btn-ghost w-full">
              <UserCog className="h-4 w-4" />
              Editar informações
            </button>
          </section>
        </aside>
      </div>

      <CurriculoPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onEditarCurriculo={() => {
          setPreviewOpen(false);
          setEditCurriculoOpen(true);
        }}
      />

      <EditarPerfilModal
        isOpen={editPerfilOpen}
        onClose={() => setEditPerfilOpen(false)}
      />

      <EditarCurriculoModal
        isOpen={editCurriculoOpen}
        onClose={() => setEditCurriculoOpen(false)}
      />
    </div>
  );
}

