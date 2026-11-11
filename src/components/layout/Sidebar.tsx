"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Accessibility,
  Bookmark,
  Briefcase,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { TemaKey } from "@/types";

export const THEME_OPTIONS: {
  key: TemaKey;
  label: string;
  swatch: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "inatel", label: "Inatel", swatch: "#126ae2", icon: Sun },
  { key: "dark", label: "Dark", swatch: "#0f172a", icon: Moon },
  { key: "limao", label: "Limão", swatch: "#9fd64b", icon: Sparkles },
];

export function InatelLogo({
  className = "w-24",
  fillColor,
}: {
  className?: string;
  fillColor?: string;
}) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="100 150 390 116"
      aria-label="Inatel"
      role="img"
    >
      <path
        style={{ fill: fillColor ?? "var(--accent)" }}
        d="M127.455,156.988h21.287l-21.859,102.835H105.69L127.455,156.988L127.455,156.988z M225.618,208.048 l-10.941,51.775H194.51l9.726-45.911c0.286-1.168,0.477-2.312,0.62-3.456c0.143-1.144,0.214-2.145,0.214-3.027 c0-2.86-0.834-4.982-2.527-6.412c-1.668-1.407-4.147-2.122-7.461-2.122c-5.078,0-9.392,1.406-12.968,4.219 c-3.552,2.836-5.888,6.698-6.96,11.633l-9.559,45.076h-20.31l16.186-75.946h19.905l-2.002,9.559 c3.957-3.886,8.105-6.794,12.491-8.701c4.362-1.907,9.011-2.86,13.945-2.86c6.508,0,11.656,1.501,15.447,4.529 c3.79,3.027,5.697,7.151,5.697,12.372c0,1.239-0.096,2.55-0.286,3.933S226.143,205.855,225.618,208.048L225.618,208.048z M282.709,222.636c-3.29,1.455-7.318,2.646-12.038,3.6c-4.744,0.954-7.557,1.55-8.438,1.788c-3.218,0.978-5.674,2.526-7.414,4.648 c-1.716,2.122-2.574,4.672-2.574,7.652c0,2.074,0.739,3.719,2.24,4.887c1.478,1.168,3.552,1.74,6.222,1.74 c5.078,0,9.487-1.574,13.206-4.721s6.15-7.342,7.271-12.61L282.709,222.636L282.709,222.636z M306.333,202.613l-9.154,43.145 c-0.238,1.313-0.405,2.432-0.524,3.361s-0.167,1.717-0.167,2.385c0,1.168,0.167,2.098,0.548,2.789 c0.381,0.715,1.049,1.406,2.026,2.098l-0.763,3.432h-21.025c-0.048-0.285-0.143-0.643-0.286-1.119 c-0.381-1.813-0.572-3.076-0.572-3.768c0-0.428,0.048-1,0.119-1.715c0.072-0.74,0.167-1.574,0.31-2.551 c-3.218,3.861-7.032,6.793-11.49,8.818c-4.458,2.027-9.344,3.053-14.708,3.053c-5.721,0-10.274-1.455-13.659-4.338 c-3.361-2.885-5.054-6.771-5.054-11.658c0-9.51,2.574-16.876,7.724-22.097c5.125-5.197,13.206-8.629,24.171-10.25 c1.788-0.287,4.195-0.645,7.271-1.049c10.131-1.168,15.185-4.53,15.185-10.108c0-2.098-0.834-3.623-2.527-4.577 c-1.669-0.954-4.338-1.43-8.033-1.43c-4.195,0-7.581,0.93-10.131,2.813c-2.574,1.883-4.052,4.529-4.481,7.914h-19.166 c1.359-8.2,5.292-14.684,11.824-19.451c6.507-4.768,14.731-7.151,24.672-7.151c8.987,0,15.971,1.454,20.954,4.362 s7.484,6.984,7.484,12.205c0,0.834-0.047,1.668-0.143,2.503C306.642,201.063,306.5,201.874,306.333,202.613L306.333,202.613z M335.081,163.281h20.31l-4.338,20.595h12.634l-3.004,14.303h-12.776l-8.844,42.026c0,0.238-0.048,0.547-0.144,0.93 c-0.095,0.404-0.144,0.668-0.144,0.811c0,1.119,0.549,1.93,1.67,2.406c1.119,0.502,3.051,0.74,5.792,0.74h4.409l-3.289,15.303 c-1.168,0.049-2.717,0.096-4.672,0.145c-3.528,0.094-5.84,0.143-6.913,0.143c-6.508,0-11.18-0.883-14.017-2.646 c-2.837-1.787-4.267-4.672-4.267-8.678c0-1.119,0.118-2.455,0.357-4.051c0.214-1.574,0.596-3.6,1.12-6.08l8.701-41.048h-10.752 l3.004-14.303h10.895L335.081,163.281L335.081,163.281z M432.339,227.213H383.4c-0.167,1.025-0.311,2.026-0.405,3.004 s-0.144,1.835-0.144,2.574c0,4.1,0.978,7.199,2.956,9.297s4.911,3.146,8.772,3.146c3.266,0,6.031-0.668,8.344-1.979 c2.313-1.334,4.434-3.48,6.389-6.46h20.309c-3.576,7.962-8.914,14.208-16.018,18.761c-7.105,4.553-14.994,6.842-23.695,6.842 c-8.63,0-15.424-2.551-20.43-7.676c-5.006-5.127-7.508-12.016-7.508-20.692c0-6.197,1.096-12.609,3.289-19.236 c2.17-6.627,5.077-12.325,8.725-17.092c4.172-5.435,9.059-9.559,14.588-12.348c5.531-2.789,11.633-4.195,18.283-4.195 c8.939,0,15.924,2.36,20.955,7.104c5.029,4.72,7.531,11.275,7.531,19.666c0,2.193-0.213,4.696-0.666,7.534 C434.246,218.322,433.458,222.232,432.339,227.213L432.339,227.213z M414.46,213.912c0.143-1.119,0.262-2.098,0.334-2.955 c0.07-0.858,0.096-1.55,0.096-2.05c0-3.385-0.979-6.031-2.957-7.914s-4.768-2.813-8.344-2.813c-4.146,0-7.676,1.335-10.607,4.005 s-5.172,6.579-6.697,11.728H414.46L414.46,213.912z M461.826,156.988h20.311l-21.932,102.835h-20.262L461.826,156.988 L461.826,156.988z"
      />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const {
    aluno,
    logout,
    tema,
    setTema,
    modoAvaliacaoIhc,
    toggleModoAvaliacaoIhc,
    vagas,
    favoritosIds,
    candidaturas,
  } = useApp();

  const vagasCompativeisCount = vagas.filter(
    (v) => v.cursoAlvo === aluno.curso && v.periodoMinimo <= aluno.periodo
  ).length;

  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/",
      badge: null as number | null,
    },
    {
      href: "/vagas",
      label: "Mural NESP",
      icon: Briefcase,
      active:
        (pathname === "/vagas" && tabParam !== "favoritas") ||
        pathname.startsWith("/vagas/"),
      badge: vagasCompativeisCount,
    },
    {
      href: "/vagas?tab=favoritas",
      label: "Favoritas",
      icon: Bookmark,
      active: pathname === "/vagas" && tabParam === "favoritas",
      badge: favoritosIds.length,
    },
    {
      href: "/minhas-vagas",
      label: "Minhas Vagas",
      icon: ClipboardCheck,
      active: pathname === "/minhas-vagas",
      badge: candidaturas.length,
    },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 z-30 border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] transition-colors duration-200">
      {/* Brand */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
        <Link href="/" className="flex flex-col gap-1 group">
          <InatelLogo className="w-24 transition-transform group-hover:scale-[1.02]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Portal Acadêmico & NESP
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Menu principal"
        className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto"
      >
        <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Navegação
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                item.active
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </span>
              {item.badge !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    item.active
                      ? "bg-white/20 text-white"
                      : "bg-[var(--accent-soft)] text-[var(--accent)]"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Theme Switcher */}
        <div className="pt-6">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Aparência (Tema)
          </p>
          <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-[var(--bg-surface-muted)] p-1.5 border border-[var(--border-subtle)]">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const selected = tema === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setTema(opt.key)}
                  className={`flex flex-col items-center gap-1 rounded-lg py-2 px-1 text-[11px] font-semibold transition cursor-pointer ${
                    selected
                      ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
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
          </div>
        </div>

        {/* Toggle Guia HTA / IHC (Avaliação) */}
        <div className="pt-4">
          <button
            type="button"
            role="switch"
            aria-checked={modoAvaliacaoIhc}
            onClick={toggleModoAvaliacaoIhc}
            className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition cursor-pointer ${
              modoAvaliacaoIhc
                ? "border-amber-500/60 bg-amber-500/10 text-[var(--text-primary)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:border-[var(--accent)]/50"
            }`}
          >
            <span className="flex items-center gap-2 min-w-0">
              <GraduationCap
                className={`h-4 w-4 shrink-0 ${
                  modoAvaliacaoIhc
                    ? "text-amber-500"
                    : "text-[var(--text-muted)]"
                }`}
              />
              <span className="text-[11px] font-semibold leading-tight">
                Guia HTA / IHC
                <span className="block text-[10px] text-[var(--text-muted)]">
                  Modo Avaliação
                </span>
              </span>
            </span>
            <span
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                modoAvaliacaoIhc
                  ? "bg-amber-500"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  modoAvaliacaoIhc ? "translate-x-4.5" : "translate-x-1"
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Student Card + Switch Profile / Logout */}
      <div className="p-4 border-t border-[var(--border-subtle)] space-y-2">
        <Link
          href="/minhas-vagas"
          className="flex items-center gap-3 rounded-xl bg-[var(--bg-surface-muted)] p-3 border border-[var(--border-subtle)] hover:border-[var(--accent)] transition"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-white shadow-sm">
            {aluno.avatarIniciais}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[var(--text-primary)]">
              {aluno.nome}
            </p>
            <p className="truncate text-xs text-[var(--text-muted)]">
              {aluno.siglaCurso} - {aluno.matricula} • {aluno.periodo}º Período
            </p>
            {aluno.acessibilidade && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--success)]">
                <Accessibility className="h-3 w-3" />
                Acessibilidade
              </span>
            )}
          </div>
        </Link>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-bold text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          Trocar Perfil / Sair
        </button>
      </div>
    </aside>
  );
}
