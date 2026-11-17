"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  X,
} from "lucide-react";
import { IhcBadge } from "@/components/layout/IhcBadge";
import { CandidaturaModal } from "@/components/nesp/CandidaturaModal";
import { EmpresaAvatar } from "@/components/nesp/EmpresaAvatar";
import { useApp } from "@/context/AppContext";
import { descreverPrazo, extrairLocal } from "@/lib/prazo";

export function VagaDetalheClient({ vagaId }: { vagaId: number }) {
  const {
    aluno,
    vagas,
    isFavorita,
    toggleFavorito,
    curriculoPerfil,
    getCandidaturaPorVaga,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);

  const vaga = vagas.find((v) => v.vagaId === vagaId);

  if (!vaga) {
    return (
      <div className="card p-10 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--warning-soft)] text-[var(--warning)]">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">
          Vaga não encontrada
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Esta oportunidade foi encerrada ou removida do Mural.
        </p>
        <Link href="/vagas" className="btn btn-primary">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Mural
        </Link>
      </div>
    );
  }

  const favorita = isFavorita(vaga.vagaId);
  const candidatura = getCandidaturaPorVaga(vaga.vagaId);
  const cursoOk = vaga.cursoAlvo === aluno.curso;
  const periodoOk = vaga.periodoMinimo <= aluno.periodo;
  const prazo = descreverPrazo(vaga.prazoInscricao);

  const fatos = [
    {
      label: "Bolsa",
      valor: `R$ ${vaga.bolsaAuxilio.toLocaleString("pt-BR")}`,
    },
    { label: "Carga", valor: vaga.cargaHoraria.split("(")[0].replace(" semanais", "/sem").trim() },
    {
      label: "Inscrição",
      valor: prazo.urgente || prazo.encerrado ? prazo.texto : `Até ${vaga.prazoInscricao.slice(0, 5)}`,
      alerta: prazo.urgente,
    },
  ];

  const botaoFavoritar = (compacto = false) => (
    <button
      type="button"
      onClick={() => toggleFavorito(vaga.vagaId)}
      aria-pressed={favorita}
      aria-label={favorita ? "Remover dos favoritos" : "Salvar nos favoritos"}
      className={`btn ${compacto ? "h-12 w-12 p-0" : "w-full"} border transition ${
        favorita
          ? "border-amber-400/60 bg-amber-400/10 text-amber-600"
          : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      }`}
    >
      <Bookmark className={`h-5 w-5 ${favorita ? "fill-current animate-pop" : ""}`} />
      {!compacto && (favorita ? "Salva nos favoritos" : "Salvar nos favoritos")}
    </button>
  );

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <Link
        href="/vagas"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Mural de Vagas
      </Link>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="space-y-5 lg:col-span-8">
          {/* Hero */}
          <section className="card overflow-hidden">
            <div
              className="inatel-pattern h-16 sm:h-20"
              style={{
                background:
                  "radial-gradient(rgba(255,255,255,.16) 1px, transparent 1px) 0 0/14px 14px, linear-gradient(120deg, var(--accent), var(--accent-strong))",
              }}
            />
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="-mt-7 mb-3 flex items-end justify-between gap-3">
                <div className="rounded-2xl bg-[var(--bg-surface)] p-1">
                  <EmpresaAvatar empresa={vaga.empresa} size="lg" />
                </div>
                <IhcBadge etapa="HTA 2.A" metodo="exibirRequisitosBeneficios()" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {vaga.titulo}
              </h1>
              <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                {vaga.empresa}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="chip bg-[var(--accent-soft)] text-[var(--accent)]">
                  {vaga.area}
                </span>
                <span className="chip bg-[var(--bg-surface-muted)] text-[var(--text-secondary)]">
                  {vaga.modalidade}
                </span>
                {extrairLocal(vaga.localidade) && (
                  <span className="chip bg-[var(--bg-surface-muted)] text-[var(--text-secondary)]">
                    <MapPin className="h-3 w-3" />
                    {extrairLocal(vaga.localidade)}
                  </span>
                )}
              </div>

              <dl className="mt-5 grid grid-cols-3 divide-x divide-[var(--border-subtle)] rounded-2xl bg-[var(--bg-surface-muted)] py-3">
                {fatos.map((f) => (
                  <div key={f.label} className="px-3 text-center">
                    <dt className="text-[11px] font-semibold text-[var(--text-muted)]">
                      {f.label}
                    </dt>
                    <dd
                      className={`mt-0.5 text-sm sm:text-base font-extrabold ${
                        f.alerta ? "text-[var(--warning)]" : "text-[var(--text-primary)]"
                      }`}
                    >
                      {f.valor}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* Sobre + atividades */}
          <section className="card p-5 sm:p-6 space-y-4">
            <h2 className="section-title">Sobre a vaga</h2>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {vaga.descricao}
            </p>
            <ul className="space-y-2">
              {vaga.atividades.map((ativ) => (
                <li
                  key={ativ}
                  className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  {ativ}
                </li>
              ))}
            </ul>
          </section>

          {/* Requisitos */}
          <section className="card p-5 sm:p-6 space-y-3">
            <h2 className="section-title">Requisitos</h2>
            <ul className="space-y-2">
              {vaga.requisitos.map((req) => (
                <li
                  key={req}
                  className="flex items-center gap-2.5 text-sm font-medium text-[var(--text-primary)]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {req}
                </li>
              ))}
            </ul>
          </section>

          {/* Benefícios */}
          <section className="card p-5 sm:p-6 space-y-3">
            <h2 className="section-title">Benefícios</h2>
            <div className="flex flex-wrap gap-2">
              {vaga.beneficios.map((ben) => (
                <span
                  key={ben}
                  className="chip bg-[var(--success-soft)] py-1.5 px-3 text-xs text-[var(--success)]"
                >
                  {ben}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Painel de candidatura */}
        <aside className="lg:col-span-4">
          <div className="card sticky top-24 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Seu perfil</h2>
              <IhcBadge etapa="HTA 2.B" metodo="salvarNosFavoritos()" />
            </div>

            <ul className="space-y-2 text-sm">
              {[
                { ok: cursoOk, label: cursoOk ? "Curso compatível" : `Vaga para ${vaga.cursoAlvo.replace("Engenharia de ", "Eng. ")}` },
                { ok: periodoOk, label: periodoOk ? `${aluno.periodo}º período atende` : `Exige ${vaga.periodoMinimo}º período` },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-2.5">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      item.ok
                        ? "bg-[var(--success)] text-white"
                        : "bg-[var(--warning-soft)] text-[var(--warning)]"
                    }`}
                  >
                    {item.ok ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : (
                      <X className="h-3 w-3" strokeWidth={3} />
                    )}
                  </span>
                  <span className="text-[var(--text-secondary)]">{item.label}</span>
                </li>
              ))}
            </ul>

            {candidatura ? (
              <div className="space-y-3 rounded-2xl bg-[var(--success-soft)] p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-[var(--success)]">
                  <CheckCircle2 className="h-4 w-4" />
                  Candidatura enviada
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {candidatura.status} • #{candidatura.candidaturaId}
                </p>
                <Link href="/minhas-vagas" className="btn btn-success w-full">
                  Acompanhar status
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                      {curriculoPerfil.nomeArquivo}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Currículo padrão • {curriculoPerfil.tamanhoKB} KB
                    </p>
                  </div>
                </div>
                <div className="hidden lg:block space-y-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    disabled={prazo.encerrado}
                    className="btn btn-primary w-full py-3.5 text-sm"
                  >
                    Candidatar-se agora
                  </button>
                  {botaoFavoritar()}
                </div>
              </>
            )}
            {prazo.urgente && !candidatura && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--warning)]">
                <Clock className="h-3.5 w-3.5" />
                {prazo.texto} — não perca o prazo!
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Barra de ação fixa (mobile) */}
      <div className="lg:hidden fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-30 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          {botaoFavoritar(true)}
          {candidatura ? (
            <Link href="/minhas-vagas" className="btn btn-success h-12 flex-1">
              <CheckCircle2 className="h-4 w-4" />
              Enviada • Ver status
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              disabled={prazo.encerrado}
              className="btn btn-primary h-12 flex-1 text-sm"
            >
              Candidatar-se agora
            </button>
          )}
        </div>
      </div>

      <CandidaturaModal
        vaga={vaga}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
