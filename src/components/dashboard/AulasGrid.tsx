"use client";

import React from "react";
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  MapPin,
  User,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export function AulasGrid() {
  const { aulas } = useApp();

  return (
    <section aria-labelledby="heading-aulas" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h2
              id="heading-aulas"
              className="text-lg font-bold text-[var(--text-primary)]"
            >
              Disciplinas de Hoje
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Frequência, notas parciais e alertas de avaliações
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
          <CalendarClock className="h-3.5 w-3.5 text-[var(--accent)]" />
          Terça-feira • Semestre 2026/2
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {aulas.map((aula) => {
          const notaNum = Number(aula.nota);
          const notaBoa = !Number.isNaN(notaNum) && notaNum >= 7;
          const pctFaltas = Math.min(
            100,
            Math.round((aula.faltasAtuais / aula.limiteFaltas) * 100)
          );

          return (
            <article
              key={aula.id}
              className="flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] hover:border-[var(--accent)]/50 transition"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center rounded-lg bg-[var(--accent)] px-2.5 py-1 text-xs font-extrabold text-white">
                    {aula.codigo}
                  </span>

                  {aula.prova_alert ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--warning-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--warning)]">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Prova: {aula.prova}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--success)]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Em dia
                    </span>
                  )}
                </div>

                {/* Subject title */}
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug line-clamp-2 min-h-[2.6rem]">
                  {aula.disciplina}
                </h3>

                {/* Meta details */}
                <div className="mt-3 space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                    <span>
                      Sala <strong>{aula.local}</strong> •{" "}
                      <strong>{aula.horario}</strong>
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <User className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                    <span className="truncate">{aula.professor}</span>
                  </p>
                </div>
              </div>

              {/* Bottom metrics */}
              <div className="mt-4 pt-3.5 border-t border-[var(--border-subtle)] space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                    <span className="text-[var(--text-muted)]">
                      Faltas ({aula.frequencia})
                    </span>
                    <span className="text-[var(--text-primary)]">
                      {aula.faltasAtuais}/{aula.limiteFaltas} aulas
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-muted)]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pctFaltas}%`,
                        backgroundColor:
                          pctFaltas > 60 ? "var(--warning)" : "var(--accent)",
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    Desempenho (CR)
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                      notaBoa
                        ? "bg-[var(--success-soft)] text-[var(--success)]"
                        : "bg-[var(--warning-soft)] text-[var(--warning)]"
                    }`}
                  >
                    CR: {aula.nota}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

