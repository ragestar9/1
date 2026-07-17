import { Canvas } from "@react-three/fiber";
import { useInView } from "framer-motion";
import { ReactNode, useRef } from "react";
import { motion } from "../lib/motion";

/**
 * Canvas wrapper with lifecycle discipline:
 * renders only while on-screen and drops to a single static frame
 * under prefers-reduced-motion.
 */
export default function GLStage({
  children,
  className = "",
  cameraZ = 6,
}: {
  children: ReactNode;
  className?: string;
  cameraZ?: number;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const inView = useInView(holder, { margin: "160px" });

  return (
    <div ref={holder} className={`relative ${className}`}>
      {/* DOM fallback underneath — visible if the context is slow/blocked */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,255,46,0.07),transparent_62%)]" />
      <Canvas
        className="absolute inset-0"
        dpr={[1, motion.touch ? 1.5 : 1.8]}
        camera={{ fov: 42, position: [0, 0, cameraZ], near: 0.1, far: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={motion.reduced ? "demand" : inView ? "always" : "never"}
        style={{ position: "absolute", inset: 0 }}
      >
        {children}
      </Canvas>
    </div>
  );
}
