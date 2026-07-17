import { useEffect, useRef, useState } from "react";
import { motion } from "../lib/motion";

const CHARS = "█▓▒<>/#*+=-";

/**
 * Text that decodes into place — characters resolve left to right
 * from a glyph storm. Re-scrambles whenever `text` or `trigger` changes.
 */
export default function ScrambleText({
  text,
  trigger,
  className = "",
  speed = 26,
}: {
  text: string;
  trigger?: number | string;
  className?: string;
  speed?: number;
}) {
  const [out, setOut] = useState(text);
  const frame = useRef(0);

  useEffect(() => {
    if (motion.reduced) {
      setOut(text);
      return;
    }
    frame.current = 0;
    const id = window.setInterval(() => {
      frame.current += 1;
      const f = frame.current;
      const total = text.length;
      if (f >= total + 4) {
        setOut(text);
        window.clearInterval(id);
        return;
      }
      setOut(
        text
          .split("")
          .map((c, i) => {
            if (i < f - 2) return c;
            if (c === " ") return " ";
            return CHARS[(i * 17 + f * 31) % CHARS.length];
          })
          .join("")
      );
    }, speed);
    return () => window.clearInterval(id);
  }, [text, trigger, speed]);

  return (
    <span className={`inline-block tabular-nums ${className}`} aria-label={text}>
      {out}
    </span>
  );
}
