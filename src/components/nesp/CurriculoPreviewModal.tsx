"use client";

import React, { useEffect, useState } from "react";
import {
  Accessibility,
  Award,
  BookOpen,
  Briefcase,
  Code2,
  ExternalLink,
  FileCheck2,
  FileText,
  Globe,
  GraduationCap,
  Languages,
  Link2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { EditarCurriculoModal } from "./EditarCurriculoModal";

interface CurriculoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  arquivoOverride?: File | null;
  onEditarCurriculo?: () => void;
}

function normalizarUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function CurriculoPreviewModal({
  isOpen,
  onClose,
  arquivoOverride,
  onEditarCurriculo,
}: CurriculoPreviewModalProps) {
  const { aluno, aulas, curriculoPerfil, curriculoDados } = useApp();
  const [editarInternoOpen, setEditarInternoOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || editarInternoOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, editarInternoOpen, onClose]);

  if (!isOpen) return null;

  if (editarInternoOpen) {
    return (
      <EditarCurriculoModal
        isOpen={editarInternoOpen}
        onClose={() => setEditarInternoOpen(false)}
      />
    );
  }

  const isArquivoAnexado =
    Boolean(arquivoOverride) || Boolean(curriculoPerfil.uploadManual);
  const nomeArquivo = arquivoOverride
    ? arquivoOverride.name
    : curriculoPerfil.nomeArquivo;
  const tamanhoKB = arquivoOverride
    ? Math.max(120, Math.round(arquivoOverride.size / 1024))
    : curriculoPerfil.tamanhoKB;
  const dataEnvio = arquivoOverride
    ? new Date().toLocaleDateString("pt-BR")
    : curriculoPerfil.dataUpload;

  const linksDisponiveis = [
    {
      label: "GitHub",
      url: curriculoDados.links.github,
      icon: Code2,
    },
    {
      label: "LinkedIn",
      url: curriculoDados.links.linkedin,
      icon: Link2,
    },
    {
      label: "Portfólio",
      url: curriculoDados.links.portfolio,
      icon: Globe,
    },
  ].filter((l) => l.url.trim().length > 0);

  const handleEditarClick = () => {
    if (onEditarCurriculo) {
      onEditarCurriculo();
      return;
    }
    setEditarInternoOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-curriculo-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-in flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl"
      >
        {/* Top Toolbar */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-5 py-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2
                id="modal-curriculo-title"
                className="truncate text-xs sm:text-sm font-bold text-[var(--text-primary)]"
              >
                {nomeArquivo}
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                PDF • {tamanhoKB} KB • Atualizado em {dataEnvio}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar pré-visualização"
            className="rounded-xl p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Simulated PDF Sheet */}
        <div className="flex-1 overflow-y-auto bg-slate-200/70 dark:bg-slate-900/70 p-4 sm:p-6 space-y-4">
          {isArquivoAnexado && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <FileCheck2 className="h-4 w-4 shrink-0" />
              <span>
                Arquivo PDF anexado pelo usuário ({nomeArquivo} • {tamanhoKB} KB)
                vinculado ao currículo acadêmico abaixo.
              </span>
            </div>
          )}

          <div className="mx-auto rounded-xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-900 shadow-md space-y-6">
            {/* PDF Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-[#126ae2] pb-5">
              <div className="space-y-1.5">
                <span className="inline-block rounded bg-[#126ae2]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#126ae2]">
                  Currículo Acadêmico Oficial • NESP Inatel
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {aluno.nome}
                </h3>
                <p className="text-sm font-semibold text-[#126ae2]">
                  Graduando em {aluno.curso}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <GraduationCap className="h-3.5 w-3.5 text-[#126ae2]" />
                    {aluno.siglaCurso} - {aluno.matricula} • {aluno.periodo}º
                    Período
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-[#126ae2]" />
                    {aluno.email}
                  </span>
                  {aluno.telefone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-[#126ae2]" />
                      {aluno.telefone}
                    </span>
                  )}
                  {aluno.cidade && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#126ae2]" />
                      {aluno.cidade}
                    </span>
                  )}
                </div>

                {linksDisponiveis.length > 0 && (
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    {linksDisponiveis.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.label}
                          href={normalizarUrl(item.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-[#0a599b] hover:border-[#126ae2] hover:bg-blue-50 transition"
                        >
                          <Icon className="h-3 w-3" />
                          {item.label}
                          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="shrink-0 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  CRA Geral
                </span>
                <span className="text-xl font-extrabold text-[#126ae2]">
                  {aluno.cra.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Resumo / Objetivo Profissional */}
            {curriculoDados.resumoProfissional && (
              <div className="space-y-1.5">
                <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <Sparkles className="h-3.5 w-3.5 text-[#126ae2]" />
                  Resumo & Objetivo Profissional
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {curriculoDados.resumoProfissional}
                </p>
              </div>
            )}

            {/* Experiências & Projetos Acadêmicos */}
            {curriculoDados.experiencias.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <Briefcase className="h-3.5 w-3.5 text-[#126ae2]" />
                  Experiências & Projetos Acadêmicos
                </h4>
                <div className="space-y-2.5">
                  {curriculoDados.experiencias.map((exp) => (
                    <div
                      key={exp.id}
                      className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-1"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs sm:text-sm font-bold text-slate-900">
                          {exp.titulo}
                        </p>
                        {exp.periodo && (
                          <span className="rounded bg-[#126ae2]/10 px-2 py-0.5 text-[10px] font-bold text-[#0a599b]">
                            {exp.periodo}
                          </span>
                        )}
                      </div>
                      {exp.instituicao && (
                        <p className="text-[11px] font-semibold text-slate-600">
                          {exp.instituicao}
                        </p>
                      )}
                      {exp.descricao && (
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {exp.descricao}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Academic Formation */}
            <div className="space-y-2.5">
              <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <BookOpen className="h-3.5 w-3.5 text-[#126ae2]" />
                Formação & Disciplinas em Curso (Inatel)
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                Instituto Nacional de Telecomunicações (Inatel) — Santa Rita do
                Sapucaí, MG
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {aulas.map((aula) => (
                  <div
                    key={aula.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-2.5"
                  >
                    <span className="text-[10px] font-extrabold text-[#126ae2]">
                      {aula.codigo} • CR {aula.nota}
                    </span>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800 line-clamp-2">
                      {aula.disciplina.replace(`${aula.codigo} - `, "")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Skills */}
            {curriculoDados.skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <Code2 className="h-3.5 w-3.5 text-[#126ae2]" />
                  Competências Técnicas ({aluno.siglaCurso})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {curriculoDados.skills.map((skill, idx) => (
                    <span
                      key={`${skill}-${idx}`}
                      className="rounded-full bg-[#126ae2]/10 border border-[#126ae2]/20 px-3 py-1 text-xs font-semibold text-[#0a599b]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Idiomas e Certificações */}
            {curriculoDados.idiomasCertificacoes.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <Languages className="h-3.5 w-3.5 text-[#126ae2]" />
                  Idiomas & Certificações
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {curriculoDados.idiomasCertificacoes.map((item, idx) => (
                    <span
                      key={`${item}-${idx}`}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      <Award className="h-3 w-3 text-[#126ae2]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Notes */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 text-[11px] text-slate-500">
              <span>
                Disponibilidade para estágio NESP: 20h a 30h semanais •
                Atualizado em {dataEnvio}
              </span>
              {aluno.acessibilidade && (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <Accessibility className="h-3.5 w-3.5" />
                  Perfil com recurso de acessibilidade
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-3">
          <button
            type="button"
            onClick={handleEditarClick}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar Dados do Currículo
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition cursor-pointer"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
}
