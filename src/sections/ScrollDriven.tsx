import {
  motion as fm,
  MotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { ArrowDown, ArrowUp, Gauge, Layers, ScanLine, Wind } from "lucide-react";
import { useRef, useState } from "react";
import SectionShell from "../components/SectionShell";

const ease = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/* 01 — REVEAL                                                         */
/* ------------------------------------------------------------------ */

const revealSpecs = [
  { n: "/01", icon: ScanLine, t: "OPACITY", d: "Fade from invisible to fully present as the entry timeline advances." },
  { n: "/02", icon: ArrowUp, t: "TRANSLATE", d: "Rise 64px into place along a custom cubic-bezier curve." },
  { n: "/03", icon: Layers, t: "STAGGER", d: "Offset entry points cascade the cards naturally down the row." },
];

function RevealCard({ spec, order }: { spec: (typeof revealSpecs)[number]; order: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 96%", "start 48%"] });

  return (
    <fm.div
      ref={ref}
      initial={{ opacity: 0, y: 64 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.9, ease, delay: order * 0.12 }}
      className="group relative overflow-hidden border border-line bg-panel p-6 transition-colors duration-500 hover:border-line2 md:p-8"
    >
      <div className="flex items-start justify-between">
        <span className="tick-label text-fog">{spec.n}</span>
        <spec.icon className="h-4 w-4 text-fog transition-colors duration-500 group-hover:text-acid" />
      </div>
      <h3 className="mt-14 font-display text-xl font-medium tracking-tight text-bone md:mt-20">{spec.t}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fog">{spec.d}</p>
      <fm.div style={{ scaleX: scrollYProgress }} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-acid" />
    </fm.div>
  );
}

export function RevealSection() {
  return (
    <SectionShell
      id="m-reveal"
      index="01"
      module="STRINGREVEAL"
      title="Elements enter as they travel into view."
      blurb="Each card publishes its own entry progress, mapped to opacity, rise and a staggered cascade — composing the whole row's choreography from pure scroll."
      tags={["0→1", "STAGGER", "EASED"]}
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-3 px-5 pb-16 md:grid-cols-3 md:px-10 md:pb-24">
        {revealSpecs.map((s, i) => (
          <RevealCard key={s.n} spec={s} order={i} />
        ))}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* 02 — PARALLAX                                                       */
/* ------------------------------------------------------------------ */

export function ParallaxSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const yBack = useTransform(scrollYProgress, [0, 1], [140, -220]);
  const yMid = useTransform(scrollYProgress, [0, 1], [90, -90]);
  const yFront = useTransform(scrollYProgress, [0, 1], [-40, 110]);
  const yChips = useTransform(scrollYProgress, [0, 1], [190, -260]);
  const rot = useTransform(scrollYProgress, [0, 1], [-6, 6]);

  return (
    <SectionShell
      id="m-parallax"
      index="02"
      module="STRINGPARALLAX"
      title="Stacked layers drift at different speeds."
      blurb="Scroll travel becomes a vertical transform applied per layer. Different strengths build real depth — the module owns the transform, the scene composes itself."
      tags={["×0.3", "×0.6", "×1.0"]}
    >
      <div className="mx-auto max-w-[1440px] px-5 pb-16 md:px-10 md:pb-24">
        <div ref={ref} className="grid-bg relative h-[64vh] min-h-[420px] overflow-hidden border border-line bg-ink2 md:h-[72vh]">
          {/* back layer */}
          <fm.div style={{ y: yBack }} className="absolute inset-x-0 top-[16%] text-center">
            <span className="text-outline select-none font-display text-[clamp(6rem,17vw,15rem)] font-medium leading-none tracking-tight">
              DEPTH
            </span>
          </fm.div>

          {/* mid layer — floating spec chips */}
          <fm.div style={{ y: yChips }} className="absolute inset-0">
            {[
              ["z-factor 0.3", "left-[8%] top-[22%]"],
              ["z-factor 0.6", "right-[10%] top-[40%]"],
              ["z-factor 1.0", "left-[14%] bottom-[18%]"],
              ["translate · owns transform", "right-[16%] bottom-[26%]"],
            ].map(([label, pos]) => (
              <span key={label} className={`tick-label absolute border border-line bg-panel/80 px-3 py-2 text-fog backdrop-blur-sm ${pos}`}>
                {label}
              </span>
            ))}
          </fm.div>

          {/* front layer */}
          <fm.div style={{ y: yFront, rotate: rot }} className="absolute inset-x-0 bottom-[8%] text-center md:bottom-[16%]">
            <span className="select-none font-display text-[clamp(4rem,11vw,9rem)] font-medium leading-none tracking-tight text-acid">
              DEPTH.
            </span>
          </fm.div>

          <fm.div style={{ y: yMid }} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-40 w-40 border border-line2 md:h-64 md:w-64" />
          </fm.div>

          <div className="tick-label absolute left-4 top-4 text-fog">FIG. 02 — STACKED FIELD</div>
          <div className="tick-label absolute bottom-4 right-4 text-fog">4 LAYERS · 1 SCROLL</div>
        </div>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* 03 — PROGRESS (sticky dial)                                         */
/* ------------------------------------------------------------------ */

const CIRC = 2 * Math.PI * 120;

export function ProgressSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const eased = useTransform(scrollYProgress, (v) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2));
  const smooth = useSpring(eased, { stiffness: 90, damping: 22, mass: 0.6 });

  const dash = useTransform(smooth, [0, 1], [CIRC, 0]);
  const spin = useTransform(smooth, [0, 1], [0, 360]);
  const scale = useTransform(smooth, [0, 1], [0.35, 1]);
  const [pct, setPct] = useState(0);
  useMotionValueEvent(smooth, "change", (v) => setPct(Math.round(v * 100)));

  return (
    <SectionShell
      id="m-progress"
      index="03"
      module="STRINGPROGRESS"
      title="A stable 0→1 value you can drive anything with."
      blurb="An eased, clamped number exposed as a variable over two screens of travel. Here it draws the dial, spins the cube and fills the rail — one value, three systems."
      tags={["EASED", "CLAMPED", "STICKY"]}
      borderless
    >
      <div ref={ref} className="relative mx-auto h-[230vh] max-w-[1440px]">
        <div className="sticky top-0 flex h-screen items-center px-5 md:px-10">
          <div className="grid w-full grid-cols-1 items-center gap-10 md:grid-cols-2">
            {/* dial */}
            <div className="relative mx-auto aspect-square w-[78vw] max-w-[440px]">
              <svg viewBox="0 0 280 280" className="h-full w-full -rotate-90">
                <circle cx="140" cy="140" r="120" fill="none" stroke="#1e1e26" strokeWidth="1.5" />
                {Array.from({ length: 24 }).map((_, i) => {
                  const a = (i / 24) * Math.PI * 2;
                  return (
                    <line
                      key={i}
                      x1={140 + Math.cos(a) * 104}
                      y1={140 + Math.sin(a) * 104}
                      x2={140 + Math.cos(a) * 112}
                      y2={140 + Math.sin(a) * 112}
                      stroke="#2b2b35"
                      strokeWidth="1"
                    />
                  );
                })}
                <fm.circle
                  cx="140"
                  cy="140"
                  r="120"
                  fill="none"
                  stroke="#c8ff2e"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  strokeDasharray={CIRC}
                  style={{ strokeDashoffset: dash }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="font-mono text-6xl font-light tabular-nums text-bone md:text-7xl">
                    {String(pct).padStart(3, "0")}
                    <span className="text-acid">%</span>
                  </div>
                  <div className="tick-label mt-3 text-fog">SCROLL PROGRESS OF THIS FIELD</div>
                </div>
              </div>
            </div>

            {/* driven systems */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between">
                  <span className="tick-label text-fog">/01 FILL</span>
                  <span className="tick-label tabular-nums text-bone">scaleX {pct}%</span>
                </div>
                <div className="mt-3 h-8 border border-line bg-panel p-1">
                  <fm.div style={{ scaleX: smooth }} className="h-full w-full origin-left bg-acid" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="tick-label text-fog">/02 ROTATION</span>
                    <span className="tick-label tabular-nums text-bone">{Math.round(pct * 3.6)}°</span>
                  </div>
                  <div className="mt-3 flex h-24 items-center justify-center border border-line bg-panel">
                    <fm.div style={{ rotate: spin }} className="grid h-12 w-12 place-items-center border border-acid">
                      <ArrowUp className="h-4 w-4 text-acid" />
                    </fm.div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="tick-label text-fog">/03 SCALE</span>
                    <span className="tick-label tabular-nums text-bone">{(pct / 100).toFixed(2)}×</span>
                  </div>
                  <div className="mt-3 flex h-24 items-center justify-center border border-line bg-panel">
                    <fm.div style={{ scale }} className="h-12 w-12 bg-acid" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* 04 — LERP / VELOCITY                                                */
/* ------------------------------------------------------------------ */

export function LerpSection() {
  const { scrollY } = useScroll();
  const raw = useVelocity(scrollY);
  const smooth = useSpring(raw, { stiffness: 140, damping: 24, mass: 0.9 });

  const skew = useTransform(smooth, [-3200, 0, 3200], [14, 0, -14]);
  const shift = useTransform(smooth, [-3200, 0, 3200], [70, 0, -70]);
  const stretch = useTransform(smooth, (v) => 1 + Math.min(Math.abs(v) / 9000, 0.35));
  const [v, setV] = useState(0);
  useMotionValueEvent(smooth, "change", (val) => setV(Math.round(val)));

  return (
    <SectionShell
      id="m-lerp"
      index="04"
      module="STRINGLERP"
      title="Catch the velocity of the scroll."
      blurb="The signed scroll delta, smoothed into a per-frame lerp channel. The type below leans into the direction and speed you throw at it — scroll fast and it bends."
      tags={["PX/S", "SIGNED", "SKEW"]}
      borderless
    >
      <div className="mx-auto max-w-[1440px] px-5 pb-16 md:px-10 md:pb-24">
        <div className="grid-bg relative flex h-[52vh] min-h-[360px] flex-col items-center justify-center overflow-hidden border border-line bg-ink2">
          <fm.div style={{ skewX: skew, x: shift, scaleY: stretch }} className="will-change-transform">
            <span className="select-none font-display text-[clamp(3.4rem,11vw,10rem)] font-semibold leading-none tracking-[-0.04em] text-bone">
              VELOC<span className="text-acid">I</span>TY
            </span>
          </fm.div>

          <div className="tick-label mt-8 flex items-center gap-4 text-fog">
            {v > 40 ? <ArrowDown className="h-3.5 w-3.5 text-acid" /> : v < -40 ? <ArrowUp className="h-3.5 w-3.5 text-acid" /> : <Gauge className="h-3.5 w-3.5" />}
            <span className="tabular-nums">
              {v > 0 ? "+" : ""}
              {v.toLocaleString()} px/s
            </span>
          </div>

          <div className="tick-label absolute left-4 top-4 text-fog">FIG. 04 — SIGNED DELTA</div>
          <div className="tick-label absolute bottom-4 right-4 text-fog">SCROLL HARD ↑↓</div>
        </div>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* 05 — GLIDE                                                          */
/* ------------------------------------------------------------------ */

const glideCards = [
  { f: 0.4, t: "DRIFT", icon: Wind },
  { f: 0.8, t: "FLOAT", icon: Wind },
  { f: 1.2, t: "GLIDE", icon: Wind },
  { f: 1.6, t: "SOAR", icon: Wind },
];

function GlideCard({ f, t, progress }: { f: number; t: string; progress: MotionValue<number> }) {
  const y = useTransform(progress, [0, 1], [160 * f, -160 * f]);
  return (
    <fm.div style={{ y }} className="border border-line bg-panel p-5 md:p-6">
      <div className="flex items-center justify-between">
        <span className="tick-label text-acid">×{f.toFixed(1)}</span>
        <Wind className="h-3.5 w-3.5 text-fog" />
      </div>
      <div className="mt-10 font-display text-2xl font-medium tracking-tight text-bone md:mt-14">{t}</div>
      <div className="tick-label mt-1 text-fog">string-glide {f.toFixed(1)}</div>
    </fm.div>
  );
}

export function GlideSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <SectionShell
      id="m-glide"
      index="05"
      module="STRINGGLIDE"
      title="Turn scroll energy into drift."
      blurb="Scroll motion accumulates into a per-element pixel transform. Each tile carries a different multiplier, so the row shears apart and floats past at its own pace."
      tags={["×0.4", "×0.8", "×1.2", "×1.6"]}
      borderless
    >
      <div ref={ref} className="mx-auto max-w-[1440px] px-5 pb-20 md:px-10 md:pb-28">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {glideCards.map((c) => (
            <GlideCard key={c.t} f={c.f} t={c.t} progress={scrollYProgress} />
          ))}
        </div>
        <div className="tick-label mt-8 flex items-center gap-3 text-fog">
          <span className="h-px w-10 bg-line2" />
          SAME SCROLL · FOUR VELOCITIES — SHEAR INCREASES WITH MULTIPLIER
        </div>
      </div>
    </SectionShell>
  );
}
