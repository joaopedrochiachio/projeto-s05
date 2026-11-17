"use client";

import React, { useState } from "react";
import {
  Accessibility,
  Archive,
  CheckCircle2,
  Clock,
  MapPin,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export function ArmarioWidget() {
  const {
    aluno,
    armarios,
    armarioReservado,
    reservarArmario,
    liberarArmario,
  } = useApp();

  const [tipoSelecionado, setTipoSelecionado] = useState<
    "padrao" | "duplo" | null
  >(null);
  const [erroInline, setErroInline] = useState<string>("");

  const disponiveisPadrao = armarios.filter(
    (a) =>
      a.formato === "padrao" &&
      a.status &&
      a.acessivel === aluno.acessibilidade
  ).length;

  const disponiveisDuplo = armarios.filter(
    (a) =>
      a.formato === "duplo" &&
      a.status &&
      a.acessivel === aluno.acessibilidade
  ).length;

  const handleReservar = () => {
    if (!tipoSelecionado) {
      setErroInline("Selecione um formato de armário (Padrão ou Duplo) primeiro.");
      return;
    }
    const res = reservarArmario(tipoSelecionado);
    if (!res.ok) {
      setErroInline(res.message);
    } else {
      setErroInline("");
    }
  };

  return (
    <section
      id="armarios"
      aria-labelledby="heading-armarios"
      className="card flex h-full flex-col justify-between p-5"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h2 id="heading-armarios" className="section-title">
            Armário
          </h2>

          {aluno.acessibilidade && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--success)]">
              <Accessibility className="h-3 w-3" />
              Acessível
            </span>
          )}
        </div>

        {/* Active Reservation Receipt */}
        {armarioReservado ? (
          <div className="rounded-xl border border-[var(--success)]/30 bg-[var(--success-soft)] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success)] px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Armário Nº {armarioReservado.id}
              </span>
              <span className="rounded-lg bg-[var(--bg-surface)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-primary)] border border-[var(--border-subtle)]">
                {armarioReservado.protocolo}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-[var(--text-primary)]">
              <p className="flex items-center gap-1.5 font-medium">
                <MapPin className="h-3.5 w-3.5 text-[var(--success)] shrink-0" />
                {armarioReservado.localizacao} (
                {armarioReservado.formato === "padrao" ? "Padrão" : "Duplo"})
              </p>
              <p className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <Clock className="h-3.5 w-3.5 text-[var(--success)] shrink-0" />
                <span>
                  Reserva: <strong>{armarioReservado.dataReserva}</strong>
                </span>
              </p>
              <p className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <Clock className="h-3.5 w-3.5 text-[var(--warning)] shrink-0" />
                <span>
                  Devolução até: <strong>{armarioReservado.dataEntrega}</strong>
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={liberarArmario}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Devolver / Liberar Armário
            </button>
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">
            Escolha o formato e sorteie um armário por 24h.
          </p>
        )}

        {/* Format Options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setTipoSelecionado("padrao");
              setErroInline("");
            }}
            className={`flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition cursor-pointer ${
              tipoSelecionado === "padrao"
                ? "border-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] hover:border-[var(--accent)]/60"
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <Archive className="h-4 w-4 text-[var(--accent)]" />
              <span className="rounded-full bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]">
                {disponiveisPadrao} livres
              </span>
            </div>
            <span className="mt-1 text-sm font-bold text-[var(--text-primary)]">
              Padrão
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              1 porta
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTipoSelecionado("duplo");
              setErroInline("");
            }}
            className={`flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition cursor-pointer ${
              tipoSelecionado === "duplo"
                ? "border-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] hover:border-[var(--accent)]/60"
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <Archive className="h-4 w-4 text-[var(--accent)]" />
              <span className="rounded-full bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]">
                {disponiveisDuplo} livres
              </span>
            </div>
            <span className="mt-1 text-sm font-bold text-[var(--text-primary)]">
              Duplo
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              2 portas
            </span>
          </button>
        </div>

        {erroInline && (
          <p className="text-xs font-semibold text-[var(--warning)]">
            {erroInline}
          </p>
        )}
      </div>

      {/* Reserve CTA */}
      <button
        type="button"
        onClick={handleReservar}
        className="btn btn-primary mt-4 w-full"
      >
        <Shuffle className="h-4 w-4" />
        {armarioReservado
          ? "Sortear outro"
          : "Sortear armário"}
      </button>
    </section>
  );
}

