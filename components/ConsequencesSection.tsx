'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, ShieldAlert, Award, Users, DollarSign, Sparkles, HelpCircle } from 'lucide-react';

export default function ConsequencesSection() {
  const [activeIdx, setActiveIdx] = useState(3); // Default to Institutional (highest tier)

  const consequences = [
    {
      id: 'economic',
      title: 'Tổn hại nghiêm trọng nền kinh tế',
      desc: 'Làm thất thoát khổng lồ nguồn lực ngân sách nhà nước, bóp méo môi trường cạnh tranh lành mạnh. Tham nhũng đẩy chi phí giao dịch không chính thức lên cao, làm nản lòng các nhà đầu tư nước ngoài và làm giảm hiệu quả của các dự án hạ tầng công cộng.',
      icon: DollarSign,
      impact: 'Kinh tế',
      severity: 'Nghiêm trọng',
      details: [
        'Làm thất thoát nguồn thuế và tài nguyên quốc gia.',
        'Tạo ra sự cạnh tranh không lành mạnh dựa trên quan hệ và hối lộ.',
        'Làm tăng nợ công do các dự án đầu tư kém hiệu quả.'
      ]
    },
    {
      id: 'political',
      title: 'Suy giảm niềm tin của nhân dân',
      desc: 'Làm xói mòn và suy giảm nghiêm trọng niềm tin của nhân dân vào sự lãnh đạo của Đảng và hoạt động của bộ máy nhà nước. Đây là kẽ hở lớn để các thế lực thù địch lợi dụng để xuyên tạc, kích động và chống phá chế độ.',
      icon: ShieldAlert,
      impact: 'Chính trị',
      severity: 'Đặc biệt nguy hại',
      details: [
        'Làm suy yếu hiệu lực thực thi pháp luật và mệnh lệnh hành chính.',
        'Làm lung lay khối đại đoàn kết toàn dân tộc.',
        'Đe dọa sự ổn định chính trị và an ninh trật tự xã hội.'
      ]
    },
    {
      id: 'social',
      title: 'Gia tăng bất bình đẳng xã hội',
      desc: 'Làm lệch lạc dòng chảy phân bổ tài nguyên quốc gia. Tiền của thay vì đầu tư cho y tế, giáo dục lại chảy vào túi các cá nhân thoái hóa, phân hóa giàu nghèo sâu sắc và tước đi cơ hội phát triển công bằng của người nghèo.',
      icon: Users,
      impact: 'Xã hội',
      severity: 'Nghiêm trọng',
      details: [
        'Làm trầm trọng hóa sự chênh lệch giàu nghèo.',
        'Cản trở tiếp cận y tế, giáo dục công bằng của người thu nhập thấp.',
        'Suy giảm phúc lợi xã hội dành cho người yếu thế.'
      ]
    },
    {
      id: 'institutional',
      title: 'Tha hóa đạo đức công vụ',
      desc: 'Làm suy đồi các giá trị đạo đức công chức công vụ công quyền, làm méo mó mục tiêu phục vụ nhân dân. Tham nhũng hình thành cơ chế "chạy chọt", đưa hối lộ trở thành thói quen ngầm, làm tê liệt hiệu năng quản lý của nhà nước.',
      icon: Award,
      impact: 'Thể chế',
      severity: 'Nguy kịch nhất',
      details: [
        'Vô hiệu hóa tính khách quan và thượng tôn pháp luật.',
        'Làm suy thoái đạo đức, lối sống của một bộ phận cán bộ.',
        'Phá hỏng cơ chế tuyển dụng, bổ nhiệm nhân sự liêm chính.'
      ]
    }
  ];

  // Map pyramid index to consequences indexes
  // Top (Tier 1) -> Institutional (index 3)
  // Tier 2 -> Political (index 1)
  // Tier 3 -> Social (index 2)
  // Tier 4 (Base) -> Economic (index 0)
  const tierMapping = [3, 1, 2, 0];
  const activeCause = consequences[activeIdx];
  const ActiveIcon = activeCause.icon;

  return (
    <div className="w-full py-4 transition-colors duration-500">
      {/* Title block */}
      <div className="text-center mb-8">
        <span
          className="text-[9px] font-sans font-extrabold uppercase tracking-wide px-3 py-1 rounded-md"
          style={{
            color: 'var(--accent-color)',
            backgroundColor: 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
            border: '1px solid var(--accent-color)',
          }}
        >
          CHƯƠNG III: HỆ QUẢ &amp; TÁC HẠI
        </span>
        <h2
          className="text-2xl md:text-3xl font-serif-heading font-black mt-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Hệ Quả Nghiêm Trọng Của Tham Nhũng
        </h2>
        <p
          className="font-serif-body text-xs md:text-sm max-w-xl mx-auto italic mt-1.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          Tác động tàn phá đa tầng phá hoại sự phát triển bền vững và tính liêm chính thể chế
        </p>
      </div>

      {/* Interactive content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
        
        {/* Left Side: Interactive SVG Pyramid */}
        <div
          className="lg:col-span-6 flex flex-col justify-center items-center p-6 min-h-[400px] rounded-xl relative"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderTop: '3px solid var(--accent-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="absolute top-4 left-4 flex items-center gap-1 text-[9px] font-sans font-extrabold uppercase tracking-wide">
            <Sparkles size={12} style={{ color: 'var(--accent-gold)' }} /> <span style={{ color: 'var(--text-secondary)' }}>Tháp tác hại phân cấp (Pyramid)</span>
          </div>

          {/* SVG Pyramid drawing */}
          <div className="hidden sm:block w-full max-w-[320px] aspect-[1/1] mt-6">
            <svg viewBox="0 0 320 320" className="w-full h-full filter drop-shadow-md">
              <defs>
                <linearGradient id="roseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FB7185" />
                  <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
                <linearGradient id="amberGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>
                <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>

              {/* Tier 1 (Apex): Institutional (Index 3) */}
              <polygon 
                points="160,20 195,90 125,90" 
                onClick={() => setActiveIdx(3)}
                className={`cursor-pointer transition-all duration-300 ${
                  activeIdx === 3 
                    ? 'fill-[url(#roseGrad)] stroke-red-500 stroke-[3px]' 
                    : 'fill-rose-500/20 stroke-rose-500/50 hover:fill-rose-500/40'
                }`}
              />
              <text x="160" y="65" textAnchor="middle" className="pointer-events-none fill-white font-sans font-extrabold text-[8px] uppercase tracking-wide">Thể chế</text>

              {/* Tier 2: Political (Index 1) */}
              <polygon 
                points="125,90 195,90 230,160 90,160" 
                onClick={() => setActiveIdx(1)}
                className={`cursor-pointer transition-all duration-300 ${
                  activeIdx === 1 
                    ? 'fill-[url(#amberGrad)] stroke-amber-500 stroke-[3px]' 
                    : 'fill-amber-500/20 stroke-amber-500/50 hover:fill-amber-500/40'
                }`}
              />
              <text x="160" y="130" textAnchor="middle" className="pointer-events-none fill-white font-sans font-extrabold text-[8px] uppercase tracking-wide">Chính trị</text>

              {/* Tier 3: Social (Index 2) */}
              <polygon 
                points="90,160 230,160 265,230 55,230" 
                onClick={() => setActiveIdx(2)}
                className={`cursor-pointer transition-all duration-300 ${
                  activeIdx === 2 
                    ? 'fill-[url(#indigoGrad)] stroke-indigo-500 stroke-[3px]' 
                    : 'fill-indigo-500/20 stroke-indigo-500/50 hover:fill-indigo-500/40'
                }`}
              />
              <text x="160" y="200" textAnchor="middle" className="pointer-events-none fill-white font-sans font-extrabold text-[8px] uppercase tracking-wide">Xã hội</text>

              {/* Tier 4 (Base): Economic (Index 0) */}
              <polygon 
                points="55,230 265,230 300,300 20,300" 
                onClick={() => setActiveIdx(0)}
                className={`cursor-pointer transition-all duration-300 ${
                  activeIdx === 0 
                    ? 'fill-[url(#blueGrad)] stroke-blue-500 stroke-[3px]' 
                    : 'fill-blue-500/20 stroke-blue-500/50 hover:fill-blue-500/40'
                }`}
              />
              <text x="160" y="270" textAnchor="middle" className="pointer-events-none fill-white font-sans font-extrabold text-[8px] uppercase tracking-wide">Kinh tế</text>
            </svg>
          </div>

          {/* Mobile Fallback Switcher */}
          <div className="sm:hidden w-full grid grid-cols-2 gap-2 mt-6">
            {consequences.map((c, i) => {
              const TabIcon = c.icon;
              const isActive = activeIdx === i;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveIdx(i)}
                  className="flex items-center gap-2 p-2.5 rounded-lg text-left cursor-pointer transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--accent-color)' : 'var(--bg-paper)',
                    border: `1px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`,
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  <TabIcon size={14} />
                  <span className="font-sans font-bold text-[9px] uppercase tracking-wide truncate">{c.impact}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <span
              className="text-[10px] font-serif-body italic"
              style={{ color: 'var(--text-secondary)' }}
            >
              — Click chọn tầng tháp tương ứng để xem phân tích chi tiết —
            </span>
          </div>
        </div>

        {/* Right Side: Detail Card */}
        <div className="lg:col-span-6 flex">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
              className="p-6 md:p-8 flex flex-col justify-between w-full rounded-xl relative"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderTop: '3px solid var(--accent-color)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div>
                {/* Header info */}
                <div
                  className="flex items-center justify-between mb-5 pb-3"
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                >
                  <div className="flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
                      }}
                    >
                      <ActiveIcon size={18} />
                    </div>
                    <span className="text-[10px] font-sans font-extrabold uppercase tracking-wide">Thiệt hại {activeCause.impact}</span>
                  </div>
                  <span
                    className="text-[9px] font-sans font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-md"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
                      color: 'var(--accent-color)',
                      border: '1px solid color-mix(in srgb, var(--accent-color) 20%, transparent)',
                    }}
                  >
                    Mức độ: {activeCause.severity}
                  </span>
                </div>

                {/* Content */}
                <h3
                  className="text-base md:text-lg font-serif-heading font-black mb-3"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {activeCause.title}
                </h3>
                <p
                  className="text-xs font-serif-body leading-relaxed text-justify mb-5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {activeCause.desc}
                </p>

                {/* Bullets */}
                <div className="space-y-2.5">
                  <h4
                    className="text-[9px] font-sans font-extrabold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    BIỂU HIỆN VÀ TÁC ĐỘNG CỤ THỂ
                  </h4>
                  {activeCause.details.map((bullet, bIdx) => (
                    <div
                      key={bIdx}
                      className="flex items-start gap-2.5 p-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--bg-paper)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                        style={{ backgroundColor: 'var(--accent-color)' }}
                      />
                      <span
                        className="text-[11px] font-serif-body"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {bullet}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
