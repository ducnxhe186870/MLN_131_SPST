'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Scale, Landmark, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/app/components/ThemeProvider';

interface TabItem {
  id: string;
  tabTitle: string;
  title: string;
  icon: any;
  content: string;
  bullets: string[];
  image: string;
}

export default function ConceptShowcase() {
  const { isDarkMode, showImage } = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const tabs: TabItem[] = [
    {
      id: 'concept',
      tabTitle: 'Khái niệm cốt lõi',
      title: 'Nhà nước của Nhân dân, do Nhân dân, vì Nhân dân',
      icon: Landmark,
      content: 'Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam là Nhà nước của Nhân dân, do Nhân dân, vì Nhân dân, do Đảng Cộng sản Việt Nam lãnh đạo. Nhà nước quản lý xã hội bằng Hiến pháp và pháp luật, lấy lợi ích hợp pháp, chính đáng của người dân và doanh nghiệp làm trọng tâm của mọi chính sách phát triển.',
      bullets: [
        'Quyền lực nhà nước thuộc về Nhân dân làm chủ.',
        'Lấy hạnh phúc của nhân dân làm mục tiêu cao nhất.',
        'Vận hành dưới sự lãnh đạo duy nhất của Đảng Cộng sản.',
        'Mọi chính sách đều xuất phát từ thực tế đời sống nhân dân.'
      ],
      image: '/images/concept/hq720.jpg'
    },
    {
      id: 'democracy',
      tabTitle: 'Tính Nhân Dân',
      title: 'Dân chủ là bản chất biện chứng của pháp quyền',
      icon: Users,
      content: 'Pháp luật là biểu hiện của ý chí và nguyện vọng của đại đa số nhân dân lao động. Dân chủ vừa là bản chất, vừa là điều kiện tiền đề quyết định của pháp quyền; nếu không có dân chủ thực sự, pháp quyền sẽ trở thành cơ chế "pháp trị" quan liêu, khô cứng.',
      bullets: [
        'Pháp luật bảo vệ quyền làm chủ thực chất của giai cấp nhân dân.',
        'Người dân tham gia xây dựng, góp ý và phản biện chính sách.',
        'Mọi công dân bình đẳng trước cơ hội và nghĩa vụ pháp lý.',
        'Giám sát nhà nước thông qua phương châm: Dân biết, dân bàn, dân làm, dân kiểm tra.'
      ],
      image: '/images/concept/hq720.jpg'
    },
    {
      id: 'supremacy',
      tabTitle: 'Thượng tôn Pháp luật',
      title: 'Đặt Hiến pháp và Pháp luật ở vị trí tối thượng',
      icon: Scale,
      content: 'Nhà nước đặt mình dưới pháp luật, hoạt động trong khuôn khổ pháp luật quy định. Pháp luật Việt Nam mang tính nhân đạo sâu sắc, bảo vệ quyền con người, quyền công dân, đồng thời hướng tới mục tiêu "dân giàu, nước mạnh, dân chủ, công bằng, văn minh".',
      bullets: [
        'Hiến pháp có giá trị pháp lý cao nhất toàn lãnh thổ.',
        'Cán bộ, cơ quan nhà nước phải gương mẫu tuân thủ pháp luật.',
        'Bảo vệ quyền con người, quyền công dân là nghĩa vụ của nhà nước.',
        'Nghiêm trị lạm dụng quyền lực, tham nhũng và cửa quyền.'
      ],
      image: '/images/concept/hq720.jpg'
    },
    {
      id: 'leadership',
      tabTitle: 'Đảng lãnh đạo',
      title: 'Sự lãnh đạo của Đảng Cộng sản Việt Nam',
      icon: Shield,
      content: 'Sự lãnh đạo của Đảng là đặc trưng chính trị riêng biệt bảo đảm Nhà nước pháp quyền đi đúng quỹ đạo xã hội chủ nghĩa. Đảng dẫn dắt xã hội bằng các chủ trương, đường lối lý luận và bằng sự nêu gương đạo đức của cán bộ, đảng viên, tuyệt đối không đứng ngoài hay đứng trên pháp luật.',
      bullets: [
        'Đảng hoạt động trong khuôn khổ Hiến pháp và pháp luật quy định.',
        'Lãnh đạo bằng thuyết phục, định hướng và nêu gương đạo đức.',
        'Bảo đảm quyền lực nhà nước không bị lũng đoạn bởi nhóm lợi ích.',
        'Giữ vững mục tiêu độc lập dân tộc gắn liền với chủ nghĩa xã hội.'
      ],
      image: '/images/concept/hq720.jpg'
    }
  ];

  const ActiveIcon = tabs[activeTab].icon;

  return (
    <div className="w-full relative py-4 transition-colors duration-500">
      <div className="text-center mb-8">
        <span
          className="text-[9px] font-sans font-extrabold uppercase tracking-wide px-3 py-1 rounded-md"
          style={{
            color: 'var(--accent-color)',
            backgroundColor: 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-color) 20%, transparent)'
          }}
        >
          CHƯƠNG I: TỔNG QUAN LÝ LUẬN
        </span>
        <h2
          className="text-2xl md:text-3xl font-serif-heading font-black mt-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Khái niệm &amp; Bản chất Pháp quyền
        </h2>
        <p
          className="font-serif-body text-xs md:text-sm max-w-xl mx-auto italic mt-1.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          Nền tảng lý luận cấu thành nên mô hình Nhà nước pháp quyền XHCN Việt Nam
        </p>
      </div>

      {/* Tabbed Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-6xl mx-auto">
        
        {/* Vertical Tabs Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-2.5">
          {tabs.map((tab, idx) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all cursor-pointer ${
                  isActive ? 'translate-x-1 font-bold' : ''
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: 'var(--accent-color)',
                        color: '#ffffff',
                        border: '1px solid var(--accent-color)',
                        boxShadow: 'var(--shadow-card)'
                      }
                    : {
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)'
                      }
                }
              >
                <div
                  className="p-1.5 rounded-lg"
                  style={
                    isActive
                      ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }
                      : { backgroundColor: 'color-mix(in srgb, var(--accent-color) 8%, transparent)', color: 'var(--accent-color)' }
                  }
                >
                  <TabIcon size={16} />
                </div>
                <span className="font-sans font-extrabold text-[10px] uppercase tracking-wide">{tab.tabTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Showcase Panel */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 min-h-[350px] rounded-xl"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderTop: '3px solid var(--accent-color)',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              {/* Text and bullets content */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2.5" style={{ color: 'var(--accent-color)' }}>
                    <div
                      className="p-1.5 rounded-lg"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color) 10%, transparent)' }}
                    >
                      <ActiveIcon size={14} />
                    </div>
                    <span className="text-[9px] font-sans font-extrabold uppercase tracking-wide">{tabs[activeTab].tabTitle}</span>
                  </div>
                  <h3
                    className="text-base md:text-lg font-serif-heading font-black leading-tight mb-3"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {tabs[activeTab].title}
                  </h3>
                  <p
                    className="font-serif-body text-[11px] leading-relaxed text-justify"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {tabs[activeTab].content}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  {tabs[activeTab].bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span
                        className="font-serif-body text-xs"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {bullet}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphic/Image frame */}
              <div 
                onClick={() => showImage(tabs[activeTab].image, tabs[activeTab].title)}
                className="md:col-span-5 relative overflow-hidden w-full rounded-xl cursor-zoom-in flex items-center justify-center group"
                style={{
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-color)'
                }}
              >
                <img 
                  src={tabs[activeTab].image} 
                  alt={tabs[activeTab].title} 
                  className="w-full h-auto block opacity-90 group-hover:scale-[1.02] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors pointer-events-none" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
