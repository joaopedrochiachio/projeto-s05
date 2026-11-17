"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BellRing, Briefcase, ChevronRight } from "lucide-react";
import { IhcBadge } from "@/components/layout/IhcBadge";
import { useApp } from "@/context/AppContext";
import { getPrimeiroNome } from "@/data/mockData";
import { diasAte } from "@/lib/prazo";

export function WelcomeBanner() {
  const { aluno, vagas, favoritosIds, candidaturas } = useApp();

  const vagasCompativeis = vagas.filter(
    (v) => v.cursoAlvo === aluno.curso && v.periodoMinimo <= aluno.periodo
  );

  // Alerta de prazo (NotificacaoPush.dispararAlertaPrazo): vaga compatível
  // ainda sem candidatura com inscrição encerrando mais cedo.
  const proximoPrazo = vagasCompativeis
    .filter((v) => !candidaturas.some((c) => c.vaga.vagaId === v.vagaId))
    .map((v) => ({ vaga: v, dias: diasAte(v.prazoInscricao) }))
    .filter((x): x is { vaga: typeof x.vaga; dias: number } => x.dias !== null && x.dias >= 0)
    .sort((a, b) => a.dias - b.dias)[0];

  const stats = [
    { label: "Compatíveis", value: vagasCompativeis.length, href: "/vagas" },
    { label: "Favoritas", value: favoritosIds.length, href: "/vagas?tab=favoritas" },
    { label: "Candidaturas", value: candidaturas.length, href: "/minhas-vagas" },
  ];

  return (
    <section
      aria-label="Resumo do aluno"
      className="relative overflow-hidden rounded-3xl text-white shadow-[0_12px_32px_-12px_rgba(18,106,226,0.55)]"
      style={{
        background:
          "linear-gradient(140deg, var(--accent) 0%, var(--accent-strong) 100%)",
      }}
    >
      <div aria-hidden="true" className="inatel-pattern absolute inset-0 opacity-60 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full border-[28px] border-white/[0.07]"
      />

      <div className="relative grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-12 lg:items-end">
        <div className="min-w-0 space-y-5 lg:col-span-7">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white/75">
                {aluno.curso} • {aluno.periodo}º período
              </p>
              <IhcBadge etapa="HTA 1.1" metodo="acessarAbaVagas()" />
            </div>
            <h2 className="mt-1 text-[28px] sm:text-4xl font-extrabold tracking-tight">
              Olá, {getPrimeiroNome(aluno.nome)}!
            </h2>
          </div>

          {/* Push NESP: novas vagas + prazo */}
          <Link
            href={proximoPrazo ? `/vagas/${proximoPrazo.vaga.vagaId}` : "/vagas"}
            className="group flex items-center gap-3 rounded-2xl bg-white/12 p-3 ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/20"
          >
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--accent)]">
              <BellRing className="h-[18px] w-[18px]" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
            </span>
            <span className="min-w-0 flex-1 text-sm leading-snug">
              <strong className="block">
                {vagasCompativeis.length} vagas para o seu perfil
              </strong>
              <span className="block text-white/75 line-clamp-2">
                {proximoPrazo
                  ? proximoPrazo.dias === 0
                    ? `${proximoPrazo.vaga.empresa}: inscrição encerra hoje`
                    : `${proximoPrazo.vaga.empresa}: encerra em ${proximoPrazo.dias} dia${proximoPrazo.dias > 1 ? "s" : ""}`
                  : "Confira as novidades do NESP"}
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-white/70 transition group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/vagas"
            className="btn bg-white text-[var(--accent)] hover:bg-white/90 w-full sm:w-auto"
          >
            <Briefcase className="h-4 w-4" />
            Abrir Mural de Vagas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-3 divide-x divide-white/15 rounded-2xl bg-black/10 ring-1 ring-white/10 lg:col-span-5">
          {stats.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-3 py-3.5 text-center transition hover:bg-white/5 first:rounded-l-2xl last:rounded-r-2xl"
            >
              <p className="text-2xl sm:text-3xl font-extrabold tabular-nums">
                {item.value}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-white/70">
                {item.label}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
