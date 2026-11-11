"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Evento } from "@/types";

const TYPE_META: Record<
  Evento["type"],
  { label: string; badgeClass: string; fallbackGradient: string }
> = {
  tech: {
    label: "Tecnologia & Inovação",
    badgeClass: "bg-blue-500/90 text-white",
    fallbackGradient: "from-blue-700 via-indigo-700 to-slate-900",
  },
  cultural: {
    label: "Integração & Cultura",
    badgeClass: "bg-pink-500/90 text-white",
    fallbackGradient: "from-purple-700 via-fuchsia-700 to-slate-900",
  },
  academic: {
    label: "Carreiras & NESP",
    badgeClass: "bg-emerald-500/90 text-white",
    fallbackGradient: "from-emerald-700 via-teal-700 to-slate-900",
  },
};

export function EventosCarousel() {
  const { eventos } = useApp();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [brokenIds, setBrokenIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (paused || eventos.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % eventos.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, eventos.length]);

  const goPrev = () =>
    setIndex((prev) => (prev - 1 + eventos.length) % eventos.length);
  const goNext = () => setIndex((prev) => (prev + 1) % eventos.length);

  return (
    <section
      aria-labelledby="heading-eventos"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX === null) return;
        const delta = touchStartX - e.changedTouches[0].clientX;
        if (delta > 45) goNext();
        if (delta < -45) goPrev();
        setTouchStartX(null);
      }}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2
              id="heading-eventos"
              className="text-base font-bold text-[var(--text-primary)]"
            >
              Eventos no Campus
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Agenda acadêmica, cultural e feiras de estágio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Evento anterior"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-primary)] hover:border-[var(--accent)] transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Próximo evento"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-primary)] hover:border-[var(--accent)] transition cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Carousel Viewport */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {eventos.map((ev) => {
            const meta = TYPE_META[ev.type] ?? TYPE_META.tech;
            const isBroken = brokenIds[ev.id];

            return (
              <article
                key={ev.id}
                className="relative min-w-full min-h-[280px] sm:min-h-[310px] flex flex-col justify-end"
              >
                {!isBroken ? (
                  <Image
                    src={ev.image}
                    alt={ev.title}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                    onError={() =>
                      setBrokenIds((prev) => ({ ...prev, [ev.id]: true }))
                    }
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${meta.fallbackGradient}`}
                  />
                )}

                {/* Scrim for guaranteed readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/55 to-slate-950/15" />

                <div className="relative z-10 p-5 sm:p-6 text-white space-y-2.5">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold shadow-sm ${meta.badgeClass}`}
                  >
                    {meta.label}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold leading-tight">
                    {ev.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/85 max-w-xl leading-relaxed line-clamp-2">
                    {ev.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-medium text-white/90">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                      <Calendar className="h-3.5 w-3.5" />
                      {ev.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                      <Clock className="h-3.5 w-3.5" />
                      {ev.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                      <MapPin className="h-3.5 w-3.5" />
                      {ev.location}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Dots Indicator */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5 backdrop-blur-sm">
          {eventos.map((ev, i) => (
            <button
              key={ev.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ir para evento ${i + 1}: ${ev.title}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                i === index
                  ? "w-6 bg-white"
                  : "w-2 bg-white/45 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

