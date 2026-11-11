"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  GraduationCap,
  Trash2,
  UserPlus,
} from "lucide-react";
import { InatelLogo } from "@/components/layout/Sidebar";
import { useApp } from "@/context/AppContext";
import { CURSOS_INATEL } from "@/data/mockData";

export function InatelLoginScreen() {
  const {
    perfisSalvos,
    verificarLogin,
    criarEEntrarPerfil,
    removerPerfilSalvo,
  } = useApp();

  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [siglaCurso, setSiglaCurso] = useState("GES");
  const [matricula, setMatricula] = useState("");
  const [periodo, setPeriodo] = useState(6);
  const [erroForm, setErroForm] = useState("");

  const handleSubmitNovo = (e: React.FormEvent) => {
    e.preventDefault();
    const nomeLimpo = nome.trim();
    const matLimpa = matricula.trim();

    if (nomeLimpo.length < 3) {
      setErroForm("Informe o nome completo (mínimo 3 caracteres).");
      return;
    }
    if (!matLimpa) {
      setErroForm("Informe o número de matrícula.");
      return;
    }

    const cursoSelecionado =
      CURSOS_INATEL.find((c) => c.sigla === siglaCurso) ?? CURSOS_INATEL[0];

    setErroForm("");
    criarEEntrarPerfil({
      nome: nomeLimpo,
      siglaCurso: cursoSelecionado.sigla,
      curso: cursoSelecionado.nome,
      matricula: matLimpa,
      periodo,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col transition-colors duration-200">
      {/* Barra superior fixa azul institucional Inatel Acadêmico */}
      <header className="fixed top-0 inset-x-0 z-30 h-14 bg-gradient-to-r from-[#0054A6] via-[#0d5fc4] to-[#126ae2] shadow-md flex items-center justify-center px-4">
        <h1 className="text-base sm:text-lg font-bold tracking-wide text-white text-center">
          Inatel Acadêmico
        </h1>
      </header>

      {/* Conteúdo centralizado verticalmente */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-md space-y-6">
          {/* Logo oficial Inatel grande e centralizada em azul */}
          <div className="flex flex-col items-center text-center space-y-2.5">
            <InatelLogo
              className="w-44 sm:w-48 drop-shadow-[0_4px_16px_rgba(18,106,226,0.18)]"
              fillColor="#126ae2"
            />
            <p className="text-sm font-semibold text-[var(--text-secondary)] tracking-wide">
              {modoCadastro ? "Entrar com Outro Usuário" : "Perfis Salvos"}
            </p>
          </div>

          {/* Card Branco elegante (respeita tema ativo) */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xl space-y-4">
            {!modoCadastro ? (
              <>
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-0.5">
                  {perfisSalvos.map((perfil) => (
                    <div
                      key={perfil.id}
                      className="group relative flex items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] hover:border-[#126ae2] hover:bg-blue-500/[0.06] transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => verificarLogin(perfil.id)}
                        className="flex flex-1 items-center gap-3.5 p-4 text-left cursor-pointer min-w-0"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#126ae2]/10 border border-[#126ae2]/25 text-xs font-extrabold text-[#126ae2]">
                          {perfil.avatarIniciais}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-[#126ae2] transition-colors">
                            {perfil.nome}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                            {perfil.siglaCurso} - {perfil.matricula} •{" "}
                            {perfil.periodo}º Período
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] group-hover:text-[#126ae2] transition-colors" />
                      </button>

                      {perfisSalvos.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removerPerfilSalvo(perfil.id);
                          }}
                          aria-label={`Remover perfil ${perfil.nome}`}
                          title="Remover perfil salvo"
                          className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setErroForm("");
                    setModoCadastro(true);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#126ae2] hover:bg-[#0f5bca] py-3.5 px-4 text-sm font-semibold text-white shadow-md shadow-[#126ae2]/20 transition cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  Outro Usuário
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmitNovo} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-nome"
                    className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
                  >
                    Nome Completo
                  </label>
                  <input
                    id="login-nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Raphael Cardoso Mota Pereira"
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#126ae2] focus:bg-[var(--bg-surface)] focus:outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-curso"
                    className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
                  >
                    Curso de Graduação
                  </label>
                  <select
                    id="login-curso"
                    value={siglaCurso}
                    onChange={(e) => setSiglaCurso(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[#126ae2] focus:bg-[var(--bg-surface)] focus:outline-none transition"
                  >
                    {CURSOS_INATEL.map((c) => (
                      <option key={c.sigla} value={c.sigla}>
                        {c.sigla} — {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="login-matricula"
                      className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
                    >
                      Matrícula
                    </label>
                    <input
                      id="login-matricula"
                      type="text"
                      inputMode="numeric"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      placeholder="Ex: 1024"
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#126ae2] focus:bg-[var(--bg-surface)] focus:outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="login-periodo"
                      className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
                    >
                      Período Atual
                    </label>
                    <select
                      id="login-periodo"
                      value={periodo}
                      onChange={(e) => setPeriodo(Number(e.target.value))}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[#126ae2] focus:bg-[var(--bg-surface)] focus:outline-none transition"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                        <option key={p} value={p}>
                          {p}º Período
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {erroForm && (
                  <p className="text-xs font-semibold text-red-500">
                    {erroForm}
                  </p>
                )}

                <div className="space-y-2.5 pt-1">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#126ae2] hover:bg-[#0f5bca] py-3.5 px-4 text-sm font-semibold text-white shadow-md shadow-[#126ae2]/20 transition cursor-pointer"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Entrar e Salvar Perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setErroForm("");
                      setModoCadastro(false);
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] hover:border-[#126ae2] py-2.5 px-4 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Voltar para Perfis Salvos
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-[11px] text-[var(--text-muted)]">
            Portal Acadêmico & Mural de Estágios NESP • Dados salvos localmente
            no navegador
          </p>
        </div>
      </main>
    </div>
  );
}
