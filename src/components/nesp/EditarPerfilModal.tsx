"use client";

import React, { useEffect, useState } from "react";
import {
  Accessibility,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UserCog,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { CURSOS_INATEL, gerarEmailInstitucional } from "@/data/mockData";

interface EditarPerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditarPerfilModal({ isOpen, onClose }: EditarPerfilModalProps) {
  const { aluno } = useApp();

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <EditarPerfilModalBody
      key={`${aluno.id}-${isOpen ? "open" : "closed"}`}
      onClose={onClose}
    />
  );
}

function EditarPerfilModalBody({ onClose }: { onClose: () => void }) {
  const { aluno, atualizarPerfilAluno } = useApp();

  const [nome, setNome] = useState(aluno.nome);
  const [siglaCurso, setSiglaCurso] = useState(aluno.siglaCurso);
  const [matricula, setMatricula] = useState(aluno.matricula);
  const [periodo, setPeriodo] = useState(aluno.periodo);
  const [cra, setCra] = useState(aluno.cra.toString());
  const [email, setEmail] = useState(aluno.email);
  const [telefone, setTelefone] = useState(aluno.telefone);
  const [cidade, setCidade] = useState(aluno.cidade);
  const [acessibilidade, setAcessibilidade] = useState(aluno.acessibilidade);
  const [erro, setErro] = useState("");

  const handleGerarEmail = () => {
    setEmail(gerarEmailInstitucional(nome, matricula, siglaCurso));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim().length < 3) {
      setErro("Informe o nome completo (mínimo 3 caracteres).");
      return;
    }
    if (!matricula.trim()) {
      setErro("Informe o número de matrícula.");
      return;
    }
    const craNum = Number.parseFloat(cra.replace(",", "."));
    if (Number.isNaN(craNum) || craNum < 0 || craNum > 10) {
      setErro("Informe um CRA válido entre 0.0 e 10.0.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErro("Informe um e-mail institucional válido.");
      return;
    }

    setErro("");
    const ok = atualizarPerfilAluno({
      nome,
      siglaCurso,
      matricula,
      periodo,
      cra: craNum,
      email,
      telefone,
      cidade,
      acessibilidade,
    });
    if (ok) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/65 p-0 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-editar-perfil-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-in flex w-full sm:max-w-xl max-h-[92vh] flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="modal-editar-perfil-title"
                className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]"
              >
                Editar Minhas Informações
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Alterações refletem em todo o Portal Inatel e no Mural NESP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar edição de perfil"
            className="rounded-xl p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="edit-perfil-nome"
              className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
            >
              Nome Completo
            </label>
            <input
              id="edit-perfil-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:outline-none transition"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="edit-perfil-curso"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
              >
                Curso / Sigla
              </label>
              <select
                id="edit-perfil-curso"
                value={siglaCurso}
                onChange={(e) => setSiglaCurso(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:outline-none transition"
              >
                {CURSOS_INATEL.map((c) => (
                  <option key={c.sigla} value={c.sigla}>
                    {c.sigla} — {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="edit-perfil-matricula"
                  className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
                >
                  Matrícula
                </label>
                <input
                  id="edit-perfil-matricula"
                  type="text"
                  inputMode="numeric"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:outline-none transition"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="edit-perfil-cra"
                  className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
                >
                  CRA Geral
                </label>
                <input
                  id="edit-perfil-cra"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={cra}
                  onChange={(e) => setCra(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:outline-none transition"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="edit-perfil-periodo"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
              >
                Período Atual
              </label>
              <select
                id="edit-perfil-periodo"
                value={periodo}
                onChange={(e) => setPeriodo(Number(e.target.value))}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:outline-none transition"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                  <option key={p} value={p}>
                    {p}º Período
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-perfil-telefone"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
              >
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  id="edit-perfil-telefone"
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(35) 99999-0000"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label
                htmlFor="edit-perfil-email"
                className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]"
              >
                E-mail Institucional
              </label>
              <button
                type="button"
                onClick={handleGerarEmail}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] hover:underline cursor-pointer"
              >
                <Sparkles className="h-3 w-3" />
                Gerar padrão Inatel
              </button>
            </div>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                id="edit-perfil-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-perfil-cidade"
              className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
            >
              Cidade / Região
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                id="edit-perfil-cidade"
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: Pouso Alegre / Santa Rita do Sapucaí - MG"
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Toggle Acessibilidade */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4">
            <button
              type="button"
              role="switch"
              aria-checked={acessibilidade}
              onClick={() => setAcessibilidade((prev) => !prev)}
              className="flex w-full items-center justify-between gap-3 text-left cursor-pointer"
            >
              <div className="flex items-start gap-2.5">
                <Accessibility
                  className={`h-5 w-5 shrink-0 mt-0.5 ${
                    acessibilidade
                      ? "text-[var(--success)]"
                      : "text-[var(--text-muted)]"
                  }`}
                />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    Preferência de Acessibilidade
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Usado na Reserva de Armário para priorizar unidades
                    acessíveis no campus.
                  </p>
                </div>
              </div>
              <span
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  acessibilidade
                    ? "bg-[var(--success)]"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    acessibilidade ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </span>
            </button>
          </div>

          {erro && (
            <p className="text-xs font-semibold text-red-500">{erro}</p>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-4 py-2.5 text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:border-[var(--accent)] transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[var(--accent-hover)] transition cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              Salvar Informações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

