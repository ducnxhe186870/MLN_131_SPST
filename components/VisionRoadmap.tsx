'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from '@/app/components/ThemeProvider';
import { Milestone, Flag, Calendar } from 'lucide-react';

export default function VisionRoadmap() {
  const { isDarkMode, showImage } = useTheme();
  const [selectedYear, setSelectedYear] = useState<'2030' | '2045'>('2030');

  const visions = {
    '2030': {
      year: '2030',
      title: 'Hoàn thiện cơ bản cơ chế Pháp quyền',
      content: 'Hoàn thiện cơ bản cơ chế bảo đảm quyền làm chủ của Nhân dân; thượng tôn pháp luật trở thành chuẩn mực ứng xử chung của mọi chủ thể trong xã hội; hoàn thành xây dựng nền hành chính công phục vụ và hệ thống tư pháp chuyên nghiệp, nghiêm minh, công bằng.'
    },
    '2045': {
      year: '2045',
      title: 'Phát triển toàn diện & Thượng tôn tối cao',
      content: 'Việt Nam trở thành quốc gia phát triển, có thu nhập cao; Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam hoạt động hiệu lực, hiệu quả tối ưu, bảo vệ quyền con người, quyền công dân một cách toàn diện và tối đa.'
    }
  };

  const activeVision = visions[selectedYear];

  return (
    <div className="w-full relative py-4 transition-colors duration-500">
      
      {/* Title area */}
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-serif-heading font-black"
          style={{ color: 'var(--text-primary)' }}
        >
          Tầm Nhìn Chiến Lược 2030 - 2045
        </h2>
        <p
          className="font-serif-body text-sm max-w-xl mx-auto italic mt-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          Lộ trình xây dựng và hoàn thiện Nhà nước pháp quyền Việt Nam trong giai đoạn phát triển mới
        </p>
      </div>

      {/* Interactive Roadmap Track */}
      <div className="max-w-2xl mx-auto mb-10 relative px-12">
        {/* Connector Line */}
        <div
          className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 z-0"
          style={{ background: 'var(--border-color)' }}
        ></div>
        
        <div className="flex justify-between items-center relative z-10">
          {/* Year 2030 Node */}
          <button
            onClick={() => setSelectedYear('2030')}
            className="flex flex-col items-center gap-3 cursor-pointer group"
          >
            <div
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all"
              style={
                selectedYear === '2030'
                  ? { background: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: '#fff', transform: 'scale(1.1)', boxShadow: 'var(--shadow-card)' }
                  : { background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }
              }
            >
              <Milestone size={18} />
            </div>
            <span
              className="font-sans font-bold text-xs tracking-wide transition-colors"
              style={{ color: selectedYear === '2030' ? 'var(--accent-color)' : 'var(--text-secondary)' }}
            >NĂM 2030</span>
          </button>

          {/* Year 2045 Node */}
          <button
            onClick={() => setSelectedYear('2045')}
            className="flex flex-col items-center gap-3 cursor-pointer group"
          >
            <div
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all"
              style={
                selectedYear === '2045'
                  ? { background: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: '#fff', transform: 'scale(1.1)', boxShadow: 'var(--shadow-card)' }
                  : { background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }
              }
            >
              <Flag size={18} />
            </div>
            <span
              className="font-sans font-bold text-xs tracking-wide transition-colors"
              style={{ color: selectedYear === '2045' ? 'var(--accent-color)' : 'var(--text-secondary)' }}
            >NĂM 2045</span>
          </button>
        </div>
      </div>

      {/* Showcase Panel */}
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedYear}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
          >
            {/* Left Column: Vision Details */}
            <div
              className="md:col-span-7 flex flex-col justify-center p-6 md:p-8 min-h-[260px]"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
                borderTop: '3px solid var(--accent-color)',
              }}
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--accent-color)' }}>
                <Calendar size={14} />
                <span className="text-[9px] font-sans font-extrabold uppercase tracking-wide">Mốc Chiến Lược Phát Triển</span>
              </div>
              <h3
                className="text-xl font-serif-heading font-black mb-2 leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Tầm nhìn năm {activeVision.year}
              </h3>
              <h4 className="text-sm font-serif-body font-bold mb-3" style={{ color: 'var(--accent-color)' }}>
                {activeVision.title}
              </h4>
              <p
                className="font-serif-body text-xs leading-relaxed text-justify"
                style={{ color: 'var(--text-secondary)' }}
              >
                {activeVision.content}
              </p>
            </div>

            {/* Right Column: Illustration */}
            <div 
              onClick={() => showImage('/images/vision/17489359243.jpg', `Tầm nhìn phát triển Việt Nam năm ${selectedYear}`)}
              className="md:col-span-5 relative overflow-hidden w-full flex items-center justify-center cursor-zoom-in"
              style={{
                background: 'var(--bg-paper)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <img
                src="/images/vision/17489359243.jpg"
                alt={`Tầm nhìn phát triển Việt Nam năm ${selectedYear}`}
                className="w-full h-auto block opacity-90 hover:scale-[1.01] transition-transform duration-700"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
