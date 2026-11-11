"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  FileCheck2,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { IhcBadge } from "@/components/layout/IhcBadge";
import { useApp } from "@/context/AppContext";
import type { Candidatura, VagaEstagio } from "@/types";
import { CurriculoPreviewModal } from "./CurriculoPreviewModal";

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
          className="animate-modal-in w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--accent)]">
                  <Sparkles className="h-3 w-3" />
                  Candidatura NESP
                </span>
                <IhcBadge
                  etapa="HTA 3.1 & 3.2"
                  metodo="confirmarCandidatura()"
                />
              </div>
              <h2
                id="modal-candidatura-title"
                className="mt-1.5 text-base sm:text-lg font-extrabold text-[var(--text-primary)]"
              >
                {vaga.titulo}
              </h2>
              <p className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Building2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                {vaga.empresa} • R$ {vaga.bolsaAuxilio.toLocaleString("pt-BR")}
                /mês
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar janela de candidatura"
              className="rounded-xl p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {candidaturaFinal ? (
              <div className="space-y-4 text-center py-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--success-soft)] text-[var(--success)]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <span className="inline-block rounded-full bg-[var(--success)] px-3 py-1 text-xs font-extrabold text-white">
                    Protocolo NESP #{candidaturaFinal.candidaturaId}
                  </span>
                  <h3 className="mt-2.5 text-lg font-bold text-[var(--text-primary)]">
                    Candidatura Confirmada!
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                    Seu currículo{" "}
                    <strong>{candidaturaFinal.curriculoUsado}</strong> foi
                    encaminhado ao NESP e à empresa{" "}
                    <strong>{vaga.empresa}</strong>.
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3.5 text-left text-xs space-y-1">
                  <p className="text-[var(--text-secondary)]">
                    <strong>Status atual:</strong> {candidaturaFinal.status}
                  </p>
                  <p className="text-[var(--text-secondary)]">
                    <strong>Enviado em:</strong> {candidaturaFinal.dataEnvio}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] transition cursor-pointer"
                  >
                    Continuar Explorando
                  </button>
                  <Link
                    href="/minhas-vagas"
                    onClick={onClose}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition"
                  >
                    Acompanhar Status
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Student Confirmation */}
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3.5 text-xs">
                  <p className="font-bold text-[var(--text-primary)]">
                    Dados vinculados a {aluno.siglaCurso} - {aluno.matricula}:
                  </p>
                  <p className="mt-0.5 text-[var(--text-secondary)]">
                    {aluno.nome} • {aluno.curso} ({aluno.periodo}º período) •{" "}
                    {aluno.email}
                  </p>
                </div>

                {/* Step 3.1: PDF Selection */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Selecione o Currículo em PDF
                      </p>
                      <IhcBadge etapa="HTA 3.1" metodo="anexarArquivoPDF()" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-2.5 py-1 text-[11px] font-bold text-[var(--accent)] hover:border-[var(--accent)] transition cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Visualizar Currículo
                    </button>
                  </div>

                  {/* Option 1: 1-Toque Default Resume */}
                  <button
                    type="button"
                    onClick={() => setModoArquivo("padrao")}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition cursor-pointer ${
                      modoArquivo === "padrao"
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] hover:border-[var(--accent)]/60"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
                      <FileCheck2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                          Envio em 1-Toque (Perfil)
                        </span>
                        <span className="rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--success)]">
                          Recomendado
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs font-medium text-[var(--text-secondary)]">
                        {curriculoPerfil.nomeArquivo}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {curriculoPerfil.tamanhoKB} KB • Atualizado em{" "}
                        {curriculoPerfil.dataUpload} •{" "}
                        {curriculoDados.skills.length} skills
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Upload New PDF */}
                  <div
                    className={`rounded-xl border p-3.5 transition ${
                      modoArquivo === "novo"
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]"
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--accent)] bg-[var(--bg-surface)] text-[var(--accent)]">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                          {arquivoNovo
                            ? arquivoNovo.name
                            : "Anexar novo currículo (PDF)"}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {arquivoNovo
                            ? `${Math.max(120, Math.round(arquivoNovo.size / 1024))} KB • Pronto para envio`
                            : "Toque para selecionar um arquivo .pdf do dispositivo"}
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
                      Definir novo PDF como padrão do meu perfil NESP
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={enviando}
                    className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-4 py-3 text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:border-[var(--accent)] transition cursor-pointer disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmar}
                    disabled={enviando}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--success)] px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:opacity-90 transition cursor-pointer disabled:opacity-70"
                  >
                    {enviando ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando ao NESP...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Confirmar Candidatura
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

