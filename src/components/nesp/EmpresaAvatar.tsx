import React from "react";

const PALETA = [
  ["#126ae2", "#0a3f8f"],
  ["#0e9f9a", "#0b6e6b"],
  ["#6d4ae0", "#4527a0"],
  ["#e2741b", "#b4500b"],
  ["#1f8f4e", "#136235"],
  ["#d6336c", "#a01e4e"],
];

function hash(texto: string): number {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h;
}

export function getIniciaisEmpresa(empresa: string): string {
  const palavras = empresa
    .replace(/\(.*?\)/g, "")
    .split(/[\s&]+/)
    .filter((p) => p.length > 2 || /^[A-Z]{2,}$/.test(p));
  return palavras
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

/** Monograma colorido da empresa (substitui logos reais no protótipo). */
export function EmpresaAvatar({
  empresa,
  size = "md",
}: {
  empresa: string;
  size?: "sm" | "md" | "lg";
}) {
  const [c1, c2] = PALETA[hash(empresa) % PALETA.length];
  const dims =
    size === "lg"
      ? "h-14 w-14 rounded-2xl text-lg"
      : size === "sm"
        ? "h-9 w-9 rounded-xl text-xs"
        : "h-11 w-11 rounded-xl text-sm";
  return (
    <div
      aria-hidden="true"
      className={`${dims} flex shrink-0 items-center justify-center font-extrabold text-white shadow-sm`}
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
    >
      {getIniciaisEmpresa(empresa)}
    </div>
  );
}
