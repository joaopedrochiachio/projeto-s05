"use client";

import React, { useState } from "react";
import { Check, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
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

const encurtar = (curso: string) =>
  curso === "Todos" ? "Todos os cursos" : curso.replace("Engenharia de ", "Eng. ");

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
  const [painelAberto, setPainelAberto] = useState(false);

  const cursosOpcoes = CURSOS_DISPONIVEIS.includes(aluno.curso)
    ? CURSOS_DISPONIVEIS
    : [...CURSOS_DISPONIVEIS, aluno.curso];

  const periodosValores = Array.from(new Set([4, 6, 8, aluno.periodo, 10])).sort(
    (a, b) => a - b
  );

  const isPadraoMatricula =
    !verTodos &&
    filtroCurso === aluno.curso &&
    filtroPeriodo === aluno.periodo &&
    busca.trim() === "";

  const chipBase =
    "chip cursor-pointer border py-1.5 px-3 text-xs transition";
  const chipOn = "border-[var(--accent)] bg-[var(--accent)] text-white";
  const chipOff =
    "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]";

  return (
    <section aria-label="Filtros de vagas" className="space-y-3">
      {/* Busca */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          id="vaga-search-input"
          type="search"
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="Buscar vaga, empresa ou skill"
          aria-label="Buscar vaga, empresa ou skill"
          className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3 pl-11 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] shadow-[var(--shadow-card)] focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[var(--accent-soft)] transition"
        />
        {busca && (
          <button
            type="button"
            onClick={() => onBuscaChange("")}
            aria-label="Limpar pesquisa"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Pré-filtro automático pela matrícula (HTA 1.2) */}
      <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          type="button"
          onClick={() => setPainelAberto((v) => !v)}
          aria-expanded={painelAberto}
          className={`${chipBase} ${painelAberto ? chipOn : chipOff}`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtros
        </button>

        <span className="h-5 w-px shrink-0 bg-[var(--border-subtle)]" />

        {verTodos ? (
          <button
            type="button"
            onClick={onToggleVerTodos}
            className={`${chipBase} ${chipOn}`}
          >
            Todas as vagas
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setPainelAberto(true)}
              className={`${chipBase} ${chipOn}`}
            >
              <Check className="h-3.5 w-3.5" />
              {encurtar(filtroCurso)}
            </button>
            <button
              type="button"
              onClick={() => setPainelAberto(true)}
              className={`${chipBase} ${chipOn}`}
            >
              <Check className="h-3.5 w-3.5" />
              {filtroPeriodo === 10 ? "Qualquer período" : `Até ${filtroPeriodo}º per.`}
            </button>
            <button
              type="button"
              onClick={onToggleVerTodos}
              className={`${chipBase} ${chipOff}`}
            >
              Ver todas ({totalGeral})
            </button>
          </>
        )}

        <IhcBadge etapa="HTA 1.2" metodo="Aluno.filtrarVagas()" />
      </div>

      {/* Painel expandido */}
      {painelAberto && (
        <div className="card animate-fade-up space-y-4 p-4">
          <div>
            <p className="mb-2 text-xs font-bold text-[var(--text-muted)]">Curso</p>
            <div className="flex flex-wrap gap-2">
              {cursosOpcoes.map((curso) => {
                const active = !verTodos && filtroCurso === curso;
                return (
                  <button
                    key={curso}
                    type="button"
                    onClick={() => onCursoChange(curso)}
                    className={`${chipBase} ${active ? chipOn : chipOff}`}
                  >
                    {encurtar(curso)}
                    {curso === aluno.curso && (
                      <span className={active ? "text-white/70" : "text-[var(--accent)]"}>
                        • meu
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold text-[var(--text-muted)]">
              Período mínimo exigido
            </p>
            <div className="flex flex-wrap gap-2">
              {periodosValores.map((valor) => {
                const active = !verTodos && filtroPeriodo === valor;
                return (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => onPeriodoChange(valor)}
                    className={`${chipBase} ${active ? chipOn : chipOff}`}
                  >
                    {valor === 10 ? "Qualquer" : `Até ${valor}º`}
                    {valor === aluno.periodo && (
                      <span className={active ? "text-white/70" : "text-[var(--accent)]"}>
                        • meu
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Contagem + restaurar */}
      <div className="flex items-center justify-between text-xs">
        <p className="text-[var(--text-muted)]">
          <strong className="text-[var(--text-primary)]">{totalFiltradas}</strong>{" "}
          {totalFiltradas === 1 ? "vaga encontrada" : "vagas encontradas"}
        </p>
        {!isPadraoMatricula && (
          <button
            type="button"
            onClick={() => {
              onResetMatricula();
              setPainelAberto(false);
            }}
            className="inline-flex items-center gap-1 font-bold text-[var(--accent)] hover:underline cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restaurar meu perfil
          </button>
        )}
      </div>
    </section>
  );
}
