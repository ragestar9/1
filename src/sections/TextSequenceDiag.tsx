import {
  motion as fm,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { Activity, ArrowDown, ArrowUp, Crosshair, Film, MousePointerClick, Type } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import SectionShell from "../components/SectionShell";
import { useFPS } from "../hooks/useFPS";
import { useScrollStats } from "../hooks/useScrollStats";

const ease = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/* 10 — SPLIT                                                          */
/* ------------------------------------------------------------------ */

const splitLines = ["EVERY LETTER", "HAS ITS OWN", "TIMING."];

function SplitLine({ text, seed, replayKey }: { text: string; seed: number[]; replayKey: number }) {
  return (
    <div className="overflow-hidden">
      <div className="flex flex-wrap">
        {text.split("").map((ch, i) => (
          <fm.span
            key={`${replayKey}-${i}`}
            initial={{ y: "112%", rotate: seed[i] * 10, opacity: 0 }}
            whileInView={{ y: "0%", rotate: 0, opacity: 1 }}
            viewport={{ once: false, margin: "-18%" }}
            transition={{ duration: 0.75, ease, delay: 0.02 * i + (seed[i] + 1) * 0.05 }}
            className={`inline-block will-change-transform ${ch === " " ? "w-[0.35em]" : ""} ${
              text === "TIMING." ? "text-acid" : "text-bone"
            }`}
          >
            {ch === " " ? "\u00A0" : ch}
          </fm.span>
        ))}
      </div>
    </div>
  );
}

export function SplitSection() {
  const [replay, setReplay] = useState(0);
  const seeds = useMemo(
    () => splitLines.map((l) => l.split("").map(() => Math.random() * 2 - 1)),
    [replay] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <SectionShell
      id="m-split"
      index="10"
      module="STRINGSPLIT"
      title="Text, rebuilt character by character."
      blurb="The splitter rewrites the headline into indexed character spans, then a cascading stagger rebuilds it — re-enter the viewport or press replay to tear it down again."
      tags={["PER-CHAR", "STAGGER", "REPLAY"]}
    >
      <div className="mx-auto max-w-[1440px] px-5 pb-16 md:px-10 md:pb-24">
        <div className="grid-bg relative flex min-h-[46vh] flex-col items-start justify-center border border-line bg-ink2 p-6 md:p-14">
          <div className="font-display text-[clamp(2.4rem,7vw,6.4rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            {splitLines.map((l, li) => (
              <SplitLine key={l} text={l} seed={seeds[li]} replayKey={replay} />
            ))}
          </div>

          <button
            onClick={() => setReplay((r) => r + 1)}
            className="tick-label group mt-10 flex items-center gap-3 border border-line2 px-5 py-3 text-bone transition-colors duration-300 hover:border-acid hover:text-acid"
          >
            <MousePointerClick className="h-3.5 w-3.5 text-acid transition-transform duration-300 group-hover:scale-125" />
            REBUILD TYPE
          </button>

          <span className="tick-label absolute right-4 top-4 flex items-center gap-2 text-fog">
            <Type className="h-3.5 w-3.5 text-acid" />
            {splitLines.join(" ").length} CHARS INDEXED
          </span>
        </div>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* 16 — SEQUENCE                                                       */
/* ------------------------------------------------------------------ */

const RING = 2 * Math.PI * 90;

export function SequenceSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const dash = useTransform(scrollYProgress, [0, 1], [RING, 0]);
  const [frame, setFrame] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setFrame(Math.min(99, Math.floor(v * 100))));

  const activeStep = Math.min(8, Math.floor((frame / 100) * 8) + (frame > 0 ? 1 : 0));

  return (
    <SectionShell
      id="m-sequence"
      index="16"
      module="STRINGSEQUENCE"
      title="A scroll-driven frame sequence."
      blurb="Stepped output tied to scroll travel: a 00–99 frame counter and an eight-step timeline, every step lighting in order as you descend two screens."
      tags={["00–99", "8 STEPS", "STICKY"]}
      borderless
    >
      <div ref={ref} className="relative mx-auto h-[260vh] max-w-[1440px]">
        <div className="sticky top-0 flex h-screen items-center px-5 md:px-10">
          <div className="grid w-full grid-cols-1 items-center gap-10 md:grid-cols-2">
            {/* counter */}
            <div className="relative mx-auto aspect-square w-[70vw] max-w-[380px]">
              <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90">
                <circle cx="110" cy="110" r="90" fill="none" stroke="#1e1e26" strokeWidth="1.5" strokeDasharray="2 6" />
                <fm.circle
                  cx="110"
                  cy="110"
                  r="90"
                  fill="none"
                  stroke="#c8ff2e"
                  strokeWidth="2"
                  strokeDasharray={RING}
                  style={{ strokeDashoffset: dash }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="font-mono text-8xl font-light tabular-nums text-bone md:text-9xl">
                    {String(frame).padStart(2, "0")}
                  </div>
                  <div className="tick-label mt-2 flex items-center justify-center gap-2 text-fog">
                    <Film className="h-3.5 w-3.5 text-acid" />
                    SEQUENCE / FRAME / 99
                  </div>
                </div>
              </div>
            </div>

            {/* steps */}
            <div>
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {Array.from({ length: 8 }).map((_, i) => {
                  const lit = i < activeStep;
                  return (
                    <div
                      key={i}
                      className={`border p-4 transition-all duration-300 md:p-5 ${
                        lit ? "border-acid/70 bg-acid/10" : "border-line bg-panel"
                      }`}
                    >
                      <span className={`tick-label ${lit ? "text-acid" : "text-fog"}`}>STEP</span>
                      <div className={`mt-6 font-mono text-2xl tabular-nums md:mt-8 md:text-3xl ${lit ? "text-bone" : "text-fog/50"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 h-1 w-full bg-line">
                <div className="h-full bg-acid transition-[width] duration-150" style={{ width: `${frame}%` }} />
              </div>
              <div className="tick-label mt-3 flex justify-between text-fog">
                <span>TIMELINE</span>
                <span className="tabular-nums text-bone">{frame}% COMPLETE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* 14 · 15 — DIAGNOSTICS                                               */
/* ------------------------------------------------------------------ */

export function DiagnosticsSection() {
  const fps = useFPS();
  const { y, pct, dir } = useScrollStats();
  const [history, setHistory] = useState<number[]>(Array(44).fill(0));

  useEffect(() => {
    if (fps === 0) return;
    setHistory((h) => [...h.slice(-43), fps]);
  }, [fps]);

  const max = Math.max(60, ...history);

  return (
    <SectionShell
      id="m-diag"
      index="14 · 15"
      module="STRINGDIAG"
      title="Live FPS & position telemetry."
      blurb="Two global modules broadcast through the document. The panels in the corners of your screen are the same feed — this is where the numbers come from."
      tags={["RAF LOOP", "BROADCAST", "120MS"]}
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-3 px-5 pb-16 md:grid-cols-2 md:px-10 md:pb-24">
        {/* FPS */}
        <div className="border border-line bg-panel p-6 md:p-8">
          <div className="flex items-center justify-between">
            <span className="tick-label text-fog">14 — FPS TRACKER</span>
            <Activity className="h-4 w-4 text-acid" />
          </div>
          <div className="mt-8 flex items-end justify-between gap-6">
            <div>
              <div className={`font-mono text-7xl font-light tabular-nums md:text-8xl ${fps >= 50 ? "text-acid" : "text-bone"}`}>
                {String(fps).padStart(2, "0")}
              </div>
              <div className="tick-label mt-2 text-fog">FRAMES / SECOND — MAIN THREAD</div>
            </div>
            {/* sparkline */}
            <div className="flex h-24 flex-1 items-end justify-end gap-[3px]">
              {history.map((v, i) => (
                <div
                  key={i}
                  className={`w-full max-w-[6px] ${v >= 50 ? "bg-acid/80" : v >= 28 ? "bg-bone/60" : "bg-red-400/80"}`}
                  style={{ height: `${Math.max(6, (v / max) * 100)}%`, opacity: 0.25 + (i / history.length) * 0.75 }}
                />
              ))}
            </div>
          </div>
          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-fog">
            Counts rendered frames each second and writes the result across the document. Both
            corner panels on your screen mirror this loop.
          </p>
        </div>

        {/* POSITION */}
        <div className="border border-line bg-panel p-6 md:p-8">
          <div className="flex items-center justify-between">
            <span className="tick-label text-fog">15 — POSITION TRACKER</span>
            <Crosshair className="h-4 w-4 text-acid" />
          </div>
          <div className="mt-8 grid grid-cols-[1fr_auto] items-end gap-6">
            <div className="space-y-4">
              {[
                { k: "PIXELS", v: y.toLocaleString(), w: "min-w-[9ch]" },
                { k: "PROGRESS", v: `${pct}%`, w: "min-w-[9ch]" },
              ].map((row) => (
                <div key={row.k} className="flex items-baseline justify-between border-b border-line pb-3">
                  <span className="tick-label text-fog">{row.k}</span>
                  <span className={`font-mono text-4xl font-light tabular-nums text-bone md:text-5xl ${row.w} text-right`}>{row.v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="tick-label text-fog">DIRECTION</span>
                <span className="flex items-center gap-2 font-mono text-4xl font-light text-bone md:text-5xl">
                  {dir === "DOWN" ? (
                    <ArrowDown className="h-8 w-8 text-acid" />
                  ) : dir === "UP" ? (
                    <ArrowUp className="h-8 w-8 text-acid" />
                  ) : (
                    <span className="text-fog/50">·</span>
                  )}
                </span>
              </div>
            </div>
            {/* rail */}
            <div className="relative h-44 w-8 border border-line bg-ink2 md:h-48">
              <div
                className="absolute left-0 right-0 h-2 bg-acid transition-[top] duration-150"
                style={{ top: `calc(${pct}% - ${pct * 0.08}px)` }}
              />
              <div className="absolute inset-x-0 top-0 h-px bg-line2" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-line2" />
            </div>
          </div>
          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-fog">
            Broadcasts scroll pixels, percentage and direction globally — the rail on the right is
            your live position inside this transmission.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}
