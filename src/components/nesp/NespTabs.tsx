"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export type NespTabKey = "mural" | "favoritas" | "minhas";

/** Abas do wireframe (telas 03, 05 e 08): Mural | Favoritas | Minhas. */
export function NespTabs({ ativa }: { ativa: NespTabKey }) {
  const { favoritosIds, candidaturas } = useApp();

  const tabs: { key: NespTabKey; label: string; href: string; count?: number }[] = [
    { key: "mural", label: "Mural", href: "/vagas" },
    {
      key: "favoritas",
      label: "Favoritas",
      href: "/vagas?tab=favoritas",
      count: favoritosIds.length,
    },
    {
      key: "minhas",
      label: "Minhas",
      href: "/minhas-vagas",
      count: candidaturas.length,
    },
  ];

  return (
    <nav
      aria-label="Seções do Mural NESP"
      className="grid grid-cols-3 rounded-2xl bg-[var(--bg-surface)] p-1 border border-[var(--border-subtle)] sm:inline-grid sm:min-w-[360px]"
    >
      {tabs.map((t) => {
        const active = t.key === ativa;
        return (
          <Link
            key={t.key}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-bold transition ${
              active
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--accent)]"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`rounded-full px-1.5 text-[10px] leading-4 ${
                  active
                    ? "bg-white/25 text-white"
                    : "bg-[var(--accent-soft)] text-[var(--accent)]"
                }`}
              >
                {t.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
