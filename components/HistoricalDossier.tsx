'use client';

import { useRef, useState, useEffect } from 'react';
import { ShieldAlert, Globe, Bookmark, FileText, Scale, ChevronLeft, ChevronRight, ArrowRight, X, Stamp, Search, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/app/components/ThemeProvider';
import { historicalCases as cases } from '../app/noi-dung-chinh/data/historicalCases';

export default function HistoricalDossier() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedCase, setSelectedCase] = useState<typeof cases[0] | null>(null);
  const { showImage } = useTheme();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCase(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-8 relative">
      {/* Header Info */}
      <div
        className="p-6 md:p-8 relative overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-card)',
          borderTop: '3px solid var(--accent-color)',
        }}
      >
        <h2
          className="text-xl md:text-2xl font-serif-heading font-black uppercase tracking-tight mb-4 pb-4"
          style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}
        >
          Hồ Sơ Các Đại Án: <span className="font-bold block sm:inline-block sm:ml-2" style={{ color: 'var(--accent-color)' }}>Lỗ Hổng Quản Trị &amp; Thực Thi Pháp Luật</span>
        </h2>
        <p
          className="font-serif-body text-xs md:text-sm leading-relaxed text-justify"
          style={{ color: 'var(--text-secondary)' }}
        >
          Nhìn lại chặng đường phát triển kinh tế, bên cạnh những bước tiến vượt bậc, chúng ta cũng ghi nhận những đại án kinh tế lớn. Đây là những bài học lịch sử về quản trị, lạm dụng tín dụng và sự tha hóa quyền lực để lại nhiều khoảng trống lý luận được Nghị quyết số 27-NQ/TW lấp đầy bằng các thiết chế kiểm soát chặt chẽ.
        </p>
      </div>

      {/* Horizontal Timeline Container */}
      <div className="relative py-4">
        <button 
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-[-16px] top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-md cursor-pointer"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          <ChevronLeft size={18} />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-[-16px] top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-md cursor-pointer"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          <ChevronRight size={18} />
        </button>

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-6 pt-2 px-2 snap-x snap-mandatory hide-scrollbar scroll-smooth relative"
        >
          {cases.map((c, index) => (
            <div 
              key={index} 
              className="relative w-[280px] min-w-[280px] md:w-[350px] md:min-w-[350px] shrink-0 snap-center flex flex-col group cursor-pointer"
              onClick={() => setSelectedCase(c)}
            >
              {/* Basic Card Overview */}
              <div
                className="h-full p-5 flex flex-col justify-between transition-all duration-300 group-hover:-translate-y-1"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-card)',
                  borderTop: '3px solid var(--accent-color)',
                }}
              >
                <div>
                  <div
                    className="flex items-center justify-between mb-3 pb-2"
                    style={{ borderBottom: '1px solid var(--border-color)' }}
                  >
                    <span
                      className="font-sans text-[9px] font-extrabold uppercase tracking-wide"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {c.category}
                    </span>
                    <span
                      className="text-[10px] font-sans font-extrabold px-2.5 py-0.5 rounded-lg"
                      style={{
                        color: 'var(--accent-color)',
                        background: 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--accent-color) 20%, transparent)',
                      }}
                    >
                      {c.year}
                    </span>
                  </div>

                  <h3
                    className="text-base font-serif-heading font-black uppercase mb-2 group-hover:text-red-500 transition-colors line-clamp-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {c.name}
                  </h3>

                  <p
                    className="font-serif-body text-xs italic mb-4 line-clamp-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >{c.context}</p>

                  {/* Thumbnail Image */}
                  {c.image && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        showImage(c.image!, `Ảnh vụ án: ${c.name}`);
                      }}
                      className="h-28 mb-4 relative overflow-hidden flex items-center justify-center cursor-zoom-in"
                      style={{
                        background: 'var(--bg-paper)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-card)',
                      }}
                    >
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover opacity-90 group-hover:scale-[1.02] transition-transform duration-500" />
                    </div>
                  )}
                </div>

                <div
                  className="pt-3 flex flex-col justify-between gap-2"
                  style={{ borderTop: '1px solid var(--border-color)' }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>
                    <ShieldAlert size={14} style={{ color: 'var(--accent-gold)' }} className="shrink-0" />
                    <span className="font-serif-body italic truncate">{c.consequence}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold uppercase mt-1" style={{ color: 'var(--accent-color)' }}>
                    <Search size={12} /> Xem Hồ sơ Wiki &amp; Phóng sự ảnh
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POPUP MODAL - WIKIPEDIA STYLE */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.75)' }}
            onClick={() => setSelectedCase(null)}
          >
            <motion.div 
              initial={{ y: 20, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-5xl max-h-[85vh] flex flex-col relative overflow-hidden z-10"
              style={{
                background: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-hover)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedCase(null)}
                className="absolute top-5 right-5 z-50 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-md cursor-pointer"
                style={{
                  background: 'var(--bg-paper)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                <X size={20} />
              </button>

              {/* SCROLLABLE CONTENT AREA */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                
                {/* HEAD */}
                <div
                  className="pb-5 mb-6 text-center"
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2" style={{ color: 'var(--accent-color)' }}>
                    <Scale size={20} />
                    <span className="font-sans text-[10px] font-extrabold uppercase tracking-wide">Hồ sơ lưu trữ Wikipedia</span>
                  </div>
                  <h1
                    className="font-serif-heading text-2xl md:text-3xl font-black uppercase leading-snug"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {selectedCase.name}
                  </h1>
                  <span className="font-serif-body italic text-sm font-bold block mt-1" style={{ color: 'var(--accent-color)' }}>
                    Đại án kinh tế ({selectedCase.year}) — Danh mục: {selectedCase.category}
                  </span>
                </div>

                {/* TWO COLUMN NEWSPAPER LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT COLUMN: TEXT */}
                  <div className="lg:col-span-7 space-y-6">
                    <p
                      className="font-serif-body text-xs md:text-sm leading-relaxed text-justify first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-2.5"
                      style={{ color: 'var(--text-primary)', }}
                    >
                      <style>{`.first-letter-accent::first-letter { color: var(--accent-color); }`}</style>
                      {selectedCase.context} {selectedCase.details}
                    </p>

                    <div className="space-y-6">
                      {selectedCase.fullDetails.map((detail, idx) => (
                        <div
                          key={idx}
                          className="p-4"
                          style={{
                            background: 'var(--bg-paper)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-card)',
                          }}
                        >
                          <h3
                            className="font-serif-heading font-black text-sm uppercase mb-2 pb-1"
                            style={{
                              color: 'var(--text-primary)',
                              borderBottom: '1px dashed var(--border-color)',
                            }}
                          >
                            {detail.title}
                          </h3>
                          <p
                            className="font-serif-body text-[11px] md:text-xs leading-relaxed text-justify"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {detail.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: MEDIA */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Image box */}
                    {selectedCase.image && (
                      <div
                        className="p-3 relative group"
                        style={{
                          background: 'var(--bg-paper)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-card)',
                        }}
                      >
                        <div 
                          onClick={() => showImage(selectedCase.image!, selectedCase.name)}
                          className="relative overflow-hidden w-full flex items-center justify-center cursor-zoom-in"
                          style={{
                            background: 'var(--bg-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-btn)',
                          }}
                        >
                          <img 
                            src={selectedCase.image} 
                            alt={selectedCase.name} 
                            className="w-full h-auto block opacity-95 group-hover:scale-[1.01] transition-transform duration-500"
                          />
                        </div>
                        <div
                          className="mt-3 pt-2"
                          style={{ borderTop: '1px dashed var(--border-color)' }}
                        >
                          <p
                            className="text-center font-serif-body italic text-[10px] px-2 leading-tight"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            Ảnh tư liệu lưu trữ vụ án. Click để xem toàn màn hình.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Legal Box */}
                    <div
                      className="p-5 space-y-3"
                      style={{
                        border: '1px solid color-mix(in srgb, var(--accent-color) 20%, transparent)',
                        background: 'color-mix(in srgb, var(--accent-color) 3%, var(--bg-card))',
                        borderRadius: 'var(--radius-card)',
                      }}
                    >
                      <span
                        className="font-sans font-extrabold uppercase tracking-wide text-[10px] block pb-1"
                        style={{ color: 'var(--accent-color)', borderBottom: '1px solid var(--border-color)' }}
                      >Phán quyết pháp luật</span>
                      <div>
                        <span
                          className="text-[9px] uppercase font-sans font-bold block mb-1"
                          style={{ color: 'var(--text-secondary)' }}
                        >Kết quả Tuyên Án</span>
                        <p
                          className="text-xs font-bold pl-2 py-0.5 leading-snug"
                          style={{
                            color: 'var(--text-primary)',
                            borderLeft: '3px solid var(--accent-color)',
                          }}
                        >{selectedCase.consequence}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MEDIA GALLERY SECTION */}
                {selectedCase.gallery && selectedCase.gallery.length > 0 && (
                  <div
                    className="mt-8 pt-6"
                    style={{ borderTop: '1px solid var(--border-color)' }}
                  >
                    <h3
                      className="text-base font-serif-heading font-black uppercase flex items-center gap-2 mb-4 tracking-wide"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <ImageIcon style={{ color: 'var(--accent-color)' }} size={18} /> Phóng Sự Ảnh Tư Liệu
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedCase.gallery.map((imgSrc, idx) => (
                        <div
                          key={idx}
                          className="p-2 shadow-sm hover:border-red-500 transition-all"
                          style={{
                            background: 'var(--bg-paper)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-card)',
                          }}
                        >
                          <div 
                            onClick={() => showImage(imgSrc, `Ảnh tư liệu #${idx + 1} - ${selectedCase.name}`)}
                            className="relative aspect-[4/3] overflow-hidden flex items-center justify-center cursor-zoom-in"
                            style={{
                              background: 'var(--bg-color)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-btn)',
                            }}
                          >
                             <img 
                              src={imgSrc} 
                              alt={`Tư liệu ${idx + 1}`} 
                              className="w-full h-full object-cover opacity-95 hover:scale-[1.02] transition-transform duration-500" 
                            />
                          </div>
                          <div
                            className="text-center mt-2 font-serif-body italic text-[9px] pt-1"
                            style={{ color: 'var(--text-secondary)', borderTop: '1px dashed var(--border-color)' }}
                          >
                            Tập hồ sơ #{idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
