import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import HUD from "./components/HUD";
import ModuleRegistry from "./components/ModuleRegistry";
import Preloader from "./components/Preloader";
import VelocityMarquee from "./components/VelocityMarquee";
import { bindTelemetry, clamp01, motion } from "./lib/motion";
import { CursorSection, ImpulseSection, MagneticSection, SpotlightSection } from "./sections/CursorDriven";
import { GlideSection, LerpSection, ParallaxSection, ProgressSection, RevealSection } from "./sections/ScrollDriven";
import { DiagnosticsSection, SequenceSection, SplitSection } from "./sections/TextSequenceDiag";
import WebGLSection from "./sections/WebGLSection";

const MARQUEE_ITEMS = [
  "REVEAL",
  "PARALLAX",
  "PROGRESS",
  "LERP",
  "GLIDE",
  "CURSOR",
  "MAGNETIC",
  "SPOTLIGHT",
  "WEBGL",
  "IMPULSE",
  "SPLIT",
  "SEQUENCE",
  "FPS",
  "TELEMETRY",
];

export default function App() {
  const [booted, setBooted] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const unbind = bindTelemetry();

    if (!motion.reduced) {
      const lenis = new Lenis({ lerp: 0.105, smoothWheel: true });
      lenis.stop(); // freeze until boot completes
      motion.lenis = lenis;
      lenisRef.current = lenis;
      lenis.on("scroll", (e: Lenis) => {
        motion.scrollY = e.scroll;
        motion.docProgress = clamp01(e.progress ?? e.scroll / Math.max(e.limit, 1));
        motion.velocityTarget = Math.max(-9000, Math.min(9000, e.velocity * 60));
      });
      let raf = 0;
      const loop = (t: number) => {
        lenis.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      const cleanup = () => {
        cancelAnimationFrame(raf);
        lenis.destroy();
        motion.lenis = null;
      };
      // native sync for non-lenis events
      const onNative = () => {
        motion.scrollY = window.scrollY;
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        motion.docProgress = clamp01(window.scrollY / Math.max(limit, 1));
      };
      window.addEventListener("scroll", onNative, { passive: true });
      return () => {
        unbind();
        window.removeEventListener("scroll", onNative);
        cleanup();
      };
    }

    const onNative = () => {
      motion.scrollY = window.scrollY;
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      motion.docProgress = clamp01(window.scrollY / Math.max(limit, 1));
    };
    window.addEventListener("scroll", onNative, { passive: true });
    onNative();
    return () => {
      unbind();
      window.removeEventListener("scroll", onNative);
    };
  }, []);

  // release scroll once booted
  useEffect(() => {
    if (booted) lenisRef.current?.start();
  }, [booted]);

  return (
    <div className="min-h-screen bg-ink font-display text-bone">
      <Preloader onExit={() => setBooted(true)} />
      <HUD booted={booted} />
      <Hero booted={booted} />
      <section id="m-marquee" data-module="+B / MARQUEE" aria-label="Module marquee">
        <VelocityMarquee items={MARQUEE_ITEMS} />
      </section>
      <ModuleRegistry />
      <RevealSection />
      <ParallaxSection />
      <ProgressSection />
      <LerpSection />
      <GlideSection />
      <CursorSection />
      <MagneticSection />
      <SpotlightSection />
      <WebGLSection />
      <ImpulseSection />
      <SplitSection />
      <SequenceSection />
      <DiagnosticsSection />
      <VelocityMarquee reverse outline baseSpeed={40} items={["TUNE THE WEB INTO MOTION", "SCROLL", "POINTER", "WEBGL"]} />
      <Footer />
    </div>
  );
}
