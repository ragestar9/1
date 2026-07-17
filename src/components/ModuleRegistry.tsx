import { motion as fm } from "framer-motion";
import { ArrowUpRight, Map } from "lucide-react";
import { useState } from "react";
import { motion } from "../lib/motion";
import ScrambleText from "./Scramble";

const ease = [0.22, 1, 0.36, 1] as const;

const NODES = [
  { n: "01", name: "REVEAL", meta: "ENTRY / FADE / RISE / STAGGER", to: "m-reveal" },
  { n: "02", name: "PARALLAX", meta: "STACKED LAYERS / Z-FACTOR", to: "m-parallax" },
  { n: "03", name: "PROGRESS", meta: "EASED 0→1 / STICKY DIAL", to: "m-progress" },
  { n: "04", name: "LERP", meta: "VELOCITY / SIGNED DELTA / SKEW", to: "m-lerp" },
  { n: "05", name: "GLIDE", meta: "SCROLL ENERGY / ×0.4—×1.6", to: "m-glide" },
  { n: "06", name: "CURSOR", meta: "LOCAL --X --Y / PERSPECTIVE", to: "m-cursor" },
  { n: "07", name: "MAGNETIC", meta: "PULL RADIUS / SPRING RESET", to: "m-magnetic" },
  { n: "08", name: "SPOTLIGHT", meta: "LIGHT TRACK / 3D SURFACE", to: "m-spotlight" },
  { n: "+3D", name: "WEBGL", meta: "TORUS-KNOT ENGINE / SATELLITES", to: "m-webgl" },
  { n: "09", name: "IMPULSE", meta: "VELOCITY → SPRING / K & D", to: "m-impulse" },
  { n: "10", name: "SPLIT", meta: "PER-CHAR CASCADE / REPLAY", to: "m-split" },
  { n: "16", name: "SEQUENCE", meta: "FRAME 00–99 / 8 STEPS", to: "m-sequence" },
  { n: "+B", name: "MARQUEE", meta: "VELOCITY-REACTIVE / SKEW", to: "m-marquee" },
  { n: "14", name: "FPS TRACK", meta: "RAF COUNTER / SPARKLINE", to: "m-diag" },
  { n: "15", name: "POSITION", meta: "PX / PCT / DIRECTION BUS", to: "m-diag" },
];

function scrollToNode(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (motion.lenis) motion.lenis.scrollTo(el, { offset: -46, duration: 1.3 });
  else el.scrollIntoView({ behavior: "smooth" });
}

export default function ModuleRegistry() {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <section id="m-registry" data-module="+R / REGISTRY" className="relative border-t border-line">
      <div className="mx-auto max-w-[1440px] px-5 pt-14 md:px-10 md:pt-20">
        <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
          <span className="tick-label flex items-center gap-2 text-fog">
            <span className="h-1.5 w-1.5 animate-blink bg-acid" />
            MODULE <span className="text-acid">+R</span> — <span className="text-bone">SYSTEM MAP</span>
          </span>
          <span className="tick-label hidden items-center gap-2 text-fog md:flex">
            <Map className="h-3.5 w-3.5 text-acid" />
            CLICK A NODE TO JUMP
          </span>
        </div>
      </div>

      <div className="mt-6 md:mt-10">
        {NODES.map((node, i) => (
          <fm.button
            key={node.n + node.name}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-6%" }}
            transition={{ duration: 0.6, ease, delay: (i % 5) * 0.05 }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onClick={() => scrollToNode(node.to)}
            className={`group relative grid w-full grid-cols-12 items-center gap-2 border-b border-line px-5 py-4 text-left transition-colors duration-300 md:px-10 md:py-5 ${
              hover === i ? "bg-acid" : "bg-transparent hover:bg-panel"
            }`}
          >
            <span className={`tick-label col-span-2 md:col-span-1 ${hover === i ? "text-ink/70" : "text-fog"}`}>
              {node.n}
            </span>
            <span
              className={`col-span-8 font-display text-xl font-medium uppercase tracking-tight md:col-span-5 md:text-3xl ${
                hover === i ? "text-ink" : "text-bone"
              }`}
            >
              {hover === i ? <ScrambleText text={node.name} trigger={i} speed={20} /> : node.name}
            </span>
            <span className={`tick-label col-span-4 hidden truncate md:block ${hover === i ? "text-ink/70" : "text-fog"}`}>
              {node.meta}
            </span>
            <span className={`tick-label col-span-1 hidden items-center gap-1.5 md:flex ${hover === i ? "text-ink" : "text-fog"}`}>
              <span className={`h-1 w-1 ${hover === i ? "bg-ink" : "bg-acid"}`} />
              LIVE
            </span>
            <span className="col-span-2 flex justify-end md:col-span-1">
              <ArrowUpRight
                className={`h-5 w-5 transition-all duration-300 ${
                  hover === i ? "-translate-y-0.5 translate-x-0.5 text-ink" : "text-acid"
                }`}
              />
            </span>
          </fm.button>
        ))}
      </div>

      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-6 md:px-10">
        <span className="tick-label text-fog">15 NODES ONLINE · 0 DEGRADED</span>
        <span className="tick-label text-fog">
          {hover !== null ? `→ ${NODES[hover].to.replace("m-", "").toUpperCase()}` : "IDLE"}
        </span>
      </div>
    </section>
  );
}
