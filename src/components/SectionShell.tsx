import { motion as fm } from "framer-motion";
import { ReactNode } from "react";

interface SectionShellProps {
  id?: string;
  index: string;
  module: string;
  title: string;
  blurb: string;
  tags?: string[];
  children: ReactNode;
  className?: string;
  borderless?: boolean;
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function SectionShell({
  id,
  index,
  module,
  title,
  blurb,
  tags,
  children,
  className = "",
  borderless = false,
}: SectionShellProps) {
  return (
    <section
      id={id}
      data-module={`${index} / ${module}`}
      className={`relative ${borderless ? "" : "border-t border-line"} ${className}`}
    >
      {/* header */}
      <div className="mx-auto max-w-[1440px] px-5 pt-14 md:px-10 md:pt-20">
        <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 animate-blink bg-acid" />
            <span className="tick-label text-fog">
              MODULE <span className="text-bone">{index}</span> — <span className="text-acid">{module}</span>
            </span>
          </div>
          {tags && (
            <div className="hidden gap-2 md:flex">
              {tags.map((t) => (
                <span key={t} className="tick-label border border-line px-2 py-1 text-fog">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 pb-10 pt-8 md:grid-cols-12 md:pb-16 md:pt-12">
          <div className="md:col-span-7">
            <fm.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ duration: 0.9, ease }}
              className="text-balance font-display text-[clamp(2rem,4.2vw,3.6rem)] font-medium leading-[1.02] tracking-tight text-bone"
            >
              {title}
            </fm.h2>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <fm.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ duration: 0.9, ease, delay: 0.12 }}
              className="max-w-sm text-[15px] leading-relaxed text-fog"
            >
              {blurb}
            </fm.p>
          </div>
        </div>
      </div>

      {children}
    </section>
  );
}
