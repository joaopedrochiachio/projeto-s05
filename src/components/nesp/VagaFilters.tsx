"use client";

import React from "react";
import {
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { IhcBadge } from "@/components/layout/IhcBadge";
import { useApp } from "@/context/AppContext";
import { CURSOS_DISPONIVEIS } from "@/data/mockData";

interface VagaFiltersProps {
  busca: string;
  onBuscaChange: (value: string) => void;
  filtroCurso: string;
  onCursoChange: (value: string) => void;
  filtroPeriodo: number;
  onPeriodoChange: (value: number) => void;
  verTodos: boolean;
  onToggleVerTodos: () => void;
  onResetMatricula: () => void;
  totalFiltradas: number;
  totalGeral: number;
}

export function VagaFilters({
  busca,
  onBuscaChange,
  filtroCurso,
  onCursoChange,
  filtroPeriodo,
  onPeriodoChange,
  verTodos,
  onToggleVerTodos,
  onResetMatricula,
  totalFiltradas,
  totalGeral,
}: VagaFiltersProps) {
  const { aluno } = useApp();

  const cursosOpcoes = CURSOS_DISPONIVEIS.includes(aluno.curso)
    ? CURSOS_DISPONIVEIS
    : [...CURSOS_DISPONIVEIS, aluno.curso];

  const periodosValores = Array.from(
    new Set([4, 6, 8, aluno.periodo, 10])
  ).sort((a, b) => a - b);

  const isPadraoMatricula =
    !verTodos &&
    filtroCurso === aluno.curso &&
    filtroPeriodo === aluno.periodo &&
    busca.trim() === "";

  return (
    <section
      aria-label="Filtros de vagas NESP"
      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] space-y-4"
    >
      {/* Top Smart Profile Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                Filtros Inteligentes por Matrícula
              </h2>
              {!verTodos && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--success)]">
                  <Sparkles className="h-3 w-3" />
                  {aluno.siglaCurso} - {aluno.matricula}
                </span>
              )}
              <IhcBadge
                etapa="HTA 1.2"
                metodo="VagaEstagio.filtrarVagas()"
              />
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Exibindo <strong>{totalFiltradas}</strong> de{" "}
              <strong>{totalGeral}</strong> vagas no NESP
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleVerTodos}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
              verTodos
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-primary)] hover:border-[var(--accent)]"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            {verTodos
              ? `Mostrando Todas (${totalGeral})`
              : `Ver Todas as Vagas (${totalGeral})`}
          </button>

          {!isPadraoMatricula && (
            <button
              type="button"
              onClick={onResetMatricula}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restaurar Perfil
            </button>
          )}
        </div>
      </div>

      {/* Search + Filters Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
        {/* Search Input */}
        <div className="lg:col-span-5">
          <label
            htmlFor="vaga-search-input"
            className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
          >
            Pesquisar Vaga, Empresa ou Skill
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              id="vaga-search-input"
              type="text"
              value={busca}
              onChange={(e) => onBuscaChange(e.target.value)}
              placeholder="Ex: React, TypeScript, ICC, Remoto..."
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] py-2.5 pl-10 pr-9 text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:outline-none transition"
            />
            {busca && (
              <button
                type="button"
                onClick={() => onBuscaChange("")}
                aria-label="Limpar pesquisa"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Course Pills */}
        <div className="lg:col-span-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
            Curso Alvo
          </p>
          <div className="flex flex-wrap gap-1.5">
            {cursosOpcoes.map((curso) => {
              const active = !verTodos && filtroCurso === curso;
              const shortLabel =
                curso === "Todos"
                  ? "Todos"
                  : curso.replace("Engenharia de ", "Eng. ");
              return (
                <button
                  key={curso}
                  type="button"
                  onClick={() => onCursoChange(curso)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                    active
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:border-[var(--accent)]"
                  }`}
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Period Pills */}
        <div className="lg:col-span-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
            Período Exigido
          </p>
          <div className="flex flex-wrap gap-1.5">
            {periodosValores.map((valor) => {
              const active = !verTodos && filtroPeriodo === valor;
              const label =
                valor === 10
                  ? "Todos"
                  : valor === aluno.periodo
                    ? `Até ${valor}º P (Meu)`
                    : `Até ${valor}º P`;
              return (
                <button
                  key={valor}
                  type="button"
                  onClick={() => onPeriodoChange(valor)}
                  className={`rounded-xl px-2.5 py-2 text-xs font-bold transition cursor-pointer ${
                    active
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:border-[var(--accent)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

