"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Bookmark,
  Briefcase,
  ClipboardCheck,
  LayoutDashboard,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { favoritosIds, candidaturas } = useApp();

  const items = [
    {
      href: "/",
      label: "Início",
      icon: LayoutDashboard,
      active: pathname === "/",
      badge: 0,
    },
    {
      href: "/vagas",
      label: "Vagas",
      icon: Briefcase,
      active:
        (pathname === "/vagas" && tabParam !== "favoritas") ||
        pathname.startsWith("/vagas/"),
      badge: 0,
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
      label: "Minhas",
      icon: ClipboardCheck,
      active: pathname === "/minhas-vagas",
      badge: candidaturas.length,
    },
  ];

  return (
    <nav
      aria-label="Navegação mobile"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(15,27,45,0.05)]"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 pt-2.5 pb-2 text-[11px] font-semibold transition ${
                item.active
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {item.active && (
                <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-[var(--accent)]" />
              )}
              <div className="relative">
                <Icon className="h-[22px] w-[22px]" strokeWidth={item.active ? 2.4 : 2} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[9px] font-bold text-white ring-2 ring-[var(--bg-surface)]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

