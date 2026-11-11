"use client";

import React, { Suspense } from "react";
import { InatelLoginScreen } from "@/components/auth/InatelLoginScreen";
import { useApp } from "@/context/AppContext";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { Toast } from "./Toast";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { authReady, isAuthenticated, aluno } = useApp();

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#126ae2] border-t-transparent" />
          <span className="text-xs font-semibold tracking-wider uppercase">
            Inatel Acadêmico
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <InatelLoginScreen />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200">
      <Suspense
        fallback={
          <aside className="hidden lg:block lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)]" />
        }
      >
        <Sidebar />
      </Suspense>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <Header />
        <main
          key={aluno.id}
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-10"
        >
          {children}
        </main>
      </div>

      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>

      <Toast />
    </div>
  );
}

