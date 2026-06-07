'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckSquare, Settings, Scale, ShieldCheck, Cpu } from 'lucide-react';
import { useTheme } from '@/app/components/ThemeProvider';

export default function SolutionsAccordion() {
  const { isDarkMode } = useTheme();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  const solutionSections = [
    {
      title: 'Kiểm soát quyền lực và phòng chống tham nhũng',
      icon: ShieldCheck,
      items: [
        'Cơ chế 3 tầng nấc: Kiểm soát bên trong (giữa các cơ quan quyền lực); Kiểm soát bên ngoài (giám sát từ Mặt trận Tổ quốc và xã hội); Kiểm soát của Nhân dân (quyền khiếu nại, tố cáo, bầu cử).',
        'Ngăn chặn "tham nhũng chính sách": Siết chặt kỷ luật soạn thảo văn bản, thực hiện đánh giá tác động chính sách (RIA) minh bạch và công khai quy trình lập pháp để nhân dân giám sát trực tuyến.'
      ]
    },
    {
      title: 'Cải cách hành chính và Chuyển đổi số',
      icon: Cpu,
      items: [
        'Chính phủ số: Minh bạch hóa 100% hồ sơ thủ tục hành chính trên hệ thống thông tin điện tử liên thông.',
        'Số hóa dữ liệu: Nghiêm cấm yêu cầu người dân cung cấp lại thông tin đã được số hóa trong các kho dữ liệu nhà nước.',
        'Lấy người dùng làm trung tâm: Đơn giản hóa quy trình, thực hiện cơ chế "một cửa liên thông" để giảm thời gian và chi phí cho xã hội.'
      ]
    },
    {
      title: 'Cải cách tư pháp quyết liệt',
      icon: Scale,
      items: [
        'Độc lập xét xử: Thẩm phán không lệ thuộc vào sự chỉ đạo hành chính của địa phương.',
        'Thúc đẩy tranh tụng: Phán quyết của tòa án phải dựa trên kết quả tranh tụng công khai và bình đẳng tại phiên tòa.',
        'Hiện đại hóa tư pháp: Xây dựng "Tòa án điện tử", công khai bản án trên cổng thông tin để nhân dân giám sát.'
      ]
    },
    {
      title: 'Phát huy vai trò của Mặt trận Tổ quốc',
      icon: Settings,
      items: [
        'Phản biện xã hội: Tổ chức phản biện đối với các dự án luật và đề án kinh tế lớn.',
        'Giám sát cán bộ: Tập trung giám sát đạo đức, lối sống của cán bộ, đặc biệt là người đứng đầu.'
      ]
    }
  ];

  const handleToggle = (idx: number) => {
    setExpandedIdx(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="w-full relative py-4 transition-colors duration-500">
      
      {/* Title area */}
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-serif-heading font-black"
          style={{ color: 'var(--text-primary)' }}
        >
          Hệ Giải Pháp Phát Triển &amp; Hoàn Thiện
        </h2>
        <p
          className="font-serif-body text-sm max-w-xl mx-auto italic mt-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          Các giải pháp trọng tâm thúc đẩy phát triển xã hội thượng tôn pháp luật hiện nay
        </p>
      </div>

      {/* Accordion Steps Container */}
      <div className="max-w-4xl mx-auto space-y-3">
        {solutionSections.map((section, index) => {
          const isExpanded = expandedIdx === index;
          const SectionIcon = section.icon;
          return (
            <div
              key={section.title}
              className="overflow-hidden transition-all"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
                borderTop: '3px solid var(--accent-color)',
              }}
            >
              {/* Header click bar */}
              <button
                onClick={() => handleToggle(index)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer select-none"
              >
                <div className="flex items-center gap-4">
                  <span
                    className="h-6 w-6 rounded-lg flex items-center justify-center font-sans font-extrabold text-[10px]"
                    style={{ background: 'var(--accent-color)', color: '#fff' }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <SectionIcon size={16} style={{ color: 'var(--accent-gold)' }} />
                  <h3
                    className="text-base font-serif-heading font-black leading-snug"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {section.title}
                  </h3>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-355 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  style={{ color: 'var(--text-secondary)' }}
                />
              </button>

              {/* Content collapsible */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <div
                      className="px-5 pb-5 pt-1.5"
                      style={{
                        borderTop: '1px solid var(--border-color)',
                        background: 'var(--bg-paper)',
                      }}
                    >
                      <ul className="space-y-3">
                        {section.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-2.5">
                            <CheckSquare size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span
                              className="font-serif-body text-xs leading-relaxed text-justify"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

    </div>
  );
}
