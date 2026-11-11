"use client";

import React from "react";
import { GraduationCap } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface IhcBadgeProps {
  etapa: string;
  metodo?: string;
}

export function IhcBadge({ etapa, metodo }: IhcBadgeProps) {
  const { modoAvaliacaoIhc } = useApp();

  if (!modoAvaliacaoIhc) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-amber-500/70 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold tracking-tight text-amber-700 dark:text-amber-300">
      <GraduationCap className="h-3 w-3 shrink-0" />
      <span>{etapa}</span>
      {metodo && (
        <span className="opacity-85 font-mono">• {metodo}</span>
      )}
    </span>
  );
}

