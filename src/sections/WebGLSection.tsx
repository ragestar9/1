import { useMotionValueEvent, useScroll } from "framer-motion";
import { Cpu } from "lucide-react";
import { useRef, useState } from "react";
import GLStage from "../components/GLStage";
import SectionShell from "../components/SectionShell";
import { motion } from "../lib/motion";
import OrbitScene, { SceneChannel } from "../three/OrbitScene";

export default function WebGLSection() {
  const ref = useRef<HTMLDivElement>(null);
  const channel = useRef<SceneChannel>({ progress: 0 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const [readouts, setReadouts] = useState({ p: 0, v: 0 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    channel.current.progress = v;
    setReadouts({ p: Math.round(v * 100), v: Math.round(motion.velocity) });
  });

  return (
    <SectionShell
      id="m-webgl"
      index="+3D"
      module="LONGSTRING.GL"
      title="A real WebGL scene, driven by the runtime."
      blurb="A torus-knot engine with three satellite bodies on a live GL context. Section progress spins the rig, scroll velocity agitates the satellites, the pointer banks the whole frame."
      tags={["THREE.JS", "60FPS", "GPU"]}
    >
      <div className="mx-auto max-w-[1440px] px-5 pb-16 md:px-10 md:pb-24">
        <div ref={ref} className="relative border border-line bg-ink2">
          <GLStage className="h-[58vh] min-h-[400px] w-full md:h-[74vh]" cameraZ={6.4}>
            <OrbitScene channel={channel.current} />
          </GLStage>

          {/* overlay chrome */}
          <div className="tick-label pointer-events-none absolute left-4 top-4 flex items-center gap-2 text-fog">
            <span className="h-1.5 w-1.5 animate-blink bg-acid" />
            WEBGL CONTEXT — LIVE
          </div>
          <div className="tick-label pointer-events-none absolute right-4 top-4 flex items-center gap-2 text-fog">
            <Cpu className="h-3.5 w-3.5 text-acid" />
            DPR ×{motion.dpr.toFixed(1)}
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-wrap items-end justify-between gap-4 p-4">
            <div className="grid grid-cols-3 divide-x divide-line border border-line bg-ink/80 backdrop-blur-md">
              {[
                ["SECTION", `${String(readouts.p).padStart(3, "0")}%`],
                ["VELOCITY", `${readouts.v > 0 ? "+" : ""}${readouts.v}`],
                ["FRAGMENTS", "220 × 26"],
              ].map(([k, v]) => (
                <div key={k} className="px-3 py-2">
                  <div className="tick-label text-fog">{k}</div>
                  <div className="tick-label mt-0.5 tabular-nums text-bone">{v}</div>
                </div>
              ))}
            </div>
            <span className="tick-label hidden text-fog md:block">ROT.Y ← Σ VELOCITY · ROT.X ← SECTION PROGRESS</span>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
