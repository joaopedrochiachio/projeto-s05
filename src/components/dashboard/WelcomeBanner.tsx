"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BellRing,
  Bookmark,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { IhcBadge } from "@/components/layout/IhcBadge";
import { useApp } from "@/context/AppContext";
import { getPrimeiroESegundoNome } from "@/data/mockData";

export function WelcomeBanner() {
  const { aluno, vagas, favoritosIds, candidaturas } = useApp();

  const vagasCompativeis = vagas.filter(
    (v) => v.cursoAlvo === aluno.curso && v.periodoMinimo <= aluno.periodo
  );

  const ultimaCandidatura = candidaturas[0];
  const nomeSaudacao = getPrimeiroESegundoNome(aluno.nome);

  const stats = [
    {
      label: "Vagas Compatíveis",
      value: vagasCompativeis.length,
      icon: Briefcase,
      href: "/vagas",
    },
    {
      label: "Salvas",
      value: favoritosIds.length,
      icon: Bookmark,
      href: "/vagas?tab=favoritas",
    },
    {
      label: "Candidaturas",
      value: candidaturas.length,
      icon: ClipboardList,
      href: "/minhas-vagas",
    },
    {
      label: "CRA Geral",
      value: aluno.cra.toFixed(1),
      icon: Award,
      href: "/minhas-vagas",
    },
  ];

  return (
    <section
      aria-label="Resumo do aluno e alertas NESP"
      className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white shadow-lg"
      style={{
        background:
          "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
      }}
    >
      {/* Decorative subtle circles */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-black/10 blur-2xl"
      />

      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
        {/* Left: Greeting + Push Alert NESP */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {aluno.curso} • {aluno.periodo}º Período • {aluno.siglaCurso} -{" "}
                {aluno.matricula}
              </span>
            </div>
            <IhcBadge etapa="HTA 0 & 1.1" metodo="MuralNESP.acessarMural()" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Olá, {nomeSaudacao}!
            </h2>
            <p className="mt-1 text-sm text-white/85 max-w-2xl">
              Acompanhe suas disciplinas de hoje, reserve armários no campus e
              candidate-se às vagas do Mural NESP com envio em 1-toque.
            </p>
          </div>

          {/* Integrated Push Alert NESP */}
          <Link
            href="/vagas"
            className="flex items-start sm:items-center justify-between gap-3 rounded-xl border border-white/20 bg-white/12 p-3.5 backdrop-blur-sm hover:bg-white/20 transition group"
          >
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--accent)] shadow-sm">
                <BellRing className="h-4 w-4" />
              </div>
              <div className="text-xs sm:text-sm leading-snug">
                <span className="font-bold">Alerta NESP Inatel: </span>
                <span className="text-white/90">
                  {vagasCompativeis.length > 0 ? (
                    <>
                      Você possui{" "}
                      <strong>
                        {vagasCompativeis.length} vagas de estágio
                      </strong>{" "}
                      compatíveis com {aluno.siglaCurso} - {aluno.matricula}.
                    </>
                  ) : (
                    <>
                      Confira as{" "}
                      <strong>{vagas.length} oportunidades de estágio</strong>{" "}
                      disponíveis no Mural NESP.
                    </>
                  )}
                </span>
              </div>
            </div>
            <span className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--accent)] group-hover:translate-x-0.5 transition">
              Ver vagas
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Latest Application Live Pill */}
          {ultimaCandidatura && (
            <Link
              href="/minhas-vagas"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/25 border border-emerald-300/40 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500/35 transition"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-200" />
              <span>
                Candidatura #{ultimaCandidatura.candidaturaId} para{" "}
                <strong>{ultimaCandidatura.vaga.empresa}</strong>:{" "}
                <span className="underline">{ultimaCandidatura.status}</span>
              </span>
            </Link>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/vagas"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[var(--accent)] shadow-sm hover:bg-white/90 transition"
            >
              <Briefcase className="h-4 w-4" />
              Explorar Mural NESP
            </Link>
            <Link
              href="/minhas-vagas"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition"
            >
              <ClipboardList className="h-4 w-4" />
              Minhas Vagas ({candidaturas.length})
            </Link>
          </div>
        </div>

        {/* Right: Quick KPIs */}
        <div className="grid grid-cols-2 gap-3 lg:col-span-5">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col justify-between rounded-xl border border-white/15 bg-white/12 p-4 backdrop-blur-sm hover:bg-white/20 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                    {item.label}
                  </span>
                  <Icon className="h-4 w-4 text-white/85" />
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-extrabold">
                  {item.value}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

