"use client";

import React from "react";
import { AlertTriangle, CalendarClock, MapPin, User } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function AulasGrid() {
  const { aulas } = useApp();

  return (
    <section aria-labelledby="heading-aulas" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 id="heading-aulas" className="section-title">
          Aulas de hoje
        </h2>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
          <CalendarClock className="h-3.5 w-3.5" />
          Terça • 2026/2
        </span>
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-3">
        {aulas.map((aula) => {
          const notaNum = Number(aula.nota);
          const notaBoa = !Number.isNaN(notaNum) && notaNum >= 7;
          const pctFaltas = Math.min(
            100,
            Math.round((aula.faltasAtuais / aula.limiteFaltas) * 100)
          );
          const nomeDisciplina = aula.disciplina.replace(`${aula.codigo} - `, "");

          return (
            <article
              key={aula.id}
              className="card flex w-[82%] shrink-0 snap-start flex-col justify-between p-4 sm:w-[60%] md:w-auto"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-extrabold text-[var(--accent)]">
                    {aula.codigo}
                  </span>
                  <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums">
                    {aula.horario}
                  </span>
                </div>

                <h3 className="mt-2.5 text-[15px] font-bold leading-snug text-[var(--text-primary)] line-clamp-2 min-h-[2.6rem]">
                  {nomeDisciplina}
                </h3>

                <p className="mt-1.5 flex items-center gap-1.5 truncate text-xs text-[var(--text-muted)]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {aula.local}
                  <span aria-hidden>•</span>
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{aula.professor.replace(/^Prof(a)?\.( Me\.| Dr(a)?\.)? /, "")}</span>
                </p>
              </div>

              <div className="mt-4 space-y-2.5">
                {aula.prova_alert && (
                  <p className="flex items-center gap-1.5 rounded-lg bg-[var(--warning-soft)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--warning)]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Prova em {aula.prova}
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between text-[11px] font-semibold text-[var(--text-muted)]">
                      <span>Faltas</span>
                      <span className="tabular-nums">
                        {aula.faltasAtuais}/{aula.limiteFaltas}
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
                  <div
                    className={`flex h-10 w-12 flex-col items-center justify-center rounded-xl ${
                      notaBoa
                        ? "bg-[var(--success-soft)] text-[var(--success)]"
                        : "bg-[var(--warning-soft)] text-[var(--warning)]"
                    }`}
                    title="Nota parcial"
                  >
                    <span className="text-[9px] font-bold uppercase leading-none opacity-80">
                      Nota
                    </span>
                    <span className="text-sm font-extrabold leading-tight">
                      {aula.nota}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
