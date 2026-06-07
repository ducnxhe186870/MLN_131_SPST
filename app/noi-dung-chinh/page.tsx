"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Shield,
  Info,
  CheckCircle,
  Zap,
  BookOpen,
  Trophy,
  Scale,
  Handshake,
  Search,
  AlertTriangle,
  FileText,
  UserCheck,
  Folder,
  Stamp,
  ArrowRight,
  Fingerprint,
  Lock,
  Eye,
  Gavel,
  Target,
  Compass,
  Layout,
  MessageSquare
} from "lucide-react";

import { quizData } from "./data/quiz";
import { InlineQuiz } from "./components/InlineQuiz";
import { createQuestionSessionSeed, sampleQuestionsDeterministic } from "@/lib/pdfQuestionBank";
import { useTheme } from "../components/ThemeProvider";
import CorruptionWheel from "./components/CorruptionWheel";
import Museum3D from "./components/Museum3D";

/* ═══════════════════════════════════════════════════════════════════ */
/*  REUSABLE UI COMPONENTS                                            */
/* ═══════════════════════════════════════════════════════════════════ */

/** Reusable modern container for images with full Lightbox trigger */
function LightboxImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const { showImage } = useTheme();
  return (
    <div className="flex flex-col items-center">
      <div 
        onClick={() => showImage(src, alt)}
        className="w-full relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-900/10 dark:bg-slate-950/20 hover:border-red-500/40 cursor-zoom-in transition-all duration-300 group"
      >
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.01]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {caption && (
        <span className="text-[10px] md:text-xs font-serif-body italic text-slate-500 mt-2 text-center leading-normal">
          — {caption} (Click để phóng to toàn màn hình) —
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                         */
/* ═══════════════════════════════════════════════════════════════════ */

export default function Wrapper() {
  return <Suspense fallback={null}><Page /></Suspense>;
}

function Page() {
  const [inlineQuizData, setInlineQuizData] = useState<any[]>([]);
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<string>("definitions");

  useEffect(() => {
    setInlineQuizData(sampleQuestionsDeterministic(quizData, 10, createQuestionSessionSeed("noi-dung-chinh")));
  }, []);

  const subTabs = [
    { id: "definitions", label: "Lý thuyết PCTN", icon: BookOpen },
    { id: "museum3d", label: "Bảo tàng ảo 3D", icon: Compass },
    { id: "wheel", label: "Vòng quay Nhận diện", icon: Target },
    { id: "actions", label: "Hành động & Hướng dẫn", icon: Shield },
    { id: "quiz", label: "Bài thi Liêm chính", icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-color)] transition-colors duration-500 relative overflow-hidden pb-16">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[15%] left-[5%] w-[35vw] h-[35vw] bg-red-500/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-[15%] right-[5%] w-[40vw] h-[40vw] bg-amber-500/[0.03] rounded-full blur-[130px]" />
      </div>

      <div className="container-custom pt-32 relative z-10 px-4 sm:px-6 max-w-6xl">
        
        {/* Header Block */}
        <div className="text-center mb-10 p-6 md:p-8 rounded-3xl bg-white/40 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
          <div className="inline-block px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/5 mb-4">
            <span className="text-[10px] font-sans font-extrabold uppercase tracking-wide text-red-500">Hồ sơ Liêm chính chuyên sâu</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif-heading font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-none">
            Phòng, Chống Tham Nhũng
          </h1>
          <p className="font-serif-body text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto italic mt-3 leading-relaxed">
            "Kiến thức là vũ khí, liêm chính là lá chắn. Bảo vệ hệ thống pháp luật xã hội chủ nghĩa."
          </p>
        </div>

        {/* Dynamic sub-tab switcher */}
        <div className="flex justify-start md:justify-center items-center overflow-x-auto p-1.5 rounded-2xl bg-white/60 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 shadow-sm gap-1 mb-8 hide-scrollbar">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-sans font-bold text-[10px] uppercase tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-red-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/10"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab contents with Framer Motion transitions */}
        <div className="modern-glass p-6 md:p-10 min-h-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              
              {/* Tab 1: Definitions */}
              {activeTab === "definitions" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-3 text-red-500 mb-2">
                      <BookOpen size={18} />
                      <span className="text-[10px] font-sans font-extrabold uppercase tracking-wide">Định nghĩa lý luận</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-serif-heading font-black text-slate-900 dark:text-slate-100 leading-tight">
                      Tham nhũng dưới góc nhìn pháp lý Việt Nam
                    </h2>
                    
                    <div className="border-l-4 border-red-500 pl-4 py-2 bg-slate-50 dark:bg-slate-900/40 rounded-r-xl">
                      <p className="font-serif-body text-sm leading-relaxed italic text-slate-700 dark:text-slate-300">
                        "Hành vi của người có chức vụ, quyền hạn đã lợi dụng chức vụ, quyền hạn đó vì vụ lợi."
                      </p>
                      <span className="text-[10px] font-sans font-bold text-red-500 block mt-1 uppercase tracking-wide">— Luật Phòng, chống tham nhũng Việt Nam</span>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: "CHỦ THỂ", text: "Người có chức vụ, quyền hạn hoạt động trong khu vực công hoặc khu vực tư.", icon: UserCheck },
                        { label: "HÀNH VI", text: "Lạm dụng, vượt quá hoặc lợi dụng quyền hạn được tổ chức hoặc nhân dân giao phó.", icon: Gavel },
                        { label: "MỤC ĐÍCH", text: "Mưu cầu lợi ích vật chất, tiền tài hoặc các lợi ích phi vật chất bất chính.", icon: Target }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4 items-start p-3 hover:bg-red-500/[0.02] rounded-xl transition-all">
                          <div className="mt-1 text-red-500">
                            <item.icon size={16} />
                          </div>
                          <div>
                            <h4 className="font-sans font-extrabold text-[10px] uppercase tracking-wide text-slate-800 dark:text-slate-200 mb-1">{item.label}</h4>
                            <p className="text-xs font-serif-body text-slate-500 dark:text-slate-400 leading-relaxed">{item.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <LightboxImage 
                      src="/images/anti-corruption/definition.png" 
                      alt="Biểu tượng Công lý & Pháp luật" 
                      caption="Trưng bày lý luận về Thượng tôn Pháp luật & Phòng chống tham nhũng"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Museum 3D */}
              {activeTab === "museum3d" && (
                <div className="space-y-6">
                  <div className="text-center max-w-xl mx-auto mb-6">
                    <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
                      <Compass size={18} />
                      <span className="text-[10px] font-sans font-extrabold uppercase tracking-wide">Không gian thực tế ảo 3D</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-serif-heading font-black text-slate-900 dark:text-slate-100 leading-tight">
                      Phòng Trưng Bày Hiện Vật Lịch Sử
                    </h2>
                    <p className="text-xs font-serif-body text-slate-500 mt-2">
                      Tương tác xoay 360 độ và phóng đại các hiện vật của kỷ nguyên lập quốc và phát triển hệ thống tư pháp Việt Nam.
                    </p>
                  </div>

                  {/* 3D WebGL Museum viewport */}
                  <Museum3D />
                </div>
              )}

              {/* Tab 3: Corruption Wheel */}
              {activeTab === "wheel" && (
                <div className="space-y-6">
                  <div className="text-center max-w-xl mx-auto mb-6">
                    <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
                      <Target size={18} />
                      <span className="text-[10px] font-sans font-extrabold uppercase tracking-wide">Nhận diện hành vi</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-serif-heading font-black text-slate-900 dark:text-slate-100 leading-tight">
                      Vòng Quay Tương Tác Nhận Diện
                    </h2>
                    <p className="text-xs font-serif-body text-slate-500 mt-2">
                      Thử thách kiến thức pháp lý bằng cách quay vòng để khám phá các vụ án điển hình và phân tích khung pháp lý tương ứng.
                    </p>
                  </div>

                  {/* Wheel Interactive Game */}
                  <CorruptionWheel />
                </div>
              )}

              {/* Tab 4: Actions & Whistleblowing */}
              {activeTab === "actions" && (
                <div className="space-y-8">
                  {/* Citizen Actions Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-red-500 mb-2">
                        <Eye size={18} />
                        <span className="text-[10px] font-sans font-extrabold uppercase tracking-wide">Trách nhiệm công dân</span>
                      </div>
                      <h2 className="text-xl font-serif-heading font-black text-slate-900 dark:text-slate-100">
                        Hành động của mỗi cá nhân
                      </h2>
                      
                      <div className="grid gap-4">
                        {[
                          { t: "Hiểu biết về quyền", d: "Chủ động nghiên cứu Hiến pháp, quyền tiếp cận thông tin công vụ và quy trình giám sát xã hội.", i: Eye },
                          { t: "Dũng cảm phản ánh", d: "Tuyệt đối không đưa hối lộ dưới mọi hình thức, kịp thời phản ánh các dấu hiệu cửa quyền, nhũng nhiễu.", i: Zap },
                          { t: "Nâng cao liêm chính", d: "Củng cố đạo đức sống minh bạch trong học tập, lao động sản xuất và các mối quan hệ xã hội.", i: Shield },
                          { t: "Tham gia đồng hành", d: "Hưởng ứng, tuyên truyền các chương trình pháp luật về phòng chống tham nhũng trong cơ quan, đoàn thể.", i: Handshake }
                        ].map((item, idx) => (
                          <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/40 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50">
                            <div className="p-2 bg-red-500/10 text-red-500 rounded-xl h-fit">
                              <item.i size={16} />
                            </div>
                            <div>
                              <h4 className="text-xs font-sans font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200 mb-1">{item.t}</h4>
                              <p className="text-[11px] font-serif-body text-slate-500 dark:text-slate-400 leading-relaxed">{item.d}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Whistleblowing Guide Form Card */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-red-500 mb-2">
                        <AlertTriangle size={18} />
                        <span className="text-[10px] font-sans font-extrabold uppercase tracking-wide">Quy trình tố giác</span>
                      </div>
                      <h2 className="text-xl font-serif-heading font-black text-slate-900 dark:text-slate-100">
                        Hướng dẫn phản ánh sai phạm
                      </h2>

                      <div className="p-6 rounded-2xl border border-red-500/10 bg-slate-500/5 backdrop-blur space-y-4">
                        <div>
                          <h4 className="text-[10px] font-sans font-extrabold uppercase tracking-wide text-red-500 mb-2">Các hình thức phản ánh</h4>
                          <ul className="space-y-2 text-xs font-serif-body text-slate-600 dark:text-slate-350">
                            <li className="flex gap-2"><ArrowRight size={12} className="text-red-500 mt-0.5 shrink-0" /> Gửi đơn kiến nghị trực tiếp đến cơ quan chức năng hoặc bưu điện.</li>
                            <li className="flex gap-2"><ArrowRight size={12} className="text-red-500 mt-0.5 shrink-0" /> Gọi qua đường dây nóng trực ban PCTN Trung ương.</li>
                            <li className="flex gap-2"><ArrowRight size={12} className="text-red-500 mt-0.5 shrink-0" /> Gửi qua Cổng Dịch vụ công hoặc trang tố giác tội phạm chính thống.</li>
                          </ul>
                        </div>

                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 text-[11px] font-serif-body text-amber-900 dark:text-amber-200">
                          <strong>Bảo mật & Quyền lợi:</strong> Người tố cáo có quyền yêu cầu cơ quan có thẩm quyền giữ bí mật hoàn toàn danh tính, bảo vệ an toàn tính mạng và tài sản cá nhân trước mọi hành vi trả thù.
                        </div>

                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border-l-4 border-red-600 text-[11px] font-serif-body text-red-900 dark:text-red-200">
                          <strong>Trách nhiệm:</strong> Người phản ánh, tố giác có nghĩa vụ nêu trung thực các dữ liệu, chịu trách nhiệm hoàn toàn trước pháp luật nếu cố ý vu khống hoặc tố cáo sai sự thật.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="max-w-md mx-auto pt-6">
                    <LightboxImage 
                      src="/images/anti-corruption/whistleblowing.png" 
                      alt="Quy trình Tiếp nhận tin tố giác tội phạm" 
                      caption="Sơ đồ quy trình bảo mật thông tin tiếp nhận tố cáo của Thanh tra Nhà nước"
                    />
                  </div>
                </div>
              )}

              {/* Tab 5: Quiz */}
              {activeTab === "quiz" && (
                <div className="space-y-6">
                  <div className="text-center max-w-xl mx-auto mb-6">
                    <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
                      <FileText size={18} />
                      <span className="text-[10px] font-sans font-extrabold uppercase tracking-wide">Khảo sát năng lực</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-serif-heading font-black text-slate-900 dark:text-slate-100 leading-tight">
                      Bài kiểm tra trắc nghiệm Liêm chính
                    </h2>
                    <p className="text-xs font-serif-body text-slate-500 mt-2">
                      Hệ thống tự động lọc 10 câu hỏi ngẫu nhiên kiểm tra hiểu biết của bạn về luật phòng, chống tham nhũng.
                    </p>
                  </div>

                  <div className="p-4 md:p-8 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
                    {inlineQuizData.length > 0 ? (
                      <InlineQuiz data={inlineQuizData} />
                    ) : (
                      <div className="flex flex-col items-center py-20 animate-pulse">
                        <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="font-serif-body text-red-500 font-bold tracking-wide uppercase text-[10px]">Đang tạo cấu trúc đề thi...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Modern Dossier Footer */}
      <footer className="mt-20 py-12 text-center border-t border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-slate-50/50 dark:bg-slate-950/30 transition-colors duration-500">
        <div className="container-custom">
          <div className="flex justify-center items-center gap-3 text-slate-400 mb-4">
            <Lock size={16} />
            <span className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800"></span>
            <Shield size={16} />
            <span className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800"></span>
            <Scale size={16} />
          </div>
          <h2 className="font-serif-heading text-lg mb-3 text-slate-850 dark:text-slate-100">
            LIÊM CHÍNH LÀ NỀN TẢNG CỦA THỊNH VƯỢNG
          </h2>
          <p className="font-serif-body max-w-xl mx-auto text-slate-500 dark:text-slate-400 text-xs">
            Học phần: Chủ nghĩa xã hội khoa học <br/>
            SE1867 - Nhóm 5
          </p>
        </div>
      </footer>
    </div>
  );
}
