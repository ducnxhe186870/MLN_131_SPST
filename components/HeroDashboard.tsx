'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/app/components/ThemeProvider';
import { ArrowRight, BookOpen, Compass, Award, Users, ShieldAlert, Sparkles, Scale } from 'lucide-react';
import Link from 'next/link';

export default function HeroDashboard({ onSelectTab }: { onSelectTab?: (tab: string) => void }) {
  const { isDarkMode } = useTheme();

  return (
    <div className="w-full relative py-4 md:py-8 transition-colors duration-500">

      <div className="relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Bold Typographic Introduction */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="space-y-5"
            >
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--accent-color)' }}></span>
                  <span className="relative rounded-full h-2 w-2" style={{ background: 'var(--accent-color)' }}></span>
                </span>
                <span
                  className="font-sans font-extrabold text-[9px] uppercase tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}
                >Hệ thống Nghiên cứu Học thuật</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif-heading font-black tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
                Nhà nước Pháp quyền <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-650 via-red-500 to-amber-500">
                  Xã hội Chủ nghĩa
                </span> <br />
                Việt Nam
              </h1>

              <p
                className="font-serif-body text-xs md:text-sm leading-relaxed text-justify"
                style={{ color: 'var(--text-secondary)' }}
              >
                Chuyên đề nghiên cứu học thuật cấp cao về lịch sử xây dựng pháp quyền, lý luận cách mạng và hệ giải pháp chính sách, chuyển đổi số trong phòng ngừa, đấu tranh chống tham nhũng dưới sự dẫn dắt lý luận của Đảng Cộng sản Việt Nam.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => onSelectTab?.('causes')}
                  className="inline-flex items-center gap-2 px-6 py-3 font-sans font-extrabold text-[10px] uppercase tracking-wide text-white hover:-translate-y-0.5 shadow-sm transition-all cursor-pointer"
                  style={{
                    background: 'var(--accent-color)',
                    borderRadius: 'var(--radius-btn)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  Bắt đầu Khám phá <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>

            {/* Quick stats mini-banner inside Hero */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-5 grid grid-cols-3 gap-4 text-center"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderTop: '3px solid var(--accent-color)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div>
                <div className="text-2xl font-serif-heading font-black" style={{ color: 'var(--accent-color)' }}>2013</div>
                <div className="text-[9px] font-sans font-bold uppercase tracking-wide mt-1" style={{ color: 'var(--text-secondary)' }}>Hiến Pháp</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                <div className="text-2xl font-serif-heading font-black" style={{ color: 'var(--text-primary)' }}>06</div>
                <div className="text-[9px] font-sans font-bold uppercase tracking-wide mt-1" style={{ color: 'var(--text-secondary)' }}>Đặc trưng cốt lõi</div>
              </div>
              <div>
                <div className="text-2xl font-serif-heading font-black" style={{ color: 'var(--accent-gold)' }}>2045</div>
                <div className="text-[9px] font-sans font-bold uppercase tracking-wide mt-1" style={{ color: 'var(--text-secondary)' }}>Tầm nhìn chiến lược</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Dashboard Navigation Panel */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* Card 1: 3D Museum */}
              <Link href="/noi-dung-chinh" className="group">
                <div
                  className="p-6 flex flex-col justify-between h-full min-h-[170px] cursor-pointer transition-shadow duration-200"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderTop: '3px solid var(--accent-color)',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-lg" style={{ background: 'color-mix(in srgb, var(--accent-color) 10%, transparent)', color: 'var(--accent-color)' }}>
                      <Compass size={20} />
                    </div>
                    <span className="text-[8px] font-sans font-extrabold uppercase tracking-wide transition-colors" style={{ color: 'var(--text-secondary)' }}>3D INTERACTIVE</span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-serif-heading font-bold transition-colors" style={{ color: 'var(--text-primary)' }}>Bảo tàng ảo WebGL 3D</h3>
                    <p className="text-[11px] mt-1 leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>Trực quan hóa tư liệu lịch sử và các hiện vật số hóa 3D trực tuyến.</p>
                  </div>
                </div>
              </Link>

              {/* Card 2: Wikipedia Cases */}
              <Link href="/on-tap-quiz" className="group">
                <div
                  className="p-6 flex flex-col justify-between h-full min-h-[170px] cursor-pointer transition-shadow duration-200"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderTop: '3px solid var(--accent-gold)',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-lg" style={{ background: 'color-mix(in srgb, var(--accent-gold) 10%, transparent)', color: 'var(--accent-gold)' }}>
                      <BookOpen size={20} />
                    </div>
                    <span className="text-[8px] font-sans font-extrabold uppercase tracking-wide transition-colors" style={{ color: 'var(--text-secondary)' }}>WIKI DOSSIER</span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-serif-heading font-bold transition-colors" style={{ color: 'var(--text-primary)' }}>Hồ sơ Đại án Lịch sử</h3>
                    <p className="text-[11px] mt-1 leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>Bách khoa toàn thư tổng hợp, phân tích hồ sơ sai phạm kinh tế điển hình.</p>
                  </div>
                </div>
              </Link>

              {/* Card 3: Quiz Arena */}
              <Link href="/quiz" className="group">
                <div
                  className="p-6 flex flex-col justify-between h-full min-h-[170px] cursor-pointer transition-shadow duration-200"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderTop: '3px solid var(--accent-color)',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-lg" style={{ background: 'color-mix(in srgb, #10b981 10%, transparent)', color: '#10b981' }}>
                      <Award size={20} />
                    </div>
                    <span className="text-[8px] font-sans font-extrabold uppercase tracking-wide transition-colors" style={{ color: 'var(--text-secondary)' }}>QUIZ ARENA</span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-serif-heading font-bold transition-colors" style={{ color: 'var(--text-primary)' }}>Đấu trường trắc nghiệm</h3>
                    <p className="text-[11px] mt-1 leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>Đánh giá và nâng cao kiến thức pháp cương phòng chống tham nhũng.</p>
                  </div>
                </div>
              </Link>

              {/* Card 4: Team & AI */}
              <Link href="/thanh-vien" className="group">
                <div
                  className="p-6 flex flex-col justify-between h-full min-h-[170px] cursor-pointer transition-shadow duration-200"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderTop: '3px solid var(--accent-gold)',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-lg" style={{ background: 'color-mix(in srgb, #8b5cf6 10%, transparent)', color: '#8b5cf6' }}>
                      <Users size={20} />
                    </div>
                    <span className="text-[8px] font-sans font-extrabold uppercase tracking-wide transition-colors" style={{ color: 'var(--text-secondary)' }}>TEAM & ASSISTANT</span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-serif-heading font-bold transition-colors" style={{ color: 'var(--text-primary)' }}>Ban Biên Tập & Trợ Lý</h3>
                    <p className="text-[11px] mt-1 leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>Danh sách thành viên Ban sản xuất chuyên đề và Trợ lý AI liêm chính.</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
