import React, { Suspense } from "react";
import { VAGAS_NESP } from "@/data/mockData";
import { VagaDetalheClient } from "./VagaDetalheClient";

export async function generateStaticParams() {
  return VAGAS_NESP.map((v) => ({ id: String(v.vagaId) }));
}

async function VagaLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VagaDetalheClient vagaId={Number(id)} />;
}

export default function VagaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-44 animate-pulse rounded-2xl bg-[var(--bg-surface)]" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="h-96 animate-pulse rounded-2xl bg-[var(--bg-surface)] lg:col-span-8" />
            <div className="h-72 animate-pulse rounded-2xl bg-[var(--bg-surface)] lg:col-span-4" />
          </div>
        </div>
      }
    >
      <VagaLoader params={params} />
    </Suspense>
  );
}

