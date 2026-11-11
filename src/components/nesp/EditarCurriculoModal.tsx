"use client";

import React, { useEffect, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Code2,
  FileEdit,
  Globe,
  Languages,
  Link2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { CurriculoExperiencia, CurriculoLinks } from "@/types";

interface EditarCurriculoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditarCurriculoModal({
  isOpen,
  onClose,
}: EditarCurriculoModalProps) {
  const { aluno, curriculoDados } = useApp();

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <EditarCurriculoModalBody
      key={`${aluno.id}-${curriculoDados.ultimaEdicao}-${isOpen ? "open" : "closed"}`}
      onClose={onClose}
    />
  );
}

function EditableTagsSection({
  id,
  label,
  placeholder,
  items,
  onChange,
  icon: Icon,
}: {
  id: string;
  label: string;
  placeholder: string;
  items: string[];
  onChange: (next: string[]) => void;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const [draft, setDraft] = useState("");

  const handleAdd = () => {
    const clean = draft.trim();
    if (!clean) return;
    const duplicate = items.some(
      (i) => i.toLowerCase() === clean.toLowerCase()
    );
    if (!duplicate) {
      onChange([...items, clean]);
    }
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]"
      >
        <Icon className="h-3.5 w-3.5 text-[var(--accent)]" />
        {label}
      </label>

      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3.5 py-2 text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:outline-none transition"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 rounded-xl bg-[var(--accent-soft)] px-3.5 py-2 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition cursor-pointer shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                aria-label={`Remover ${item}`}
                className="rounded-full p-0.5 text-[var(--text-muted)] hover:bg-red-500/15 hover:text-red-500 transition cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EditarCurriculoModalBody({ onClose }: { onClose: () => void }) {
  const { curriculoDados, atualizarCurriculoDados } = useApp();

  const [resumoProfissional, setResumoProfissional] = useState(
    curriculoDados.resumoProfissional
  );
  const [skills, setSkills] = useState<string[]>(() => [
    ...curriculoDados.skills,
  ]);
  const [experiencias, setExperiencias] = useState<CurriculoExperiencia[]>(() =>
    curriculoDados.experiencias.map((exp) => ({ ...exp }))
  );
  const [idiomasCertificacoes, setIdiomasCertificacoes] = useState<string[]>(
    () => [...curriculoDados.idiomasCertificacoes]
  );
  const [links, setLinks] = useState<CurriculoLinks>({
    ...curriculoDados.links,
  });

  const handleExpChange = (
    id: string,
    field: keyof Omit<CurriculoExperiencia, "id">,
    value: string
  ) => {
    setExperiencias((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const handleAddExp = () => {
    setExperiencias((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}`,
        titulo: "",
        instituicao: "",
        periodo: "",
        descricao: "",
      },
    ]);
  };

  const handleRemoveExp = (id: string) => {
    setExperiencias((prev) => prev.filter((exp) => exp.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const experienciasLimpas = experiencias
      .map((exp) => ({
        ...exp,
        titulo: exp.titulo.trim(),
        instituicao: exp.instituicao.trim(),
        periodo: exp.periodo.trim(),
        descricao: exp.descricao.trim(),
      }))
      .filter(
        (exp) =>
          exp.titulo.length > 0 ||
          exp.instituicao.length > 0 ||
          exp.descricao.length > 0
      );

    atualizarCurriculoDados({
      resumoProfissional: resumoProfissional.trim(),
      skills,
      experiencias: experienciasLimpas,
      idiomasCertificacoes,
      links: {
        github: links.github.trim(),
        linkedin: links.linkedin.trim(),
        portfolio: links.portfolio.trim(),
      },
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/65 p-0 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-editar-curriculo-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-in flex w-full sm:max-w-2xl max-h-[92vh] flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <FileEdit className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="modal-editar-curriculo-title"
                className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]"
              >
                Editor de Currículo Padrão
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Atualiza o documento PDF visualizado e enviado em 1-toque no
                NESP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar editor de currículo"
            className="rounded-xl p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* 1. Resumo Profissional */}
          <div className="space-y-1.5">
            <label
              htmlFor="cv-resumo"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              Resumo / Objetivo Profissional
            </label>
            <textarea
              id="cv-resumo"
              rows={3}
              value={resumoProfissional}
              onChange={(e) => setResumoProfissional(e.target.value)}
              placeholder="Descreva seu objetivo profissional e principais áreas de interesse..."
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3.5 py-2.5 text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:outline-none transition leading-relaxed"
            />
          </div>

          {/* 2. Competências Técnicas (Skills) */}
          <EditableTagsSection
            id="cv-skills-input"
            label="Competências Técnicas (Skills)"
            placeholder="Ex: React, TypeScript, Docker... (Enter para adicionar)"
            items={skills}
            onChange={setSkills}
            icon={Code2}
          />

          {/* 3. Experiências e Projetos Acadêmicos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <Briefcase className="h-3.5 w-3.5 text-[var(--accent)]" />
                Experiências & Projetos Acadêmicos
              </span>
              <button
                type="button"
                onClick={handleAddExp}
                className="inline-flex items-center gap-1 rounded-xl bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar Item
              </button>
            </div>

            {experiencias.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4 text-center text-xs text-[var(--text-muted)]">
                Nenhuma experiência cadastrada. Clique em &quot;Adicionar
                Item&quot; para incluir projetos, FETIN ou monitorias.
              </p>
            ) : (
              <div className="space-y-3">
                {experiencias.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                        Experiência / Projeto #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExp(exp.id)}
                        aria-label={`Remover experiência ${idx + 1}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remover
                      </button>
                    </div>

                    <input
                      type="text"
                      value={exp.titulo}
                      onChange={(e) =>
                        handleExpChange(exp.id, "titulo", e.target.value)
                      }
                      placeholder="Título (ex: Desenvolvedor Front-End • Projetos Web & IA)"
                      className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs sm:text-sm font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={exp.instituicao}
                        onChange={(e) =>
                          handleExpChange(exp.id, "instituicao", e.target.value)
                        }
                        placeholder="Instituição ou Empresa"
                        className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={exp.periodo}
                        onChange={(e) =>
                          handleExpChange(exp.id, "periodo", e.target.value)
                        }
                        placeholder="Período (ex: 2025 - Atual)"
                        className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={exp.descricao}
                      onChange={(e) =>
                        handleExpChange(exp.id, "descricao", e.target.value)
                      }
                      placeholder="Principais atividades, tecnologias e resultados alcançados..."
                      className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Idiomas e Certificações */}
          <EditableTagsSection
            id="cv-idiomas-input"
            label="Idiomas & Certificações"
            placeholder="Ex: Inglês Avançado, AWS Cloud Practitioner..."
            items={idiomasCertificacoes}
            onChange={setIdiomasCertificacoes}
            icon={Languages}
          />

          {/* 5. Links Profissionais */}
          <div className="space-y-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <Link2 className="h-3.5 w-3.5 text-[var(--accent)]" />
              Links Profissionais
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="cv-link-github"
                  className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1"
                >
                  GitHub
                </label>
                <div className="relative">
                  <Code2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    id="cv-link-github"
                    type="text"
                    value={links.github}
                    onChange={(e) =>
                      setLinks((prev) => ({ ...prev, github: e.target.value }))
                    }
                    placeholder="https://github.com/..."
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] py-2 pl-8 pr-3 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="cv-link-linkedin"
                  className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1"
                >
                  LinkedIn
                </label>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    id="cv-link-linkedin"
                    type="text"
                    value={links.linkedin}
                    onChange={(e) =>
                      setLinks((prev) => ({
                        ...prev,
                        linkedin: e.target.value,
                      }))
                    }
                    placeholder="https://linkedin.com/in/..."
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] py-2 pl-8 pr-3 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="cv-link-portfolio"
                  className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1"
                >
                  Portfólio
                </label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    id="cv-link-portfolio"
                    type="text"
                    value={links.portfolio}
                    onChange={(e) =>
                      setLinks((prev) => ({
                        ...prev,
                        portfolio: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] py-2 pl-8 pr-3 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-4 py-2.5 text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:border-[var(--accent)] transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[var(--accent-hover)] transition cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              Salvar Currículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

