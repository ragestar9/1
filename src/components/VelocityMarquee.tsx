import { motion as fm, useAnimationFrame, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { motion } from "../lib/motion";

interface VelocityMarqueeProps {
  items: string[];
  className?: string;
  outline?: boolean;
  reverse?: boolean;
  baseSpeed?: number;
}

function Row({ items, outline, innerRef }: { items: string[]; outline: boolean; innerRef?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={innerRef} className="flex shrink-0 items-center" aria-hidden={!!innerRef ? undefined : true}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span
            className={`whitespace-nowrap px-6 font-display text-[clamp(1.6rem,3.4vw,3rem)] font-medium uppercase tracking-tight md:px-10 ${
              outline ? "text-outline" : "text-bone"
            }`}
          >
            {item}
          </span>
          <span className="h-2 w-2 bg-acid" />
        </span>
      ))}
    </div>
  );
}

/**
 * Marquee whose speed and skew are driven by scroll velocity —
 * slow cruise at rest, surges and leans as you scroll.
 */
export default function VelocityMarquee({
  items,
  className = "",
  outline = false,
  reverse = false,
  baseSpeed = outline ? 48 : 110,
}: VelocityMarqueeProps) {
  const x = useMotionValue(0);
  const skewX = useMotionValue(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const [rowW, setRowW] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const measure = () => setRowW(rowRef.current?.offsetWidth ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items]);

  useAnimationFrame((_, delta) => {
    if (!rowW) return;
    const v = motion.velocity;
    const boost = Math.min(Math.abs(v), 7000) * 0.22;
    const dir = reverse ? 1 : -1;
    const dt = Math.min(delta, 50) / 1000;

    if (motion.reduced) {
      x.set(-rowW / 2);
      return;
    }

    if (!started.current) {
      started.current = true;
      if (reverse) x.set(-rowW);
    }

    let next = x.get() + dir * (baseSpeed + boost) * dt;
    if (next <= -rowW) next += rowW;
    if (next > 0) next -= rowW;
    x.set(next);

    skewX.set(Math.max(-14, Math.min(14, v / 320)));
  });

  return (
    <div className={`mask-fade-x overflow-hidden border-y border-line py-5 md:py-7 ${className}`}>
      <fm.div style={{ x, skewX }} className="flex w-max origin-center will-change-transform">
        <Row items={items} outline={outline} innerRef={rowRef} />
        <Row items={items} outline={outline} />
      </fm.div>
    </div>
  );
}
