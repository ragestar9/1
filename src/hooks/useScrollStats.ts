import { useEffect, useState } from "react";
import { motion } from "../lib/motion";

export interface ScrollStats {
  y: number;
  pct: number;
  vel: number;
  dir: "DOWN" | "UP" | "IDLE";
}

/** Reacts ~4×/s to the motion store for readouts (throttled, cheap). */
export function useScrollStats(): ScrollStats {
  const [stats, setStats] = useState<ScrollStats>({ y: 0, pct: 0, vel: 0, dir: "IDLE" });

  useEffect(() => {
    let prev = 0;
    const id = window.setInterval(() => {
      const y = motion.scrollY;
      const dir = y > prev + 0.5 ? "DOWN" : y < prev - 0.5 ? "UP" : "IDLE";
      prev = y;
      setStats({
        y: Math.round(y),
        pct: Math.round(motion.docProgress * 100),
        vel: Math.round(motion.velocity),
        dir,
      });
    }, 120);
    return () => window.clearInterval(id);
  }, []);

  return stats;
}
