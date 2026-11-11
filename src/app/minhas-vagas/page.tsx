"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileCheck2,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Sparkles,
  Upload,
  UserCheck,
  UserCog,
} from "lucide-react";
import { IhcBadge } from "@/components/layout/IhcBadge";
import { CurriculoPreviewModal } from "@/components/nesp/CurriculoPreviewModal";
import { EditarCurriculoModal } from "@/components/nesp/EditarCurriculoModal";
import { EditarPerfilModal } from "@/components/nesp/EditarPerfilModal";
import { useApp } from "@/context/AppContext";
import type { StatusCandidatura } from "@/types";

const ETAPAS_TIMELINE: {
  status: StatusCandidatura;
  titulo: string;
  subtitulo: string;
}[] = [
  {
    status: "Recebido no NESP",
    titulo: "1. Recebido no NESP",
    subtitulo: "Documentação conferida",
  },
  {
    status: "Em análise pela Empresa",
    titulo: "2. Em análise pela Empresa",
    subtitulo: "Avaliação técnica do currículo",
  },
  {
    status: "Entrevista Agendada",
    titulo: "3. Entrevista Agendada",
    subtitulo: "Convite enviado ao aluno",
  },
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)]">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Acompanhamento de Candidaturas
            </div>
            <IhcBadge
              etapa="HTA 4"
              metodo="Candidatura.acompanharStatus()"
            />
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Minhas Vagas & Currículo PDF
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Gerencie seu currículo padrão de 1-toque e acompanhe o retorno do
            NESP e das empresas parceiras.
          </p>
        </div>

        <Link
          href="/vagas"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[var(--accent-hover)] transition self-start"
        >
          Explorar Novas Vagas
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Main 12-Col Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Sidebar: Profile + Resume Management */}
        <aside className="space-y-6 lg:col-span-4">
          {/* Resume Management Card */}
          <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <FileCheck2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Currículo Padrão
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Envio em 1-toque nas vagas
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--success)]">
                1-Toque Ativo
              </span>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4 space-y-2">
              <div className="flex items-start gap-2.5">
                <FileText className="h-5 w-5 shrink-0 text-[var(--accent)] mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    {curriculoPerfil.nomeArquivo}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {curriculoPerfil.tamanhoKB} KB • Atualizado em{" "}
                    {curriculoPerfil.dataUpload}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-[var(--text-secondary)]">
                    {curriculoDados.skills.length} competências •{" "}
                    {curriculoDados.experiencias.length} experiência(s)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5 shrink-0" />
                  Visualizar Currículo
                </button>

                <button
                  type="button"
                  onClick={() => setEditCurriculoOpen(true)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-3 py-2.5 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5 shrink-0" />
                  Editar Currículo
                </button>
              </div>

              <label className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--accent)]/60 bg-[var(--accent-soft)]/40 px-4 py-3 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent-soft)] transition cursor-pointer">
                <Upload className="h-4 w-4" />
                Substituir Currículo em PDF
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>
          </section>

          {/* Student Academic Summary */}
          <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-base font-extrabold text-white">
                  {aluno.avatarIniciais}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-bold text-[var(--text-primary)]">
                    {aluno.nome}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    {aluno.siglaCurso} - {aluno.matricula} • CRA{" "}
                    {aluno.cra.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 border-t border-[var(--border-subtle)] pt-3.5 text-xs text-[var(--text-secondary)]">
              <p className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[var(--accent)] shrink-0" />
                <span>
                  {aluno.curso} • {aluno.periodo}º Período
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[var(--accent)] shrink-0" />
                <span className="truncate">{aluno.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[var(--accent)] shrink-0" />
                <span>{aluno.telefone}</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--accent)] shrink-0" />
                <span>{aluno.cidade}</span>
              </p>
              <p
                className={`flex items-center gap-2 font-semibold ${
                  aluno.acessibilidade
                    ? "text-[var(--success)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                <Accessibility className="h-4 w-4 shrink-0" />
                {aluno.acessibilidade
                  ? "Preferência de Acessibilidade Ativa"
                  : "Preferência de Acessibilidade: Padrão"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEditPerfilOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition cursor-pointer"
            >
              <UserCog className="h-4 w-4" />
              Editar Informações
            </button>
          </section>
        </aside>

        {/* Right Main: Status Timeline + NESP Coordinator Simulator */}
        <section className="space-y-5 lg:col-span-8">
          {/* Summary Counters */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-card)]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Enviadas
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[var(--text-primary)]">
                {candidaturas.length}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-card)]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Em Análise
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[var(--accent)]">
                {emAnaliseCount}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-card)]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Entrevistas
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[var(--success)]">
                {entrevistasCount}
              </p>
            </div>
          </div>

          {/* Candidacies List */}
          {candidaturas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] p-10 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Nenhuma candidatura enviada ainda
              </h2>
              <p className="mx-auto max-w-md text-xs sm:text-sm text-[var(--text-muted)]">
                Explore o Mural de Vagas NESP e envie seu currículo PDF em 1
                toque para acompanhar o andamento por aqui.
              </p>
              <div className="pt-2">
                <Link
                  href="/vagas"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition"
                >
                  Explorar Vagas Agora
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {candidaturas.map((c) => {
                const activeIdx = getStepIndex(c.status);
                const concluida = c.status === "Entrevista Agendada";

                return (
                  <article
                    key={c.candidaturaId}
                    className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-[var(--shadow-card)] space-y-5"
                  >
                    {/* Card Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-[11px] font-extrabold text-white">
                            Protocolo #{c.candidaturaId}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                              concluida
                                ? "bg-[var(--success-soft)] text-[var(--success)]"
                                : "bg-[var(--accent-soft)] text-[var(--accent)]"
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <Link
                          href={`/vagas/${c.vaga.vagaId}`}
                          className="block pt-1 text-base sm:text-lg font-extrabold text-[var(--text-primary)] hover:text-[var(--accent)] transition"
                        >
                          {c.vaga.titulo}
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                          <span className="inline-flex items-center gap-1.5 font-semibold">
                            <Building2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                            {c.vaga.empresa}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                            <Calendar className="h-3.5 w-3.5" />
                            Enviado em {c.dataEnvio}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                            <FileText className="h-3.5 w-3.5" />
                            {c.curriculoUsado}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/vagas/${c.vaga.vagaId}`}
                        className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] transition"
                      >
                        Ver Vaga
                      </Link>
                    </div>

                    {/* 3-Step Visual Progress Timeline */}
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {ETAPAS_TIMELINE.map((etapa, idx) => {
                          const completed = idx <= activeIdx;
                          const isCurrent = idx === activeIdx;

                          return (
                            <div
                              key={etapa.status}
                              className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 sm:text-center relative"
                            >
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                                  completed
                                    ? "bg-[var(--success)] text-white shadow-sm"
                                    : "border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)]"
                                } ${
                                  isCurrent
                                    ? "ring-4 ring-[var(--success-soft)]"
                                    : ""
                                }`}
                              >
                                {completed ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  idx + 1
                                )}
                              </div>
                              <div>
                                <p
                                  className={`text-xs font-bold ${
                                    completed
                                      ? "text-[var(--text-primary)]"
                                      : "text-[var(--text-muted)]"
                                  }`}
                                >
                                  {etapa.titulo}
                                </p>
                                <p className="text-[11px] text-[var(--text-muted)]">
                                  {etapa.subtitulo}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* NESP Coordinator Simulator */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      {concluida ? (
                        <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--success-soft)] px-4 py-2.5 text-xs font-bold text-[var(--success)]">
                          <CheckCircle2 className="h-4 w-4" />
                          Processo finalizado: Entrevista Agendada! Verifique
                          seu e-mail institucional.
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                              <UserCheck className="h-4 w-4 text-[var(--accent)] shrink-0" />
                              Simulação IHC: avance o status como Coordenador
                              do NESP
                            </p>
                            <IhcBadge
                              etapa="HTA 4"
                              metodo="atualizarStatusCandidatura()"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              simularAvancoStatus(c.candidaturaId)
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--success)] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition cursor-pointer shrink-0"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Simular Atualização do Coordenador NESP
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
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

