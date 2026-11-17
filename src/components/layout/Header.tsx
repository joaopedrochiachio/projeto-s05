"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  GraduationCap,
  LogOut,
  Palette,
  Search,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getPrimeiroESegundoNome } from "@/data/mockData";
import { IhcBadge } from "./IhcBadge";
import { InatelLogo, THEME_OPTIONS } from "./Sidebar";

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Início";
  if (pathname === "/vagas") return "Mural de Vagas";
  if (pathname.startsWith("/vagas/")) return "Detalhes da vaga";
  if (pathname === "/minhas-vagas") return "Minhas Vagas";
  return "Inatel Acadêmico";
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    aluno,
    logout,
    tema,
    setTema,
    modoAvaliacaoIhc,
    toggleModoAvaliacaoIhc,
    buscaGlobal,
    setBuscaGlobal,
    notificacoes,
    naoLidasCount,
    marcarNotificacaoLida,
    marcarTodasLidas,
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const pageTitle = getPageTitle(pathname);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setThemeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathname !== "/vagas") {
      router.push("/vagas");
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-[var(--accent)] lg:bg-[var(--bg-surface)]/90 lg:border-b lg:border-[var(--border-subtle)] backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-3 px-4 py-2.5 sm:px-6 lg:py-3 lg:px-8">
        {/* Left: Mobile Logo or Desktop Context */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="lg:hidden shrink-0" aria-label="Início">
            <InatelLogo className="w-[72px]" fillColor="#ffffff" />
          </Link>
          <h1 className="hidden lg:block truncate text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
            {pageTitle}
          </h1>
        </div>

        {/* Center/Right: Quick Search + Actions */}
        <div className="flex flex-1 lg:flex-none items-center justify-end gap-2 sm:gap-2.5">
          {/* Quick Search Desktop & Tablet */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden lg:block lg:w-64 xl:w-72"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              value={buscaGlobal}
              onChange={(e) => setBuscaGlobal(e.target.value)}
              placeholder="Buscar vagas"
              aria-label="Busca rápida de vagas"
              className="w-full rounded-full border border-transparent bg-[var(--bg-surface-muted)] py-2.5 pl-9 pr-8 text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] focus:outline-none transition"
            />
            {buscaGlobal && (
              <button
                type="button"
                onClick={() => setBuscaGlobal("")}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {/* Mobile Theme & IHC Mode Selector */}
          <div ref={themeRef} className="relative lg:hidden">
            <button
              type="button"
              onClick={() => {
                setThemeOpen((prev) => !prev);
                setNotifOpen(false);
              }}
              aria-label="Aparência e Modo Avaliação"
              aria-expanded={themeOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition cursor-pointer"
            >
              <Palette className="h-[18px] w-[18px]" />
            </button>

            {themeOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 shadow-xl animate-modal-in space-y-1">
                <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Tema Visual
                </p>
                {THEME_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = tema === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setTema(opt.key);
                        setThemeOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition cursor-pointer ${
                        active
                          ? "bg-[var(--accent)] text-white"
                          : "text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]"
                      }`}
                    >
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full"
                        style={{ backgroundColor: opt.swatch }}
                      >
                        <Icon className="h-3 w-3 text-white" />
                      </span>
                      {opt.label}
                    </button>
                  );
                })}

                <div className="my-1 border-t border-[var(--border-subtle)] pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      toggleModoAvaliacaoIhc();
                      setThemeOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition cursor-pointer ${
                      modoAvaliacaoIhc
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Guia HTA / IHC
                    </span>
                    <span className="text-[10px] font-bold">
                      {modoAvaliacaoIhc ? "ON" : "OFF"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell + Popover (NotificacaoPush) */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen((prev) => !prev);
                setThemeOpen(false);
              }}
              aria-label="Notificações"
              aria-expanded={notifOpen}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 lg:bg-[var(--bg-surface-muted)] lg:text-[var(--text-secondary)] lg:hover:text-[var(--accent)] lg:hover:bg-[var(--accent-soft)] transition cursor-pointer"
            >
              <Bell className="h-[18px] w-[18px]" />
              {naoLidasCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold text-white ring-2 ring-[var(--accent)] lg:ring-[var(--bg-surface)]">
                  {naoLidasCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl animate-modal-in overflow-hidden">
                <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-[var(--text-primary)]">
                      Notificações
                    </h2>
                    <IhcBadge etapa="HTA 0" metodo="NotificacaoPush" />
                  </div>
                  {naoLidasCount > 0 && (
                    <button
                      type="button"
                      onClick={marcarTodasLidas}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] transition cursor-pointer shrink-0"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Marcar como lidas
                    </button>
                  )}
                </div>

                <div className="max-h-80 divide-y divide-[var(--border-subtle)] overflow-y-auto">
                  {notificacoes.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        marcarNotificacaoLida(item.id);
                        setNotifOpen(false);
                      }}
                      className={`block px-4 py-3 transition hover:bg-[var(--bg-surface-muted)] ${
                        !item.lida ? "bg-[var(--accent-soft)]/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-[var(--text-primary)]">
                          {item.titulo}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {item.tempo}
                          </span>
                          {!item.lida && (
                            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                          )}
                        </div>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                        {item.descricao}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Student Quick Badge */}
          <Link
            href="/minhas-vagas"
            className="hidden lg:flex items-center gap-2 rounded-full bg-[var(--bg-surface-muted)] py-1 pl-1 pr-3.5 hover:bg-[var(--accent-soft)] transition"
            title="Ver Meu Perfil e Candidaturas"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
              {aluno.avatarIniciais}
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-bold text-[var(--text-primary)] max-w-[110px] truncate">
                {getPrimeiroESegundoNome(aluno.nome)}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">
                {aluno.siglaCurso} • {aluno.periodo}º período
              </p>
            </div>
          </Link>

          {/* Switch Profile / Logout Button */}
          <button
            type="button"
            onClick={logout}
            aria-label="Trocar perfil ou sair"
            title="Trocar perfil / Sair"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 lg:bg-transparent lg:text-[var(--text-muted)] lg:hover:bg-[var(--danger-soft)] lg:hover:text-[var(--danger)] transition cursor-pointer"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
