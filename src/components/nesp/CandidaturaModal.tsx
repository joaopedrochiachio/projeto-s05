"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  FileCheck2,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { IhcBadge } from "@/components/layout/IhcBadge";
import { useApp } from "@/context/AppContext";
import type { Candidatura, VagaEstagio } from "@/types";
import { CurriculoPreviewModal } from "./CurriculoPreviewModal";
import { EmpresaAvatar } from "./EmpresaAvatar";

interface CandidaturaModalProps {
  vaga: VagaEstagio | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CandidaturaModal({
  vaga,
  isOpen,
  onClose,
}: CandidaturaModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !vaga) return null;

  return (
    <CandidaturaModalBody
      key={`${vaga.vagaId}-${isOpen ? "open" : "closed"}`}
      vaga={vaga}
      onClose={onClose}
    />
  );
}

function CandidaturaModalBody({
  vaga,
  onClose,
}: {
  vaga: VagaEstagio;
  onClose: () => void;
}) {
  const {
    aluno,
    curriculoPerfil,
    curriculoDados,
    uploadCurriculo,
    enviarCandidatura,
    getCandidaturaPorVaga,
    showToast,
  } = useApp();

  const [modoArquivo, setModoArquivo] = useState<"padrao" | "novo">("padrao");
  const [arquivoNovo, setArquivoNovo] = useState<File | null>(null);
  const [salvarComoPadrao, setSalvarComoPadrao] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [enviadaAgora, setEnviadaAgora] = useState<Candidatura | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const candidaturaExistente = getCandidaturaPorVaga(vaga.vagaId);
  const candidaturaFinal = enviadaAgora ?? candidaturaExistente;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Selecione apenas arquivos em formato PDF.", "warning");
      return;
    }
    setArquivoNovo(file);
    setModoArquivo("novo");
    if (salvarComoPadrao) {
      uploadCurriculo(file);
    } else {
      showToast(`Arquivo "${file.name}" pronto para envio.`, "info");
    }
  };

  const handleConfirmar = async () => {
    if (modoArquivo === "novo" && !arquivoNovo) {
      showToast(
        "Anexe um arquivo PDF ou selecione o Currículo Padrão.",
        "warning"
      );
      return;
    }

    setEnviando(true);
    const nomeUsado =
      modoArquivo === "novo" && arquivoNovo
        ? arquivoNovo.name
        : curriculoPerfil.nomeArquivo;

    if (modoArquivo === "novo" && arquivoNovo && salvarComoPadrao) {
      uploadCurriculo(arquivoNovo);
    }

    const res = await enviarCandidatura(vaga, nomeUsado);
    setEnviando(false);
    if (res) {
      setEnviadaAgora(res);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-candidatura-title"
          onClick={(e) => e.stopPropagation()}
          className="animate-modal-in w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative px-6 pt-5 pb-4">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--border-subtle)] sm:hidden" />
            <div className="flex items-start gap-3">
              <EmpresaAvatar empresa={vaga.empresa} size="sm" />
              <div className="min-w-0 flex-1">
                <h2
                  id="modal-candidatura-title"
                  className="text-base font-extrabold leading-snug text-[var(--text-primary)]"
                >
                  {vaga.titulo}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {vaga.empresa} • R$ {vaga.bolsaAuxilio.toLocaleString("pt-BR")}/mês
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="-mr-2 -mt-1 rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progresso: 3.1 Anexar > 3.2 Confirmar > Feedback */}
            <ol className="mt-4 grid grid-cols-3 gap-1.5" aria-label="Etapas da candidatura">
              {["Currículo", "Confirmar", "Enviado"].map((etapa, i) => {
                const atual = candidaturaFinal ? 2 : enviando ? 1 : 0;
                const feito = i <= atual;
                return (
                  <li key={etapa} className="space-y-1">
                    <span
                      className={`block h-1 rounded-full transition-colors duration-300 ${
                        feito
                          ? candidaturaFinal
                            ? "bg-[var(--success)]"
                            : "bg-[var(--accent)]"
                          : "bg-[var(--border-subtle)]"
                      }`}
                    />
                    <span
                      className={`block text-[10px] font-bold ${
                        feito ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                      }`}
                    >
                      {etapa}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Body */}
          <div className="px-6 pb-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {candidaturaFinal ? (
              <div className="space-y-5 text-center pt-2 animate-fade-up">
                <div className="relative mx-auto h-20 w-20">
                  <span className="absolute inset-0 rounded-full bg-[var(--success)]/20 animate-ping [animation-iteration-count:2]" />
                  <span className="animate-pop relative flex h-20 w-20 items-center justify-center rounded-full bg-[var(--success)] text-white shadow-lg shadow-[var(--success)]/30">
                    <Check className="h-10 w-10" strokeWidth={3} />
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                    Candidatura enviada!
                  </h3>
                  <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                    Seu currículo foi encaminhado à{" "}
                    <strong>{vaga.empresa}</strong> pelo NESP.
                  </p>
                  <IhcBadge etapa="Plano 3" metodo="gerarFeedbackVisual()" />
                </div>

                <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[var(--border-subtle)] text-left text-xs">
                  <div className="bg-[var(--bg-surface-muted)] p-3">
                    <dt className="text-[var(--text-muted)]">Protocolo NESP</dt>
                    <dd className="mt-0.5 font-extrabold text-[var(--text-primary)]">
                      #{candidaturaFinal.candidaturaId}
                    </dd>
                  </div>
                  <div className="bg-[var(--bg-surface-muted)] p-3">
                    <dt className="text-[var(--text-muted)]">Status</dt>
                    <dd className="mt-0.5 font-extrabold text-[var(--success)]">
                      {candidaturaFinal.status}
                    </dd>
                  </div>
                  <div className="col-span-2 bg-[var(--bg-surface-muted)] p-3">
                    <dt className="text-[var(--text-muted)]">Arquivo enviado</dt>
                    <dd className="mt-0.5 truncate font-bold text-[var(--text-primary)]">
                      {candidaturaFinal.curriculoUsado}
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-col gap-2">
                  <Link
                    href="/minhas-vagas"
                    onClick={onClose}
                    className="btn btn-primary w-full py-3 text-sm"
                  >
                    Ver em Minhas Vagas
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn w-full text-[var(--text-secondary)] hover:text-[var(--accent)]"
                  >
                    Voltar ao Mural
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Student Confirmation */}
                <div className="flex items-center gap-3 rounded-2xl bg-[var(--bg-surface-muted)] p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                    {aluno.avatarIniciais}
                  </span>
                  <div className="min-w-0 text-xs">
                    <p className="truncate font-bold text-[var(--text-primary)]">
                      {aluno.nome}
                    </p>
                    <p className="truncate text-[var(--text-muted)]">
                      Mat. {aluno.matricula} • {aluno.siglaCurso} • {aluno.periodo}º período
                    </p>
                  </div>
                </div>

                {/* Step 3.1: PDF Selection */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        Currículo
                      </p>
                      <IhcBadge etapa="HTA 3.1" metodo="anexarArquivoPDF()" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Visualizar
                    </button>
                  </div>

                  {/* Option 1: 1-Toque Default Resume */}
                  <button
                    type="button"
                    onClick={() => setModoArquivo("padrao")}
                    className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition cursor-pointer ${
                      modoArquivo === "padrao"
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] hover:border-[var(--accent)]/60"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                      <FileCheck2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-[var(--text-primary)]">
                          {curriculoPerfil.nomeArquivo}
                        </span>
                        <span className="chip shrink-0 bg-[var(--success-soft)] text-[var(--success)]">
                          1 toque
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        Padrão do perfil • {curriculoPerfil.tamanhoKB} KB •{" "}
                        {curriculoDados.skills.length} skills
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Upload New PDF */}
                  <div
                    className={`rounded-2xl border p-3.5 transition ${
                      modoArquivo === "novo"
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]"
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-dashed border-[var(--accent)] bg-[var(--bg-surface)] text-[var(--accent)]">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                          {arquivoNovo
                            ? arquivoNovo.name
                            : "Anexar outro PDF"}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {arquivoNovo
                            ? `${Math.max(120, Math.round(arquivoNovo.size / 1024))} KB • Pronto para envio`
                            : "Selecionar arquivo do dispositivo"}
                        </p>
                      </div>
                      <FileText className="h-4 w-4 text-[var(--text-muted)]" />
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>

                    <label className="mt-3 flex items-center gap-2 text-[11px] font-medium text-[var(--text-secondary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={salvarComoPadrao}
                        onChange={(e) => setSalvarComoPadrao(e.target.checked)}
                        className="h-3.5 w-3.5 rounded accent-[var(--accent)]"
                      />
                      Usar como novo padrão do perfil
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={enviando}
                    className="btn btn-ghost flex-1 py-3 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmar}
                    disabled={enviando}
                    className="btn btn-primary flex-[2] py-3 text-sm"
                  >
                    {enviando ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando…
                      </>
                    ) : (
                      <>
                        Confirmar envio
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <CurriculoPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        arquivoOverride={modoArquivo === "novo" ? arquivoNovo : null}
      />
    </>
  );
}

