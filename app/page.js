'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './components/ThemeProvider';
import HeroDashboard from '@/components/HeroDashboard';
import TimelineSlider from '@/components/TimelineSlider';
import ConceptShowcase from '@/components/ConceptShowcase';
import CharacteristicsGrid from '@/components/CharacteristicsGrid';
import SolutionsAccordion from '@/components/SolutionsAccordion';
import VisionRoadmap from '@/components/VisionRoadmap';
import AIChatbot from '@/components/AIChatbot';
import CausesSection from '@/components/CausesSection';
import ConsequencesSection from '@/components/ConsequencesSection';
import CitizenStudentRole from '@/components/CitizenStudentRole';
import ConclusionReferences from '@/components/ConclusionReferences';
import HistoricalDossier from '@/components/HistoricalDossier';

import { 
  BookOpen, 
  AlertTriangle,
  TrendingDown,
  Layers,
  HelpCircle,
  Users,
  Award,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Grid,
  FileText,
  Monitor,
  CheckCircle
} from 'lucide-react';

export default function Home() {
  const { isDarkMode } = useTheme();
  const [viewMode, setViewMode] = useState('presentation');
  const [activeTab, setActiveTab] = useState('intro');
  const [autoplay, setAutoplay] = useState(false);
  const [showIndexOverlay, setShowIndexOverlay] = useState(false);

  const menuItems = [
    { 
      id: 'intro', 
      label: 'I. Tổng quan & Lý luận', 
      icon: BookOpen, 
      component: (
        <div className="space-y-10">
          <HeroDashboard onSelectTab={(tab) => {
            if (tab === 'timeline') {
              setActiveTab('cases');
            } else {
              setActiveTab(tab);
            }
          }} />
          <hr style={{ borderColor: 'var(--border-color)' }} />
          <ConceptShowcase />
          <hr style={{ borderColor: 'var(--border-color)' }} />
          <CharacteristicsGrid />
        </div>
      )
    },
    { 
      id: 'causes', 
      label: 'II. Nguyên nhân phát sinh', 
      icon: AlertTriangle, 
      component: <CausesSection /> 
    },
    { 
      id: 'consequences', 
      label: 'III. Hệ quả & Tác hại', 
      icon: TrendingDown, 
      component: <ConsequencesSection /> 
    },
    { 
      id: 'cases', 
      label: 'IV. Thực tiễn & Số liệu', 
      icon: Layers, 
      component: (
        <div className="space-y-10">
          <TimelineSlider />
          <hr style={{ borderColor: 'var(--border-color)' }} />
          <HistoricalDossier />
        </div>
      )
    },
    { 
      id: 'solutions', 
      label: 'V. Chính sách & Giải pháp', 
      icon: HelpCircle, 
      component: (
        <div className="space-y-10">
          <SolutionsAccordion />
          <hr style={{ borderColor: 'var(--border-color)' }} />
          <VisionRoadmap />
        </div>
      )
    },
    { 
      id: 'citizens', 
      label: 'VI. Vai trò Công dân & SV', 
      icon: Users, 
      component: <CitizenStudentRole /> 
    },
    { 
      id: 'conclusion', 
      label: 'VII. Kết luận & Tài liệu', 
      icon: Award, 
      component: <ConclusionReferences /> 
    }
  ];

  const currentIdx = menuItems.findIndex(item => item.id === activeTab);
  const currentTabItem = menuItems[currentIdx] || menuItems[0];

  const handleNextTab = () => {
    if (currentIdx + 1 < menuItems.length) {
      setActiveTab(menuItems[currentIdx + 1].id);
    } else {
      setAutoplay(false);
    }
  };

  const handlePrevTab = () => {
    if (currentIdx - 1 >= 0) {
      setActiveTab(menuItems[currentIdx - 1].id);
    }
  };

  // Autoplay Timer (9 seconds per slide)
  useEffect(() => {
    let timer;
    if (autoplay) {
      timer = setInterval(() => {
        handleNextTab();
      }, 9000);
    }
    return () => clearInterval(timer);
  }, [autoplay, currentIdx]);

  return (
    <div className="min-h-screen transition-colors duration-300 relative pb-12" style={{ backgroundColor: 'var(--bg-color)' }}>

      <div className="container-custom pt-[80px] relative z-10 px-4 sm:px-6">
        
        {/* ── CONTROL BAR ── */}
        <div 
          className="w-full flex flex-col md:flex-row gap-3 items-center justify-between mb-6 p-3 relative overflow-hidden"
          style={{ 
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {/* Progress bar */}
          {viewMode === 'presentation' && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] overflow-hidden" style={{ background: 'var(--border-color)' }}>
              <motion.div 
                className="h-full"
                style={{ background: 'var(--accent-color)' }}
                initial={{ width: '0%' }}
                animate={{ width: `${((currentIdx + 1) / menuItems.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Left: View mode & chapter info */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-glow)', color: 'var(--accent-color)' }}>
                <BookOpen size={14} />
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  {viewMode === 'presentation' ? 'Trình chiếu' : 'Đọc toàn văn'}
                </div>
                <div className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>
                  {viewMode === 'presentation' ? `Chương ${currentIdx + 1} / ${menuItems.length}` : 'Tất cả chương'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setViewMode('presentation')}
                className="p-1.5 rounded-md cursor-pointer transition-all"
                style={{ 
                  background: viewMode === 'presentation' ? 'var(--accent-color)' : 'transparent',
                  color: viewMode === 'presentation' ? 'white' : 'var(--text-secondary)'
                }}
                title="Trình chiếu"
              >
                <Monitor size={13} />
              </button>
              <button
                onClick={() => setViewMode('scroll')}
                className="p-1.5 rounded-md cursor-pointer transition-all"
                style={{ 
                  background: viewMode === 'scroll' ? 'var(--accent-color)' : 'transparent',
                  color: viewMode === 'scroll' ? 'white' : 'var(--text-secondary)'
                }}
                title="Đọc toàn văn"
              >
                <FileText size={13} />
              </button>
            </div>
          </div>

          {/* Center: Slide nav (presentation mode only) */}
          {viewMode === 'presentation' && (
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-lg w-full md:w-auto justify-between md:justify-center"
              style={{ border: '1px solid var(--border-color)' }}
            >
              <button
                onClick={handlePrevTab}
                disabled={currentIdx === 0}
                className="p-1 rounded cursor-pointer disabled:opacity-20"
                style={{ color: 'var(--text-secondary)' }}
                title="Chương trước"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="text-center min-w-[160px]">
                <span className="font-extrabold text-[10px] uppercase tracking-wider block" style={{ color: 'var(--accent-color)' }}>
                  {currentTabItem.label.split('.')[0]}
                </span>
                <span className="font-semibold text-[11px] block truncate max-w-[180px] mx-auto" style={{ color: 'var(--text-primary)' }}>
                  {currentTabItem.label.split('.').slice(1).join('.').trim()}
                </span>
              </div>

              <button
                onClick={handleNextTab}
                disabled={currentIdx === menuItems.length - 1}
                className="p-1 rounded cursor-pointer disabled:opacity-20"
                style={{ color: 'var(--text-secondary)' }}
                title="Chương tiếp"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Right: Autoplay & Index */}
          {viewMode === 'presentation' && (
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => setAutoplay(!autoplay)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide cursor-pointer transition-all"
                style={{
                  background: autoplay ? 'var(--accent-color)' : 'transparent',
                  color: autoplay ? 'white' : 'var(--text-secondary)',
                  border: autoplay ? '1px solid var(--accent-color)' : '1px solid var(--border-color)'
                }}
                title={autoplay ? "Tạm dừng" : "Tự động chạy"}
              >
                {autoplay ? <Pause size={11} /> : <Play size={11} />}
                <span>{autoplay ? 'Đang chạy' : 'Tự động'}</span>
              </button>

              <button
                onClick={() => setShowIndexOverlay(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                style={{ 
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
                title="Danh mục"
              >
                <Grid size={13} />
              </button>
            </div>
          )}
        </div>

        {/* ── MAIN CONTENT ── */}
        <AnimatePresence mode="wait">
          {viewMode === 'presentation' ? (
            <motion.div
              key="presentation-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl mx-auto"
            >
              <div className="p-6 md:p-10 min-h-[500px] relative"
                style={{ 
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-card)',
                  borderTop: '3px solid var(--accent-color)'
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25 }}
                  >
                    {currentTabItem.component}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="scroll-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 max-w-5xl mx-auto"
            >
              {[
                <HeroDashboard key="hero" onSelectTab={(tab) => { setViewMode('presentation'); setActiveTab(tab); }} />,
                <ConceptShowcase key="concept" />,
                <CharacteristicsGrid key="char" />,
                <CausesSection key="causes" />,
                <ConsequencesSection key="consequences" />,
                <TimelineSlider key="timeline" />,
                <HistoricalDossier key="dossier" />,
                <SolutionsAccordion key="solutions" />,
                <VisionRoadmap key="vision" />,
                <CitizenStudentRole key="citizen" />,
                <ConclusionReferences key="conclusion" />
              ].map((component, idx) => (
                <div key={idx} className="p-6 md:p-8" style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  {component}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SLIDE SELECTOR OVERLAY ── */}
      <AnimatePresence>
        {showIndexOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowIndexOverlay(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              className="w-full max-w-lg p-5 relative"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-card)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                borderTop: '3px solid var(--accent-color)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Grid size={16} style={{ color: 'var(--accent-color)' }} /> Danh mục trình bày
                </h3>
                <button
                  onClick={() => setShowIndexOverlay(false)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                  style={{ background: 'var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  Đóng
                </button>
              </div>

              <div className="space-y-1.5">
                {menuItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setShowIndexOverlay(false);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg text-left cursor-pointer transition-all"
                      style={{
                        background: isActive ? 'var(--accent-color)' : 'transparent',
                        color: isActive ? 'white' : 'var(--text-secondary)',
                        border: isActive ? '1px solid var(--accent-color)' : '1px solid var(--border-color)'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={14} />
                        <span className="text-[11px] font-bold uppercase tracking-wide">{item.label}</span>
                      </div>
                      {isActive && <CheckCircle size={14} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Chatbot */}
      <AIChatbot />

      {/* ── FOOTER ── */}
      <footer className="mt-16" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="h-[3px] w-full" style={{ background: 'var(--accent-color)', opacity: 0.15 }} />
        <div className="py-5" style={{ backgroundColor: 'var(--bg-paper)' }}>
          <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-3 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-2">
              <strong className="font-bold" style={{ color: 'var(--text-primary)' }}>Chuyên đề PCTN</strong>
              <span style={{ color: 'var(--border-strong)' }}>·</span>
              <span>SE1867 — Nhóm 5</span>
            </div>
            <div className="font-medium">
              Học phần: Chủ nghĩa xã hội khoa học
            </div>
            <div className="text-[9px]" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
              Academic Presentation Platform
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}