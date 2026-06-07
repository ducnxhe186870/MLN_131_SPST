'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Lock, Users, Gavel, EyeOff, Sparkles, HelpCircle, CheckCircle } from 'lucide-react';

export default function CausesSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  const causes = [
    {
      title: 'Thiếu tính minh bạch và công khai',
      desc: 'Quy trình lập pháp, đấu thầu các dự án đầu tư công, và công tác bổ nhiệm nhân sự chưa được số hóa hoặc công khai thực chất. Việc thiếu cơ chế công khai tạo kẽ hở lớn cho các nhóm lợi ích thao túng quy hoạch và ngân sách.',
      icon: EyeOff,
      badge: 'Khách quan',
      factors: [
        'Cơ sở dữ liệu công vụ chưa đồng bộ và mở.',
        'Sự chậm trễ trong chuyển đổi số hành chính công.',
        'Thiếu luật tiếp cận thông tin rõ ràng ở cơ sở.'
      ]
    },
    {
      title: 'Sự suy thoái đạo đức lối sống',
      desc: 'Một bộ phận nhỏ cán bộ, đảng viên phai nhạt lý tưởng, chạy theo lối sống thực dụng, ích kỷ, đặt quyền lợi cá nhân và gia đình lên trên lợi ích chung của xã hội, dẫn đến tha hóa quyền lực công.',
      icon: Users,
      badge: 'Chủ quan',
      factors: [
        'Ý thức rèn luyện đạo đức công vụ bị buông lỏng.',
        'Lối sống hưởng thụ, chạy theo lợi ích vật chất.',
        'Nhận thức sai lệch về vai trò người đầy tớ của nhân dân.'
      ]
    },
    {
      title: 'Kiểm soát quyền lực chưa chặt chẽ',
      desc: 'Cơ chế tự kiểm soát nội bộ, kiểm soát chéo giữa các cơ quan quyền lực và hoạt động giám sát xã hội của Mặt trận Tổ quốc cùng người dân còn gặp nhiều rào cản hành chính, chưa phát huy hết vai trò thực tế.',
      icon: Lock,
      badge: 'Khách quan',
      factors: [
        'Thiếu độc lập thực chất trong kiểm tra giám sát nội bộ.',
        'Vai trò phản biện của tổ chức xã hội chưa được pháp chế hóa đầy đủ.',
        'Quy trình giải trình đối với người đứng đầu chưa nghiêm ngặt.'
      ]
    },
    {
      title: 'Chế tài pháp lý chưa đủ sức răn đe',
      desc: 'Việc thực thi pháp luật đôi lúc còn nể nang, chưa triệt để. Hiệu suất thu hồi tài sản tham nhũng, tẩu tán tài sản bất hợp pháp ra nước ngoài hoặc chuyển hóa thành tài sản gia đình chưa đạt kỳ vọng tối ưu.',
      icon: Gavel,
      badge: 'Chủ quan',
      factors: [
        'Quy trình định giá, phong tỏa tài sản nghi phạm còn chậm.',
        'Các chế tài hành chính hoặc xử lý nội bộ chưa đủ sức nặng.',
        'Lỗ hổng trong hợp tác tư pháp quốc tế thu hồi tài sản.'
      ]
    }
  ];

  const activeCause = causes[activeIdx];
  const ActiveIcon = activeCause.icon;

  return (
    <div className="w-full py-4 transition-colors duration-500">
      {/* Slide Title */}
      <div className="text-center mb-8">
        <span
          className="text-[9px] font-sans font-extrabold uppercase tracking-wide px-3 py-1 rounded-lg"
          style={{
            color: 'var(--accent-color)',
            backgroundColor: 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-color) 20%, transparent)',
          }}
        >
          CHƯƠNG II: NGUYÊN NHÂN PHÁT SINH
        </span>
        <h2
          className="text-2xl md:text-3xl font-serif-heading font-black mt-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Nguyên Nhân Dẫn Đến Tham Nhũng
        </h2>
        <p
          className="font-serif-body text-xs md:text-sm max-w-xl mx-auto italic mt-1.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          Phân tích đa chiều các kẽ hở cơ chế khách quan và sự suy thoái chủ quan của chủ thể
        </p>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
        
        {/* Left Side: Interactive SVG Mindmap (Desktop only, fallback on mobile) */}
        <div
          className="lg:col-span-6 flex flex-col justify-center items-center p-6 min-h-[400px] rounded-xl relative"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderTop: '3px solid var(--accent-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="absolute top-4 left-4 flex items-center gap-1 text-[9px] font-sans font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            <Sparkles size={12} style={{ color: 'var(--accent-gold)' }} /> Sơ đồ liên kết tương tác
          </div>

          {/* Desktop SVG Map */}
          <div className="hidden sm:block w-full max-w-[360px] aspect-square relative z-10">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              {/* Pulsing connections to selected node */}
              <defs>
                <linearGradient id="selectedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-color)" />
                  <stop offset="100%" stopColor="var(--accent-color)" />
                </linearGradient>
              </defs>

              {/* Connecting Lines */}
              {[
                { x: 90, y: 90, idx: 0 },
                { x: 310, y: 90, idx: 1 },
                { x: 90, y: 310, idx: 2 },
                { x: 310, y: 310, idx: 3 }
              ].map((line, i) => {
                const isActive = activeIdx === line.idx;
                return (
                  <g key={i}>
                    <line 
                      x1="200" 
                      y1="200" 
                      x2={line.x} 
                      y2={line.y} 
                      stroke={isActive ? "var(--accent-color)" : "var(--border-color)"} 
                      strokeWidth={isActive ? "3" : "1.5"} 
                      strokeDasharray={isActive ? "none" : "4,4"}
                      className="transition-all duration-300"
                    />
                    {isActive && (
                      <circle r="4" fill="var(--accent-color)">
                        <animateMotion 
                          dur="2.5s" 
                          repeatCount="indefinite" 
                          path={`M 200,200 L ${line.x},${line.y}`}
                        />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Central Core Node */}
              <g transform="translate(200, 200)" className="cursor-default">
                <circle r="36" fill="var(--text-primary)" stroke="var(--accent-color)" strokeOpacity="0.35" strokeWidth="2" />
                <circle r="30" fill="color-mix(in srgb, var(--accent-color) 10%, transparent)" stroke="var(--accent-color)" strokeWidth="1.5" />
                <foreignObject x="-18" y="-18" width="36" height="36" style={{ color: 'var(--accent-color)' }}>
                  <div className="w-full h-full flex items-center justify-center"><AlertTriangle size={18} className="animate-pulse" /></div>
                </foreignObject>
              </g>

              {/* Outer Cause Nodes */}
              {[
                { x: 90, y: 90, idx: 0, label: 'Minh bạch' },
                { x: 310, y: 90, idx: 1, label: 'Đạo đức' },
                { x: 90, y: 310, idx: 2, label: 'Kiểm soát' },
                { x: 310, y: 310, idx: 3, label: 'Chế tài' }
              ].map((node) => {
                const isActive = activeIdx === node.idx;
                return (
                  <g 
                    key={node.idx} 
                    transform={`translate(${node.x}, ${node.y})`} 
                    className="cursor-pointer group"
                    onClick={() => setActiveIdx(node.idx)}
                  >
                    {isActive && (
                      <circle r="36" fill="transparent" stroke="var(--accent-color)" strokeOpacity="0.4" className="animate-ping" strokeWidth="1" />
                    )}
                    <circle 
                      r="28" 
                      fill={isActive ? 'var(--text-primary)' : 'var(--bg-card)'}
                      stroke={isActive ? 'var(--accent-color)' : 'var(--border-color)'}
                      strokeWidth="2" 
                      className="transition-all duration-300"
                    />
                    <foreignObject x="-14" y="-14" width="28" height="28" style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                      <div className="w-full h-full flex items-center justify-center">
                        {node.idx === 0 && <EyeOff size={16} />}
                        {node.idx === 1 && <Users size={16} />}
                        {node.idx === 2 && <Lock size={16} />}
                        {node.idx === 3 && <Gavel size={16} />}
                      </div>
                    </foreignObject>
                    <text 
                      y="42" 
                      textAnchor="middle" 
                      className="font-sans font-extrabold text-[8px] uppercase tracking-wide"
                      fill={isActive ? 'var(--accent-color)' : 'var(--text-secondary)'}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Mobile Tab Fallback */}
          <div className="sm:hidden w-full grid grid-cols-2 gap-2 mt-6">
            {causes.map((cause, i) => {
              const TabIcon = cause.icon;
              const isActive = activeIdx === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className="flex items-center gap-2 p-2.5 rounded-lg text-left cursor-pointer transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--accent-color)' : 'var(--bg-card)',
                    border: isActive ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  <TabIcon size={14} />
                  <span className="font-sans font-bold text-[9px] uppercase tracking-wide truncate">{cause.title.split(' ').slice(0, 2).join(' ')}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            <span className="text-[10px] font-serif-body italic" style={{ color: 'var(--text-secondary)' }}>
              — Click các nút nút tròn liên kết ở trên để đổi phân tích —
            </span>
          </div>
        </div>

        {/* Right Side: Detailed Details Card */}
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
                {/* Header detail */}
                <div
                  className="flex items-center justify-between mb-5 pb-3"
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                >
                  <div className="flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color) 10%, transparent)' }}
                    >
                      <ActiveIcon size={18} />
                    </div>
                    <span className="text-[10px] font-sans font-extrabold uppercase tracking-wide">Chi tiết phân tích</span>
                  </div>
                  <span className={`text-[9px] font-sans font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-lg ${
                    activeCause.badge === 'Chủ quan' 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  }`}>
                    Nguyên nhân {activeCause.badge}
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

                {/* Sub-factors */}
                <div className="space-y-2.5">
                  <h4
                    className="text-[9px] font-sans font-extrabold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    YẾU TỐ TÁC ĐỘNG CỤ THỂ
                  </h4>
                  {activeCause.factors.map((fact, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-start gap-2.5 p-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--bg-color)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] font-serif-body" style={{ color: 'var(--text-primary)' }}>{fact}</span>
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
