"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { ToastMessage } from "@/types";

const TOAST_STYLES: Record<
  ToastMessage["type"],
  {
    icon: React.ComponentType<{ className?: string }>;
    border: string;
    iconColor: string;
    bgIcon: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    border: "border-l-4 border-l-[var(--success)]",
    iconColor: "text-[var(--success)]",
    bgIcon: "bg-[var(--success-soft)]",
  },
  info: {
    icon: Info,
    border: "border-l-4 border-l-[var(--accent)]",
    iconColor: "text-[var(--accent)]",
    bgIcon: "bg-[var(--accent-soft)]",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-l-4 border-l-[var(--warning)]",
    iconColor: "text-[var(--warning)]",
    bgIcon: "bg-[var(--warning-soft)]",
  },
  error: {
    icon: XCircle,
    border: "border-l-4 border-l-[var(--danger)]",
    iconColor: "text-[var(--danger)]",
    bgIcon: "bg-[var(--danger-soft)]",
  },
};

export function Toast() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-[68px] lg:top-auto lg:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-[60] flex flex-col gap-2.5 pointer-events-none"
    >
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];
        const Icon = style.icon;
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto animate-toast-in flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 shadow-lg ${style.border}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.bgIcon}`}
            >
              <Icon className={`h-4 w-4 ${style.iconColor}`} />
            </div>
            <p className="flex-1 text-xs sm:text-sm font-medium text-[var(--text-primary)] leading-snug">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Fechar notificação"
              className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--text-primary)] transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

