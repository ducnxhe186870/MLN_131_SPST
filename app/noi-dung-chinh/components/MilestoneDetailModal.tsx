import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Calendar, MapPin, Search } from "lucide-react";
import Image from "next/image";
import { Milestone } from "../data/milestones";

export function MilestoneDetailModal({
  m,
  isOpen,
  onClose,
}: {
  m: Milestone | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && m && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-full lg:max-w-5xl xl:max-w-6xl rounded-t-lg sm:rounded-lg overflow-hidden pointer-events-auto flex flex-col max-h-[95vh] relative"
              style={{
                background: "#F9F6F0",
                backgroundImage:
                  'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* Top Thick Border for Newspaper look */}
              <div className="h-3 w-full bg-[#2C2A29]" />
              <div className="h-1 w-full bg-[#2C2A29] mt-1" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors border border-black/10"
              >
                <X size={24} className="text-[#2C2A29]" />
              </button>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 lg:p-12 overscroll-contain">
                {/* HEADLINE SECTION - The "Masthead" */}
                <div className="text-center mb-10 pb-8 border-b-2 border-dashed border-[#2C2A29]/30">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <span className="w-16 h-[1px] bg-[#2C2A29]"></span>
                    <span className="text-xs uppercase tracking-[0.3em] font-sans font-bold text-[#555]">
                      {m.year}
                    </span>
                    <span className="w-16 h-[1px] bg-[#2C2A29]"></span>
                  </div>

                  {m.highlight && (
                    <span
                      className="inline-block px-3 py-1 mb-6 text-xs font-sans font-black uppercase tracking-[.2em] text-white"
                      style={{ background: m.accent }}
                    >
                      {m.highlight}
                    </span>
                  )}

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-heading font-black text-[#1a1a1a] leading-[1.1] uppercase tracking-wider mx-auto max-w-4xl">
                    {m.headline}
                  </h1>

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-serif-body italic text-[#666]">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} /> Ngày phát hành: {m.label} năm{" "}
                      {m.year}
                    </div>
                  </div>
                </div>

                {/* TWO COLUMN NEWSPAPER LAYOUT */}
                <div className="lg:flex gap-12">
                  {/* LEFT COLUMN: Main Text text (approx 60%) */}
                  <div className="lg:w-[60%] mb-10 lg:mb-0">
                    {/* The First Paragraph w/ Drop Cap */}
                    {m.detailContent.length > 0 && (
                      <div className="mb-6 relative">
                        <p className="text-[17px] sm:text-[18px] font-serif-body text-[#2C2A29] leading-[1.9] text-justify">
                          <span
                            className="float-left text-6xl leading-[0.8] font-serif-heading font-black pr-2 pt-2"
                            style={{ color: m.accent }}
                          >
                            {m.detailContent[0].charAt(0)}
                          </span>
                          {m.detailContent[0].substring(1)}
                        </p>
                      </div>
                    )}

                    {/* Pull Quote Box for emphasis */}
                    <blockquote
                      className="my-8 p-6 sm:p-8 border-y-4 border-[#2C2A29] bg-white/50 italic font-serif-heading text-xl sm:text-2xl text-center leading-relaxed"
                      style={{ color: m.accent }}
                    >
                      "{m.body}"
                    </blockquote>

                    {/* Remaining Paragraphs (Columns for larger screens) */}
                    <div className="columns-1 sm:columns-2 gap-8 text-[15px] sm:text-[16px] font-serif-body text-[#2C2A29] leading-[1.8] text-justify space-y-4">
                      {m.detailContent.slice(1).map((p, i) => (
                        <p key={i} className="mb-4">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Image & Archives Box (approx 40%) */}
                  <div className="lg:w-[40%] flex flex-col gap-8">
                    {/* The "Photograph" */}
                    <div className="p-2 bg-white border border-[#ccc] shadow-sm transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                      <div className="relative w-full aspect-[4/3] bg-neutral-200">
                        <Image
                          src={m.image}
                          alt={m.headline}
                          fill
                          className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                          sizes="(max-width: 1024px) 100vw, 40vw"
                        />
                      </div>
                      <p className="p-3 text-[13px] font-serif-body italic text-[#444] border-t border-dashed border-[#ccc] mt-2 leading-relaxed bg-[#f8f8f8]">
                        <span className="font-bold font-sans uppercase text-[10px] mr-2">
                          Ảnh tư liệu:
                        </span>
                        {m.imageCaption}
                      </p>
                    </div>

                    {/* Archives Callout Box */}
                    <div className="border-4 border-[#2C2A29] bg-white p-6 relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-[#2C2A29] flex items-center gap-2">
                        <Search size={16} />
                        <span className="font-sans font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap">
                          Hồ Sơ Lưu Trữ Quốc Gia
                        </span>
                      </div>

                      <ul className="mt-4 space-y-3 font-serif-body text-[14px] text-[#333]">
                        {m.detailBullets.map((b, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 border-b border-dashed border-neutral-200 pb-2 last:border-0"
                          >
                            <span className="text-[#DA251D] font-bold">
                              ■
                            </span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      {m.sourceLink && (
                        <a
                          href={m.sourceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 block w-full text-center py-3 bg-[#2C2A29] hover:bg-[#DA251D] text-white font-sans font-bold uppercase tracking-widest text-xs transition-colors group flex items-center justify-center gap-2"
                        >
                          Truy xuất văn kiện gốc
                          <ExternalLink
                            size={14}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Thick Border */}
                <div className="mt-12 h-1 w-full bg-[#2C2A29]" />
                <div className="mt-1 h-[2px] w-full bg-[#2C2A29] opacity-50" />
                <div className="text-center mt-4 text-[10px] font-sans uppercase tracking-[0.2em] text-[#888]">
                  Số {m.year} • Lưu trữ Quốc Gia Việt Nam
                </div>
              </div>

              {/* Mobile Close Bar */}
              <div className="lg:hidden p-4 border-t border-black/10 bg-[#EFECE6] text-center">
                <button
                  onClick={onClose}
                  className="font-sans font-bold uppercase tracking-widest text-xs py-3 px-8 border-2 border-[#2C2A29] text-[#2C2A29] hover:bg-[#2C2A29] hover:text-white transition-colors w-full sm:w-auto"
                >
                  Gập tài liệu lại
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
