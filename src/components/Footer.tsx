import { motion as fm } from "framer-motion";
import { ArrowUp, ExternalLink, GitBranch } from "lucide-react";
import { useEffect, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

const credits = [
  ["RUNTIME", "STRINGTUNE × THREE.JS"],
  ["ENGINE", "THREE / WEBGL2"],
  ["BRANCH", "FEAT/THREEJS-EXTEND"],
  ["MODULES", "16 LIVE"],
];

function useUptime() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  return `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
}

export default function Footer() {
  const uptime = useUptime();
  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <fm.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1, ease }}
          className="font-display text-[clamp(2.6rem,8vw,7.4rem)] font-medium leading-[0.98] tracking-[-0.03em] text-bone"
        >
          THE WEB, NOW
          <br />
          IN <span className="text-acid">MOTION.</span>
        </fm.h2>

        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line md:mt-20 md:grid-cols-4">
          {credits.map(([k, v], i) => (
            <fm.div
              key={k}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease, delay: i * 0.08 }}
              className="bg-panel p-5"
            >
              <div className="tick-label text-fog">{k}</div>
              <div className="tick-label mt-3 text-bone">{v}</div>
            </fm.div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border border-line bg-panel px-5 py-4">
          <span className="tick-label flex items-center gap-2 text-fog">
            <span className="h-1.5 w-1.5 animate-blink bg-acid" />
            SYS NOMINAL
          </span>
          <span className="tick-label tabular-nums text-fog">
            SESSION <span className="text-bone">{uptime}</span>
          </span>
          <span className="tick-label tabular-nums text-fog">
            DRAW CALLS <span className="text-bone">2 / FRAME</span>
          </span>
          <span className="tick-label tabular-nums text-fog">
            GC PRESSURE <span className="text-acid">LOW</span>
          </span>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-6 border-t border-line pt-6 md:flex-row md:items-center">
          <a
            href="https://github.com/ragestar9/string/tree/feat/threejs-extend"
            target="_blank"
            rel="noreferrer"
            className="tick-label group flex items-center gap-3 text-bone transition-colors hover:text-acid"
          >
            <GitBranch className="h-4 w-4 text-acid" />
            RAGESTAR9 / STRING
            <ExternalLink className="h-3 w-3 text-fog transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>

          <span className="tick-label text-fog">SCENE DISPOSED · BUFFERS RELEASED · © 2026</span>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="tick-label group flex items-center gap-3 border border-line2 px-5 py-3 text-bone transition-colors duration-300 hover:border-acid hover:text-acid"
          >
            BACK TO ORIGIN
            <ArrowUp className="h-3.5 w-3.5 text-acid transition-transform duration-300 group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
    </footer>
  );
}
