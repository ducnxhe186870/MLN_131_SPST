'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '@/app/components/ThemeProvider';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const events = [
  {
    year: 'Giai đoạn 1945 - 1946',
    desc: 'Xác lập nền tảng pháp lý đầu tiên qua Tuyên ngôn Độc lập và Hiến pháp 1946, khẳng định tất cả quyền lực thuộc về nhân dân và tính tối thượng của pháp luật.',
    image: '/1945.png',
  },
  {
    year: 'Năm 1991',
    desc: 'Tại Hội nghị Trung ương 2 (Khóa VII), thuật ngữ "Nhà nước pháp quyền" chính thức xuất hiện trong văn kiện Đảng, đánh dấu bước phát triển quan trọng về lý luận.',
    image: '/19912.jpg',
  },
  {
    year: 'Năm 1994',
    desc: 'Khẳng định xây dựng Nhà nước pháp quyền là nhiệm vụ trọng tâm để phát huy dân chủ, thúc đẩy cải cách thể chế mạnh mẽ.',
    image: '/1994.jpg',
  },
  {
    year: 'Năm 2001',
    desc: 'Hiến pháp chính thức ghi nhận Việt Nam xây dựng Nhà nước pháp quyền XHCN của nhân dân, do nhân dân, vì nhân dân.',
    image: '/2001.jpg',
  },
  {
    year: 'Năm 2013',
    desc: 'Hiến pháp hoàn thiện nguyên tắc quyền lực nhà nước là thống nhất, có sự phân công, phối hợp và kiểm soát giữa các cơ quan lập pháp, hành pháp và tư pháp.',
    image: '/20132.jpg',
  },
  {
    year: 'Năm 2022',
    desc: 'Nghị quyết số 27-NQ/TW xác lập lộ trình toàn diện về xây dựng Nhà nước pháp quyền đến năm 2030 và tầm nhìn 2045 phục vụ kỷ nguyên số.',
    image: '/2022.jpg',
  }
];

export default function TimelineSlider() {
  const { isDarkMode, showImage } = useTheme();
  const [activeIdx, setActiveIdx] = useState(0);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % events.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + events.length) % events.length);
  };

  return (
    <div className="w-full relative py-4 transition-colors duration-500">
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-serif-heading font-black"
          style={{ color: 'var(--text-primary)' }}
        >
          Lịch Sử Tư Duy Lý Luận &amp; Lập Pháp
        </h2>
        <p
          className="font-serif-body text-sm max-w-xl mx-auto italic mt-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          Sự ra đời và hoàn thiện qua các cột mốc lịch sử quyết định
        </p>
      </div>

      {/* Navigation slider items */}
      <div className="relative max-w-5xl mx-auto mb-8 px-8">
        <div className="flex justify-start sm:justify-center items-center overflow-x-auto py-2 gap-2 hide-scrollbar">
          {events.map((event, index) => {
            const isActive = activeIdx === index;
            return (
              <button
                key={index}
                onClick={() => setActiveIdx(index)}
                className="px-4 py-2.5 font-sans font-bold text-[11px] uppercase tracking-wide transition-all whitespace-nowrap cursor-pointer"
                style={
                  isActive
                    ? {
                        background: 'var(--accent-color)',
                        color: '#fff',
                        border: '1px solid var(--accent-color)',
                        borderRadius: 'var(--radius-btn)',
                        boxShadow: 'var(--shadow-card)',
                        transform: 'scale(1.05)',
                      }
                    : {
                        background: 'var(--bg-card)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-btn)',
                      }
                }
              >
                {event.year}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Content Panel */}
      <div className="max-w-4xl mx-auto relative group">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--shadow-card)',
              borderTop: '3px solid var(--accent-color)',
            }}
          >
            {/* Left Side: Details */}
            <div className="md:col-span-7 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--accent-color)' }}>
                <Calendar size={14} />
                <span className="text-[9px] font-sans font-extrabold uppercase tracking-wide">Mốc Lịch Sử Quyết Định</span>
              </div>
              <h3
                className="text-xl md:text-2xl font-serif-heading font-black mb-4 leading-snug"
                style={{ color: 'var(--text-primary)' }}
              >
                {events[activeIdx].year}
              </h3>
              <p
                className="font-serif-body text-sm leading-relaxed text-justify"
                style={{ color: 'var(--text-secondary)' }}
              >
                {events[activeIdx].desc}
              </p>
            </div>

            {/* Right Side: Image container */}
            <div 
              onClick={() => showImage(events[activeIdx].image, events[activeIdx].year)}
              className="md:col-span-5 relative overflow-hidden w-full flex items-center justify-center cursor-zoom-in"
              style={{
                background: 'var(--bg-paper)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-card)',
              }}
            >
              <img 
                src={events[activeIdx].image} 
                alt={events[activeIdx].year} 
                className="w-full h-auto block opacity-90 hover:scale-[1.01] transition-transform duration-700"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Floating arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-[-16px] top-1/2 -translate-y-1/2 p-2 rounded-full shadow-md transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-[-16px] top-1/2 -translate-y-1/2 p-2 rounded-full shadow-md transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
