import { motion as fm, useSpring } from "framer-motion";
import { ArrowUpLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useFPS } from "../hooks/useFPS";
import { useScrollStats } from "../hooks/useScrollStats";
import { motion } from "../lib/motion";

function CursorReticle() {
  const x = useSpring(-100, { stiffness: 400, damping: 34, mass: 0.6 });
  const y = useSpring(-100, { stiffness: 400, damping: 34, mass: 0.6 });

  useEffect(() => {
    if (motion.touch) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  if (motion.touch) return null;

  return (
    <fm.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[80] mix-blend-difference" style={{ x, y }}>
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <div className="h-8 w-8 rounded-full border border-bone/70" />
        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 bg-acid" />
      </div>
    </fm.div>
  );
}

function UTCClock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(
        `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}:${String(
          d.getUTCSeconds()
        ).padStart(2, "0")}`
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tick-label hidden tabular-nums text-fog lg:block">{now} UTC</span>;
}

interface ActiveModule {
  index: number;
  label: string;
  total: number;
}

/** Tracks which data-module section occupies the centre band. */
function useActiveModule(): ActiveModule {
  const [active, setActive] = useState<ActiveModule>({ index: 0, label: "HERO / ICOSA", total: 16 });

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-module]"));
    if (!els.length) return;
    const order = els.map((el) => el.dataset.module ?? "");
    setActive({ index: 1, label: order[0] ?? "HERO / ICOSA", total: order.length });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          const i = els.indexOf(el);
          setActive({ index: i + 1, label: el.dataset.module ?? "", total: order.length });
        }
      },
      { rootMargin: "-42% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return active;
}

function SectionRail({ active }: { active: ActiveModule }) {
  const ticks = active.total;
  if (ticks <= 0) return null;
  return (
    <div className="fixed right-2.5 top-1/2 z-[60] hidden -translate-y-1/2 flex-col items-end gap-[5px] lg:flex">
      {Array.from({ length: ticks }).map((_, i) => {
        const on = i === active.index - 1;
        return (
          <span
            key={i}
            className={`block transition-all duration-300 ${on ? "h-[3px] w-6 bg-acid" : "h-[2px] w-3 bg-line2"}`}
          />
        );
      })}
    </div>
  );
}

export default function HUD({ booted }: { booted: boolean }) {
  const fps = useFPS();
  const { y, pct, vel, dir } = useScrollStats();
  const active = useActiveModule();
  const fpsTone = fps >= 50 ? "text-acid" : fps >= 28 ? "text-bone" : "text-red-400";

  const slide = (off: string) => ({
    transform: booted ? "none" : off,
    opacity: booted ? 1 : 0,
    transition: "transform .9s cubic-bezier(.22,1,.36,1) .15s, opacity .6s ease .15s",
  });

  return (
    <>
      <CursorReticle />
      <div aria-hidden className="noise-layer" />

      {/* top bar */}
      <header className="fixed inset-x-0 top-0 z-[60] border-b border-line bg-ink/72 backdrop-blur-md" style={slide("translateY(-102%)")}>
        <div className="flex h-12 items-center justify-between px-4 md:px-8">
          <a href="#top" className="group flex items-center gap-3">
            <span className="grid h-6 w-6 place-items-center bg-acid">
              <span className="block h-2 w-2 rotate-45 border-[1.5px] border-ink" />
            </span>
            <span className="tick-label text-bone transition-colors group-hover:text-acid">STRINGTUNE × THREE.JS</span>
          </a>

          <span className="tick-label hidden text-fog md:block">
            MOD <span className="text-acid">{String(active.index).padStart(2, "0")}</span>
            <span className="text-line2"> / </span>
            {String(active.total).padStart(2, "0")}
            <span className="mx-2 text-line2">·</span>
            <span className="text-bone">{active.label}</span>
          </span>

          <div className="flex items-center gap-4">
            <UTCClock />
            <span className="tick-label hidden items-center gap-2 text-fog sm:flex">
              <ArrowUpLeft className="h-3 w-3 text-acid" />
              FEAT / WEBGL
            </span>
            <span className={`tick-label tabular-nums ${fpsTone}`}>{String(fps).padStart(3, "0")} FPS</span>
          </div>
        </div>
      </header>

      <SectionRail active={active} />

      {/* bottom-left telemetry */}
      <aside className="fixed bottom-0 left-0 z-[60] hidden border-r border-t border-line bg-ink/72 backdrop-blur-md md:block" style={slide("translateY(102%)")}> 
        <div className="grid grid-cols-4 divide-x divide-line">
          {[
            ["PXL", String(y).padStart(5, "0")],
            ["PCT", `${String(pct).padStart(2, "0")}%`],
            ["VEL", `${vel > 0 ? "+" : ""}${vel}`],
            ["DIR", dir === "IDLE" ? "·" : dir === "DOWN" ? "▼" : "▲"],
          ].map(([k, v]) => (
            <div key={k} className="px-3 py-2">
              <div className="tick-label text-fog">{k}</div>
              <div className="tick-label mt-0.5 tabular-nums text-bone">{v}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* bottom-right scroll cue */}
      <aside className="fixed bottom-4 right-4 z-[60] hidden items-center gap-3 md:flex" style={slide("translateY(102%)")}> 
        <span className="tick-label text-fog">
          {pct < 2 ? "SCROLL TO TUNE" : pct > 96 ? "END OF TRANSMISSION" : "IN MOTION"}
        </span>
        <div className="relative h-px w-16 bg-line">
          <div className="absolute inset-y-0 left-0 bg-acid transition-[width] duration-200" style={{ width: `${pct}%` }} />
        </div>
      </aside>
    </>
  );
}
