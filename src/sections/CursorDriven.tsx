import {
  animate,
  motion as fm,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { Box, Magnet, MousePointer2, Sparkles, SunDim, Zap } from "lucide-react";
import { PointerEvent as RPointerEvent, useEffect, useRef, useState } from "react";
import SectionShell from "../components/SectionShell";

const springCfg = { stiffness: 260, damping: 22, mass: 0.7 };

/* ------------------------------------------------------------------ */
/* 06 — CURSOR                                                         */
/* ------------------------------------------------------------------ */

function TrackZone() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, springCfg);
  const y = useSpring(0, springCfg);
  const [norm, setNorm] = useState<[number, number]>([0, 0]);

  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const r = ref.current!.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    x.set(px);
    y.set(py);
    setNorm([Math.round(((px / r.width) * 2 - 1) * 100) / 100, Math.round(((py / r.height) * 2 - 1) * 100) / 100]);
  };

  return (
    <div
      ref={ref}
      onPointerMove={move}
      className="grid-bg relative h-64 cursor-none overflow-hidden border border-line bg-ink2 md:h-80"
    >
      <span className="tick-label absolute left-4 top-4 text-fog">/01 TRACK</span>
      <span className="tick-label absolute right-4 top-4 tabular-nums text-fog">
        --x {norm[0].toFixed(2)} · --y {norm[1].toFixed(2)}
      </span>
      <fm.div style={{ x, y }} className="pointer-events-none absolute left-0 top-0">
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          <div className="h-10 w-10 rounded-full border border-acid/70" />
          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-acid" />
        </div>
      </fm.div>
      <div className="pointer-events-none absolute bottom-4 left-4 right-4">
        <div className="font-display text-lg font-medium text-bone">The reticle mirrors your pointer 1:1.</div>
        <div className="tick-label mt-1 text-fog">NORMALIZED LOCAL COORDINATES</div>
      </div>
    </div>
  );
}

function PushZone() {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, springCfg);
  const ry = useSpring(0, springCfg);
  const [deg, setDeg] = useState<[number, number]>([0, 0]);

  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const r = ref.current!.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    ry.set(nx * 16);
    rx.set(-ny * 16);
    setDeg([nx * 16, -ny * 16]);
  };
  const leave = () => {
    rx.set(0);
    ry.set(0);
    setDeg([0, 0]);
  };

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className="relative h-64 border border-line bg-ink2 md:h-80"
      style={{ perspective: 800 }}
    >
      <span className="tick-label absolute left-4 top-4 z-10 text-fog">/02 PUSH</span>
      <span className="tick-label absolute right-4 top-4 z-10 tabular-nums text-fog">
        rx {deg[1].toFixed(0)}° · ry {deg[0].toFixed(0)}°
      </span>
      <div className="flex h-full items-center justify-center p-8">
        <fm.div
          style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
          className="grid h-40 w-full max-w-xs place-items-center border border-line2 bg-panel"
        >
          <div style={{ transform: "translateZ(46px)" }} className="text-center">
            <MousePointer2 className="mx-auto h-5 w-5 text-acid" />
            <div className="mt-3 font-display text-lg font-medium text-bone">The card leans toward you.</div>
            <div className="tick-label mt-1 text-fog">PERSPECTIVE TILT · SPRINGS</div>
          </div>
        </fm.div>
      </div>
    </div>
  );
}

export function CursorSection() {
  return (
    <SectionShell
      id="m-cursor"
      index="06"
      module="STRINGCURSOR"
      title="A reactive pointer with local coordinates."
      blurb="The cursor module writes normalized per-element coordinates the moment your pointer crosses a zone. Hover both — one mirrors you, one leans toward you."
      tags={["--X / --Y", "TILT", "SPRING"]}
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-3 px-5 pb-16 md:grid-cols-2 md:px-10 md:pb-24">
        <TrackZone />
        <PushZone />
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* 07 — MAGNETIC                                                       */
/* ------------------------------------------------------------------ */

function MagneticItem({ label, strength, radius }: { label: string; strength: number; radius: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 180, damping: 15, mass: 0.5 });
  const y = useSpring(0, { stiffness: 180, damping: 15, mass: 0.5 });
  const [hot, setHot] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: globalThis.PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);
      if (d < radius) {
        x.set(dx * strength);
        y.set(dy * strength);
        setHot(true);
      } else {
        x.set(0);
        y.set(0);
        setHot(false);
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y, radius, strength]);

  return (
    <fm.div ref={ref} style={{ x, y }} className="will-change-transform">
      <button
        className={`group flex h-16 items-center gap-3 border px-6 transition-colors duration-300 md:h-20 md:px-10 ${
          hot ? "border-acid bg-acid text-ink" : "border-line2 bg-panel text-bone hover:border-acid/60"
        }`}
      >
        <Magnet className={`h-4 w-4 ${hot ? "text-ink" : "text-acid"}`} />
        <span className="font-display text-sm font-medium uppercase tracking-widest md:text-base">{label}</span>
      </button>
      <div className="tick-label mt-2 text-center text-fog">
        pull ×{strength} · r {radius}
      </div>
    </fm.div>
  );
}

export function MagneticSection() {
  return (
    <SectionShell
      id="m-magnetic"
      index="07"
      module="STRINGMAGNETIC"
      title="Elements pull toward the pointer."
      blurb="Inside an active radius the pointer's offset is written to each control as a translate. Drag your cursor around the field — each button has its own pull strength."
      tags={["RADIUS", "OFFSET", "RESET"]}
    >
      <div className="mx-auto max-w-[1440px] px-5 pb-16 md:px-10 md:pb-24">
        <div className="grid-bg flex min-h-[280px] flex-wrap items-center justify-center gap-x-14 gap-y-10 border border-line bg-ink2 px-6 py-16">
          <MagneticItem label="MAGNET A" strength={0.35} radius={150} />
          <MagneticItem label="MAGNET B" strength={0.55} radius={190} />
          <MagneticItem label="MAGNET C" strength={0.8} radius={230} />
        </div>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* 08 — SPOTLIGHT · 3D                                                 */
/* ------------------------------------------------------------------ */

const spotCards = [
  { icon: SunDim, t: "LIGHTING", d: "A radial highlight tracks the pointer across the surface in real time." },
  { icon: Box, t: "DIMENSION", d: "Perspective tilt on both axes gives every card real physical depth." },
  { icon: Sparkles, t: "COMPOSITION", d: "Spotlight and cursor share one element — two modules, zero conflicts." },
];

function SpotCard({ icon: Icon, t, d }: { icon: typeof SunDim; t: string; d: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const sx = useMotionValue(-300);
  const sy = useMotionValue(-300);
  const rx = useSpring(0, springCfg);
  const ry = useSpring(0, springCfg);
  const glow = useMotionTemplate`radial-gradient(260px circle at ${sx}px ${sy}px, rgba(200,255,46,0.14), transparent 72%)`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: globalThis.PointerEvent) => {
      const r = el.getBoundingClientRect();
      const lx = e.clientX - r.left;
      const ly = e.clientY - r.top;
      sx.set(lx);
      sy.set(ly);
      const inside = lx > -80 && ly > -80 && lx < r.width + 80 && ly < r.height + 80;
      if (inside) {
        ry.set(((lx / r.width) * 2 - 1) * 8);
        rx.set(-((ly / r.height) * 2 - 1) * 8);
      } else {
        rx.set(0);
        ry.set(0);
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [sx, sy, rx, ry]);

  return (
    <fm.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>
      <div ref={ref} className="relative h-full overflow-hidden border border-line bg-panel p-6 transition-colors duration-500 hover:border-line2 md:p-8">
        <fm.div style={{ background: glow }} className="pointer-events-none absolute inset-0" />
        <div style={{ transform: "translateZ(30px)" }}>
          <div className="flex items-center justify-between">
            <Icon className="h-5 w-5 text-acid" />
            <span className="tick-label text-fog">3D SURFACE</span>
          </div>
          <h3 className="mt-16 font-display text-xl font-medium tracking-tight text-bone md:mt-20">{t}</h3>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-fog">{d}</p>
        </div>
      </div>
    </fm.div>
  );
}

export function SpotlightSection() {
  return (
    <SectionShell
      id="m-spotlight"
      index="08"
      module="STRINGSPOTLIGHT"
      title="A light that follows the cursor across 3D cards."
      blurb="Spotlight angle and distance combine with cursor tilt so each card behaves like a lit, dimensional surface under your pointer."
      tags={["--ANGLE", "--DIST", "TILT"]}
    >
      <div className="mx-auto max-w-[1440px] px-5 pb-16 md:px-10 md:pb-24" style={{ perspective: 1200 }}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {spotCards.map((c) => (
            <SpotCard key={c.t} {...c} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* 09 — IMPULSE                                                        */
/* ------------------------------------------------------------------ */

const impulseCards = [
  { n: "SPRING 01", t: "SHOVE", k: { stiffness: 320, damping: 14 } },
  { n: "SPRING 02", t: "WOBBLE", k: { stiffness: 140, damping: 8 } },
  { n: "SPRING 03", t: "RECOIL", k: { stiffness: 220, damping: 20 } },
  { n: "SPRING 04", t: "DRIFT", k: { stiffness: 90, damping: 12 } },
];

let impulseVNow = 0;

export function ImpulseSection() {
  const container = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const last = useRef({ x: 0, y: 0, t: 0 });
  const [pv, setPv] = useState(0);

  return (
    <ImpulseInner
      container={container}
      cardRefs={cardRefs}
      last={last}
      pv={pv}
      setPv={setPv}
    />
  );
}

function ImpulseInner({
  container,
  cardRefs,
  last,
  pv,
  setPv,
}: {
  container: React.RefObject<HTMLDivElement | null>;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  last: React.MutableRefObject<{ x: number; y: number; t: number }>;
  pv: number;
  setPv: (n: number) => void;
}) {
  const x0 = useMotionValue(0); const y0 = useMotionValue(0); const r0 = useMotionValue(0);
  const x1 = useMotionValue(0); const y1 = useMotionValue(0); const r1 = useMotionValue(0);
  const x2 = useMotionValue(0); const y2 = useMotionValue(0); const r2 = useMotionValue(0);
  const x3 = useMotionValue(0); const y3 = useMotionValue(0); const r3 = useMotionValue(0);
  const packs = [
    { x: x0, y: y0, r: r0 },
    { x: x1, y: y1, r: r1 },
    { x: x2, y: y2, r: r2 },
    { x: x3, y: y3, r: r3 },
  ];

  useEffect(() => {
    const id = window.setInterval(() => setPv(Math.round(impulseVNow)), 140);
    return () => window.clearInterval(id);
  }, [setPv]);

  const shove = (e: RPointerEvent<HTMLDivElement>) => {
    const now = performance.now();
    const dt = Math.max((now - last.current.t) / 1000, 1 / 120);
    const vx = (e.clientX - last.current.x) / dt;
    const vy = (e.clientY - last.current.y) / dt;
    const v = Math.hypot(vx, vy);
    impulseVNow = v;
    last.current = { x: e.clientX, y: e.clientY, t: now };
    if (v < 240) return;

    packs.forEach((p, i) => {
      const el = cardRefs.current[i];
      if (!el) return;
      const rct = el.getBoundingClientRect();
      const cx = rct.left + rct.width / 2;
      const cy = rct.top + rct.height / 2;
      const d = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (d > 300) return;
      const fall = 1 - d / 300;
      const mag = Math.min(v / 90, 34) * fall;
      const dirx = (vx / v) * mag;
      const diry = (vy / v) * mag;
      const k = impulseCards[i].k;
      p.x.set(dirx);
      p.y.set(diry);
      p.r.set((vx / v) * mag * 0.35);
      animate(p.x, 0, { type: "spring", stiffness: k.stiffness, damping: k.damping });
      animate(p.y, 0, { type: "spring", stiffness: k.stiffness, damping: k.damping });
      animate(p.r, 0, { type: "spring", stiffness: k.stiffness, damping: k.damping * 0.8 });
    });
  };

  return (
    <SectionShell
      id="m-impulse"
      index="09"
      module="STRINGIMPULSE"
      title="Cursor velocity becomes a spring."
      blurb="Pointer velocity is injected into a per-card spring simulation. Sweep fast across the grid and the tiles shove, wobble, recoil and drift back — each on its own constants."
      tags={["VELOCITY", "K & D", "SETTLE"]}
    >
      <div className="mx-auto max-w-[1440px] px-5 pb-16 md:px-10 md:pb-24">
        <div
          ref={container}
          onPointerMove={shove}
          className="relative grid grid-cols-2 gap-3 border border-line grid-bg bg-ink2 p-3 md:grid-cols-4 md:p-6"
        >
          <span className="tick-label absolute -top-3 left-4 bg-ink2 px-2 text-fog">
            POINTER <span className="tabular-nums text-acid">{pv.toLocaleString()}</span> px/s — SWEEP ME
          </span>
          {impulseCards.map((c, i) => (
            <fm.div
              key={c.n}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              style={{ x: packs[i].x, y: packs[i].y, rotate: packs[i].r }}
              className="border border-line bg-panel p-5 will-change-transform md:p-6"
            >
              <div className="flex items-center justify-between">
                <span className="tick-label text-fog">{c.n}</span>
                <Zap className="h-3.5 w-3.5 text-acid" />
              </div>
              <div className="mt-10 font-display text-xl font-medium tracking-tight text-bone md:mt-14 md:text-2xl">
                {c.t}
              </div>
              <div className="tick-label mt-1 text-fog">
                k {c.k.stiffness} · d {c.k.damping}
              </div>
            </fm.div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
