"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, SearchX } from "lucide-react";
import { IhcBadge } from "@/components/layout/IhcBadge";
import { CandidaturaModal } from "@/components/nesp/CandidaturaModal";
import { VagaCard } from "@/components/nesp/VagaCard";
import { NespTabs } from "@/components/nesp/NespTabs";
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
    <div className="space-y-5">
      {/* Título + Abas (wireframe: Mural | Favoritas | Minhas) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] lg:sr-only">
            {abaAtiva === "favoritas" ? "Vagas salvas" : "Vagas NESP"}
          </h1>
          <IhcBadge
            etapa={abaAtiva === "favoritas" ? "HTA 2.B" : "HTA 1.1"}
            metodo={
              abaAtiva === "favoritas"
                ? "Aluno.vagasFavoritas"
                : "UsuarioApp.acessarAbaVagas()"
            }
          />
        </div>
        <NespTabs ativa={abaAtiva === "favoritas" ? "favoritas" : "mural"} />
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
        <div className="card p-10 text-center space-y-3 animate-fade-up">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            {abaAtiva === "favoritas" ? (
              <Bookmark className="h-6 w-6" />
            ) : (
              <SearchX className="h-6 w-6" />
            )}
          </div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            {abaAtiva === "favoritas"
              ? "Nenhuma vaga salva"
              : "Nenhuma vaga encontrada"}
          </h2>
          <p className="mx-auto max-w-md text-xs sm:text-sm text-[var(--text-muted)]">
            {abaAtiva === "favoritas"
              ? "Toque no marcador de uma vaga para revisá-la depois."
              : "Limpe a busca ou veja todas as vagas do NESP."}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            {abaAtiva === "favoritas" ? (
              <button
                type="button"
                onClick={() => handleTabChange("todas")}
                className="btn btn-primary"
              >
                Ir para o Mural
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setVerTodos(true);
                    setBuscaGlobal("");
                  }}
                  className="btn btn-primary"
                >
                  Ver todas ({vagas.length})
                </button>
                <button
                  type="button"
                  onClick={handleResetMatricula}
                  className="btn btn-ghost"
                >
                  Restaurar filtros
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
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

