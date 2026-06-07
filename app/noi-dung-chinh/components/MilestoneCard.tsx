import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Milestone } from "../data/milestones";

export function MilestoneCard({
  m,
  index,
  onClick,
}: {
  m: Milestone;
  index: number;
  onClick: () => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative"
    >
      {/* connector line */}
      {index > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-[2px] h-10 bg-gradient-to-b from-transparent to-black/10" />
      )}

      <div
        className={`flex flex-col ${
          isEven ? "md:flex-row" : "md:flex-row-reverse"
        } gap-6 md:gap-10 items-center`}
      >
        {/* Date block */}
        <div className="flex-shrink-0 w-full md:w-[200px] text-center md:text-right">
          <div className="inline-block">
            <p className="text-[11px] uppercase tracking-[.3em] font-semibold text-black/40 mb-1">
              {m.year}
            </p>
            <p
              className="text-3xl md:text-4xl font-black leading-none"
              style={{ color: m.accent }}
            >
              {m.label}
            </p>
          </div>
        </div>

        {/* Icon */}
        <div
          className="relative flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${m.accent}, ${m.accent}dd)`,
          }}
        >
          {m.icon}
          <div className="absolute inset-0 rounded-2xl ring-4 ring-white/20" />
        </div>

        {/* Content */}
        <div className="flex-1 w-full">
          <button
            onClick={onClick}
            className="w-full text-left bg-[#FAF3EB] rounded-sm p-5 sm:p-6 border border-[#D1C2A5] shadow-[4px_4px_0px_0px_rgba(44,42,41,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(44,42,41,1)] transition-all group cursor-pointer"
          >
            {m.highlight && (
              <span
                className="inline-block px-2.5 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wider text-[#FAF3EB] mb-3"
                style={{ background: m.accent }}
              >
                {m.highlight}
              </span>
            )}
            <h3 className="text-xl md:text-2xl font-serif-heading font-bold text-[#2C2A29] leading-snug mb-2">
              {m.headline}
            </h3>
            <p className="font-serif-body text-[#5C554E] text-sm md:text-[15px] leading-relaxed mb-3">
              {m.body}
            </p>
            <span
              className="inline-flex items-center gap-1.5 text-xs font-sans font-bold transition-colors group-hover:gap-2.5 uppercase tracking-wider"
              style={{ color: m.accent }}
            >
              Xem chi tiết{" "}
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
