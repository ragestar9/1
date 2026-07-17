import { motion as fm } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { motion } from "../lib/motion";

const BOOT_LINES = [
  "STRINGREVEAL",
  "STRINGPARALLAX",
  "STRINGPROGRESS",
  "STRINGLERP",
  "STRINGGLIDE",
  "STRINGCURSOR",
  "STRINGMAGNETIC",
  "STRINGSPOTLIGHT",
  "LONGSTRING.GL",
  "STRINGIMPULSE",
  "STRINGSPLIT",
  "STRINGSEQUENCE",
  "STRINGDIAG",
  "WEBGL CONTEXT",
  "GPU BUFFERS",
  "RAF LOOP",
];

export default function Preloader({ onExit }: { onExit: () => void }) {
  const [pct, setPct] = useState(0);
  const [line, setLine] = useState(0);
  const [phase, setPhase] = useState<"count" | "exit" | "gone">("count");
  const exitRef = useRef(onExit);
  exitRef.current = onExit;

  // progress count
  useEffect(() => {
    const t0 = performance.now();
    const dur = motion.reduced ? 400 : 1500;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setPct(Math.round(e * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        window.setTimeout(() => {
          setPhase("exit");
          exitRef.current();
        }, 260);
      }
    };
    raf = requestAnimationFrame(tick);
    const li = window.setInterval(() => setLine((l) => (l + 1) % BOOT_LINES.length), 78);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(li);
    };
  }, []);

  // unmount after exit animation
  useEffect(() => {
    if (phase !== "exit") return;
    const id = window.setTimeout(() => setPhase("gone"), 1050);
    return () => window.clearTimeout(id);
  }, [phase]);

  // lock scroll while booting
  useEffect(() => {
    document.documentElement.classList.toggle("overflow-hidden", phase === "count");
    return () => document.documentElement.classList.remove("overflow-hidden");
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <fm.div
      initial={{ y: 0 }}
      animate={{ y: phase === "exit" ? "-101%" : "0%" }}
      transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[100] flex flex-col bg-ink"
    >
      {/* top meta */}
      <div className="flex h-12 items-center justify-between border-b border-line px-4 md:px-8">
        <span className="tick-label flex items-center gap-2 text-bone">
          <span className="h-1.5 w-1.5 animate-blink bg-acid" />
          STRINGRUNTIME — BOOT SEQUENCE
        </span>
        <span className="tick-label text-fog">FEAT / THREEJS-EXTEND</span>
      </div>

      {/* center counter */}
      <div className="relative flex flex-1 items-center justify-center">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative text-center">
          <div className="font-mono text-[clamp(5rem,18vw,14rem)] font-light leading-none tabular-nums text-bone">
            {String(pct).padStart(3, "0")}
            <span className="text-acid">%</span>
          </div>
          <div className="tick-label mt-4 text-fog">
            LOADING <span className="text-acid">{BOOT_LINES[line]}</span>
            <span className="animate-blink">_</span>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-line">
        <div className="flex h-10 items-center justify-between px-4 md:px-8">
          <span className="tick-label tabular-nums text-fog">
            MODULE {String(Math.min(BOOT_LINES.length, Math.floor((pct / 100) * 16) + 1)).padStart(2, "0")}/16
          </span>
          <span className="tick-label text-fog">{pct < 100 ? "INITIALIZING" : "GREEN — MOUNTING"}</span>
        </div>
        <div className="h-1 w-full bg-line">
          <div className="h-full bg-acid transition-[width] duration-100" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </fm.div>
  );
}
