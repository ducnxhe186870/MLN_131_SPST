'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Shield, Gavel, Users, ShieldAlert, Award } from 'lucide-react';
import { useTheme } from '@/app/components/ThemeProvider';

export default function CharacteristicsGrid() {
  const { isDarkMode } = useTheme();
  const [activeSegment, setActiveSegment] = useState<'six' | 'eight'>('six');

  const sixFeatures = [
    {
      title: 'Nhân dân làm chủ',
      desc: 'Xây dựng nhà nước do nhân dân lao động làm chủ, đó là Nhà nước của nhân dân, do nhân dân, vì nhân dân.',
      icon: Users,
    },
    {
      title: 'Hiến pháp tối thượng',
      desc: 'Nhà nước được tổ chức và hoạt động dựa trên cơ sở của Hiến pháp và pháp luật. Pháp luật đặt ở vị trí tối thượng.',
      icon: Scale,
    },
    {
      title: 'Phân công quyền lực',
      desc: 'Quyền lực nhà nước là thống nhất, có sự phân công rõ ràng, phối hợp nhịp nhàng và kiểm soát chặt chẽ giữa các cơ quan lập pháp, hành pháp và tư pháp.',
      icon: Gavel,
    },
    {
      title: 'Đảng lãnh đạo duy nhất',
      desc: 'Nhà nước pháp quyền xã hội chủ nghĩa ở Việt Nam phải do Đảng Cộng sản Việt Nam lãnh đạo, phù hợp với Điều 4 Hiến pháp.',
      icon: Shield,
    },
    {
      title: 'Tôn trọng quyền con người',
      desc: 'Tôn trọng và coi con người là chủ thể, là trung tâm của sự phát triển; quyền dân chủ của nhân dân được thực thi rộng rãi.',
      icon: Award,
    },
    {
      title: 'Tập trung dân chủ',
      desc: 'Tổ chức và hoạt động của bộ máy nhà nước theo nguyên tắc tập trung dân chủ, phân cấp rõ ràng, phối hợp hiệu quả.',
      icon: ShieldAlert,
    }
  ];

  const eightFeatures = [
    {
      title: 'Đảng Cộng sản lãnh đạo',
      desc: 'Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam do Ðảng Cộng sản Việt Nam lãnh đạo duy nhất và tuyệt đối.',
      icon: Shield,
    },
    {
      title: 'Của Dân, Do Dân, Vì Dân',
      desc: 'Nhà nước của Nhân dân, do Nhân dân, vì Nhân dân dưới sự làm chủ thực chất của xã hội.',
      icon: Users,
    },
    {
      title: 'Bảo vệ quyền công dân',
      desc: 'Quyền con người, quyền công dân được công nhận, tôn trọng, bảo đảm, bảo vệ theo Hiến pháp và pháp luật.',
      icon: Award,
    },
    {
      title: 'Quản lý bằng luật pháp',
      desc: 'Nhà nước được tổ chức và hoạt động theo Hiến pháp và pháp luật, quản lý xã hội bằng Hiến pháp và pháp luật.',
      icon: Scale,
    },
    {
      title: 'Kiểm soát quyền lực',
      desc: 'Quyền lực thống nhất, phân công rành mạch, phối hợp chặt chẽ và kiểm soát hiệu quả giữa các cơ quan lập pháp, hành pháp, tư pháp.',
      icon: Gavel,
    },
    {
      title: 'Hệ thống luật dân chủ',
      desc: 'Hệ thống pháp luật dân chủ, công bằng, nhân đạo, đồng bộ, thống nhất, công khai, minh bạch và ổn định.',
      icon: ShieldAlert,
    },
    {
      title: 'Tòa án xét xử độc lập',
      desc: 'Độc lập của tòa án theo thẩm quyền xét xử, thẩm phán, hội thẩm xét xử độc lập và chỉ tuân theo pháp luật.',
      icon: Scale,
    },
    {
      title: 'Hợp tác quốc tế nghiêm túc',
      desc: 'Tôn trọng và bảo đảm thực hiện các điều ước quốc tế mà Việt Nam là thành viên, bảo đảm lợi ích quốc gia - dân tộc.',
      icon: Shield,
    }
  ];

  const activeFeatures = activeSegment === 'six' ? sixFeatures : eightFeatures;

  return (
    <div className="w-full relative py-4 transition-colors duration-500">
      
      {/* Title area */}
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-serif-heading font-black"
          style={{ color: 'var(--text-primary)' }}
        >
          Đặc trưng Hệ thống Pháp quyền
        </h2>
        <p
          className="font-serif-body text-sm max-w-xl mx-auto italic mt-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          Các trụ cột lý luận nguyên thủy và các cập nhật mới nhất theo tinh thần Nghị quyết 27-NQ/TW
        </p>
      </div>

      {/* Segment selector toggle */}
      <div className="flex justify-center mb-8">
        <div
          className="inline-flex p-1 rounded-xl gap-1"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <button
            onClick={() => setActiveSegment('six')}
            className="px-5 py-2 rounded-lg font-sans font-bold text-[10px] uppercase tracking-wide transition-all cursor-pointer"
            style={{
              background: activeSegment === 'six' ? 'var(--accent-color)' : 'transparent',
              color: activeSegment === 'six' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: activeSegment === 'six' ? 'var(--shadow-card)' : 'none',
            }}
          >
            6 Đặc trưng lý luận
          </button>
          <button
            onClick={() => setActiveSegment('eight')}
            className="px-5 py-2 rounded-lg font-sans font-bold text-[10px] uppercase tracking-wide transition-all cursor-pointer"
            style={{
              background: activeSegment === 'eight' ? 'var(--accent-color)' : 'transparent',
              color: activeSegment === 'eight' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: activeSegment === 'eight' ? 'var(--shadow-card)' : 'none',
            }}
          >
            8 Đặc trưng Nghị quyết 27
          </button>
        </div>
      </div>

      {/* Grid display with AnimatePresence */}
      <div className="max-w-6xl mx-auto">
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {activeFeatures.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.title}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="p-5 flex flex-col justify-between min-h-[170px] rounded-xl transition-shadow duration-200"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderTop: '3px solid var(--accent-color)',
                    boxShadow: 'var(--shadow-card)',
                    borderRadius: 'var(--radius-card)',
                  }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className="h-6 w-6 rounded-lg flex items-center justify-center font-sans font-extrabold text-[10px]"
                        style={{
                          background: 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
                          color: 'var(--accent-color)',
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div style={{ color: 'var(--accent-gold)', opacity: 0.8 }}>
                        <IconComponent size={16} />
                      </div>
                    </div>
                    <h3
                      className="text-base font-serif-heading font-black mb-2 leading-snug"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="font-serif-body text-[11px] leading-relaxed text-justify"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
  );
}
