"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, Briefcase, SearchX, Sparkles } from "lucide-react";
import { IhcBadge } from "@/components/layout/IhcBadge";
import { CandidaturaModal } from "@/components/nesp/CandidaturaModal";
import { VagaCard } from "@/components/nesp/VagaCard";
import { VagaFilters } from "@/components/nesp/VagaFilters";
import { useApp } from "@/context/AppContext";
import type { VagaEstagio } from "@/types";

function VagasMuralContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const abaAtiva: "todas" | "favoritas" =
    tabParam === "favoritas" ? "favoritas" : "todas";

  const { aluno, vagas, favoritosIds, buscaGlobal, setBuscaGlobal } = useApp();

  const [filtroCurso, setFiltroCurso] = useState<string>(aluno.curso);
  const [filtroPeriodo, setFiltroPeriodo] = useState<number>(aluno.periodo);
  const [verTodos, setVerTodos] = useState<boolean>(false);
  const [vagaModal, setVagaModal] = useState<VagaEstagio | null>(null);

  const handleTabChange = (novaAba: "todas" | "favoritas") => {
    if (novaAba === "favoritas") {
      router.push("/vagas?tab=favoritas");
    } else {
      router.push("/vagas");
    }
  };

  const handleCursoChange = (curso: string) => {
    setVerTodos(false);
    setFiltroCurso(curso);
  };

  const handlePeriodoChange = (periodo: number) => {
    setVerTodos(false);
    setFiltroPeriodo(periodo);
  };

  const handleToggleVerTodos = () => {
    setVerTodos((prev) => !prev);
  };

  const handleResetMatricula = () => {
    setVerTodos(false);
    setFiltroCurso(aluno.curso);
    setFiltroPeriodo(aluno.periodo);
    setBuscaGlobal("");
  };

  const vagasFiltradas = useMemo(() => {
    const q = buscaGlobal.trim().toLowerCase();
    return vagas.filter((v) => {
      if (abaAtiva === "favoritas" && !favoritosIds.includes(v.vagaId)) {
        return false;
      }

      const matchBusca =
        !q ||
        v.titulo.toLowerCase().includes(q) ||
        v.empresa.toLowerCase().includes(q) ||
        v.localidade.toLowerCase().includes(q) ||
        v.area.toLowerCase().includes(q) ||
        v.requisitos.some((r) => r.toLowerCase().includes(q));

      if (!matchBusca) return false;

      if (verTodos || abaAtiva === "favoritas") return true;

      const matchCurso =
        filtroCurso === "Todos" || v.cursoAlvo === filtroCurso;
      const matchPeriodo = v.periodoMinimo <= filtroPeriodo;

      return matchCurso && matchPeriodo;
    });
  }, [
    vagas,
    abaAtiva,
    favoritosIds,
    buscaGlobal,
    verTodos,
    filtroCurso,
    filtroPeriodo,
  ]);

  return (
    <div className="space-y-6">
      {/* Header Banner + Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5" />
              Núcleo de Estágios e Serviços Profissionais (NESP)
            </div>
            <IhcBadge
              etapa={abaAtiva === "favoritas" ? "HTA 2.B" : "HTA 1.1"}
              metodo={
                abaAtiva === "favoritas"
                  ? "Aluno.listarFavoritos()"
                  : "MuralNESP.listarVagas()"
              }
            />
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Mural de Oportunidades de Estágio
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Vagas verificadas pelo Inatel com filtro automático pelo seu perfil{" "}
            {aluno.siglaCurso} - {aluno.matricula}.
          </p>
        </div>

        {/* Segmented Tabs: Todas vs Favoritas */}
        <div
          role="tablist"
          aria-label="Visualização do mural de vagas"
          className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 shadow-sm self-start"
        >
          <button
            type="button"
            role="tab"
            aria-selected={abaAtiva === "todas"}
            onClick={() => handleTabChange("todas")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition cursor-pointer ${
              abaAtiva === "todas"
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            Explorar Vagas ({vagas.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={abaAtiva === "favoritas"}
            onClick={() => handleTabChange("favoritas")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition cursor-pointer ${
              abaAtiva === "favoritas"
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            Favoritas ({favoritosIds.length})
          </button>
        </div>
      </div>

      {/* Filters (shown on main Mural tab) */}
      {abaAtiva === "todas" && (
        <VagaFilters
          busca={buscaGlobal}
          onBuscaChange={setBuscaGlobal}
          filtroCurso={filtroCurso}
          onCursoChange={handleCursoChange}
          filtroPeriodo={filtroPeriodo}
          onPeriodoChange={handlePeriodoChange}
          verTodos={verTodos}
          onToggleVerTodos={handleToggleVerTodos}
          onResetMatricula={handleResetMatricula}
          totalFiltradas={vagasFiltradas.length}
          totalGeral={vagas.length}
        />
      )}

      {/* Results Grid or Empty State */}
      {vagasFiltradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] p-10 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            {abaAtiva === "favoritas" ? (
              <Bookmark className="h-6 w-6" />
            ) : (
              <SearchX className="h-6 w-6" />
            )}
          </div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            {abaAtiva === "favoritas"
              ? "Nenhuma vaga salva nos favoritos ainda"
              : "Nenhuma vaga encontrada com os filtros atuais"}
          </h2>
          <p className="mx-auto max-w-md text-xs sm:text-sm text-[var(--text-muted)]">
            {abaAtiva === "favoritas"
              ? "Salve vagas clicando no ícone de marcador para compará-las ou candidatar-se depois."
              : "Experimente limpar a pesquisa ou exibir todas as vagas disponíveis no NESP."}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            {abaAtiva === "favoritas" ? (
              <button
                type="button"
                onClick={() => handleTabChange("todas")}
                className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition cursor-pointer"
              >
                Explorar Mural NESP
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setVerTodos(true);
                    setBuscaGlobal("");
                  }}
                  className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition cursor-pointer"
                >
                  Ver Todas as Vagas ({vagas.length})
                </button>
                <button
                  type="button"
                  onClick={handleResetMatricula}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] transition cursor-pointer"
                >
                  Restaurar Filtros
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {vagasFiltradas.map((vaga) => (
            <VagaCard
              key={vaga.vagaId}
              vaga={vaga}
              onCandidatar={(v) => setVagaModal(v)}
            />
          ))}
        </div>
      )}

      {/* Modal 1-Toque / PDF Upload */}
      <CandidaturaModal
        vaga={vagaModal}
        isOpen={vagaModal !== null}
        onClose={() => setVagaModal(null)}
      />
    </div>
  );
}

export default function VagasPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-2xl bg-[var(--bg-surface)]" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 animate-pulse rounded-2xl bg-[var(--bg-surface)]"
              />
            ))}
          </div>
        </div>
      }
    >
      <VagasMuralContent />
    </Suspense>
  );
}

