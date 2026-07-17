import { motion as fm, useScroll, useTransform } from "framer-motion";
import { MoveDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import HeroScene from "../three/HeroScene";
import GLStage from "./GLStage";
import ScrambleText from "./Scramble";
import { motion } from "../lib/motion";

const ease = [0.22, 1, 0.36, 1] as const;

const SPEC_LINES = [
  "SCROLL PROGRESS → GROUP ROTATION",
  "VELOCITY → VERTEX DISPLACEMENT",
  "POINTER → SCENE BANK / DRIFT",
  "DOC PROGRESS → PARTICLE ORBIT",
];

function RevealWords({
  words,
  className = "",
  delay = 0,
  active,
}: {
  words: string[];
  className?: string;
  delay?: number;
  active: boolean;
}) {
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <fm.span
            className={`inline-block will-change-transform ${w === "MOTION." ? "text-acid" : ""}`}
            initial={{ y: "115%", rotate: 4 }}
            animate={active ? { y: "0%", rotate: 0 } : { y: "115%", rotate: 4 }}
            transition={{ duration: 1.05, ease, delay: delay + i * 0.09 }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </fm.span>
        </span>
      ))}
    </span>
  );
}

/** Rotating spec dial, top-right of the hero. */
function SpecDial() {
  return (
    <div className="pointer-events-none absolute right-14 top-24 z-20 hidden lg:block">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 112 112" className="h-full w-full animate-spin-slow">
          <circle cx="56" cy="56" r="52" fill="none" stroke="#2b2b35" strokeWidth="1" strokeDasharray="3 7" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={56 + Math.cos(a) * 44}
                y1={56 + Math.sin(a) * 44}
                x2={56 + Math.cos(a) * 49}
                y2={56 + Math.sin(a) * 49}
                stroke="#2b2b35"
                strokeWidth="1.4"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="tick-label text-acid">FIELD 01</span>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ booted }: { booted: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);

  const [line, setLine] = useState(0);
  useEffect(() => {
    if (!booted) return;
    const id = window.setInterval(() => setLine((l) => (l + 1) % SPEC_LINES.length), 2600);
    return () => window.clearInterval(id);
  }, [booted]);

  return (
    <header
      ref={ref}
      id="top"
      data-module="HERO / ICOSA"
      className="relative flex h-[100svh] min-h-[620px] flex-col overflow-hidden"
    >
      {/* WebGL layer */}
      <fm.div style={{ scale: sceneScale }} className="absolute inset-0">
        <GLStage className="h-full w-full">
          <HeroScene />
        </GLStage>
      </fm.div>

      {/* corner frame ticks */}
      <div className="pointer-events-none absolute inset-4 z-10 hidden md:block">
        {(["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"] as const).map(
          (pos) => (
            <span key={pos} className={`absolute h-5 w-5 border-line2 ${pos}`} />
          )
        )}
      </div>

      <SpecDial />

      {/* content */}
      <fm.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-20 mx-auto flex h-full w-full max-w-[1440px] flex-col justify-end px-5 pb-24 md:px-10 md:pb-16"
      >
        <fm.div
          initial={{ opacity: 0 }}
          animate={{ opacity: booted ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2"
        >
          <span className="tick-label flex items-center gap-2 text-fog">
            <span className="h-1.5 w-1.5 animate-blink bg-acid" />A 3D MOTION RUNTIME
          </span>
          <span className="tick-label hidden text-line2 sm:inline">/</span>
          <span className="tick-label hidden text-fog sm:inline-block">
            <ScrambleText text={SPEC_LINES[line]} trigger={line} speed={18} className="text-acid" />
          </span>
          <span className="tick-label hidden text-line2 lg:inline">/</span>
          <span className="tick-label hidden text-fog lg:inline">
            VERTEX FIELD <span className="text-acid">{motion.touch ? "LOW" : "HI"}-RES</span>
          </span>
        </fm.div>

        <h1 className="font-display text-[clamp(2.9rem,8.6vw,8.2rem)] font-medium leading-[0.96] tracking-[-0.03em] text-bone">
          <RevealWords words={["TUNE", "THE", "WEB"]} active={booted} />
          <br />
          <RevealWords words={["INTO", "MOTION."]} delay={0.32} active={booted} />
        </h1>

        <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <fm.p
            initial={{ opacity: 0, y: 18 }}
            animate={booted ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.9, ease, delay: 0.85 }}
            className="max-w-md text-[15px] leading-relaxed text-fog"
          >
            A modular runtime for scroll-driven motion, cursor physics and interactive WebGL — wired
            together on a single page. Every module below is live. <span className="text-bone">This page is the demo.</span>
          </fm.p>

          <fm.div
            initial={{ opacity: 0 }}
            animate={{ opacity: booted ? 1 : 0 }}
            transition={{ duration: 0.9, delay: 1.15 }}
            className="flex items-center gap-3"
          >
            <span className="tick-label text-fog">SCROLL</span>
            <span className="grid h-9 w-9 place-items-center border border-line">
              <MoveDown className="h-4 w-4 animate-bounce text-acid" />
            </span>
          </fm.div>
        </div>
      </fm.div>

      {/* fade to next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-36 bg-gradient-to-t from-ink to-transparent" />
    </header>
  );
}
