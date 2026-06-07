'use client';

import PageHeader from '../components/PageHeader';
import HistoricalDossier from '@/components/HistoricalDossier';

export default function OnTapQuiz() {
  return (
    <div className="min-h-screen py-12 bg-[var(--bg-color)] relative overflow-hidden pb-16">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[15%] left-[5%] w-[30vw] h-[30vw] bg-red-500/[0.02] rounded-full blur-[100px]" />
        <div className="absolute bottom-[15%] right-[5%] w-[35vw] h-[35vw] bg-amber-500/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10 mt-12">
        <div className="modern-glass py-8 p-6 md:p-8 mb-8 text-center mt-8">
          <p className="font-sans text-xs uppercase tracking-[.3em] font-bold text-slate-500 dark:text-slate-400 mb-2">Hồ sơ tư liệu bách khoa</p>
          <h1 className="text-2xl md:text-4xl lg:text-[2.2rem] font-serif-heading font-black text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-[0.01em] leading-tight">
            Hợp Tuyển Lịch Sử: <br className="md:hidden" /><span className="text-red-500 font-bold">Các Đại Án Kinh Tế Điển Hình</span>
          </h1>
          <div className="w-16 h-1 bg-red-500 mx-auto mb-4"></div>
          <p className="font-serif-body text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-2xl mx-auto italic leading-relaxed">
            Nghiên cứu nguyên nhân phát sinh sai phạm, lỗ hổng tín dụng và phán quyết nghiêm minh từ Tòa án nhân dân qua các thời kỳ phát triển kinh tế đất nước.
          </p>
        </div>

        {/* Historical Dossier Grid Slider */}
        <div className="mb-12">
           <HistoricalDossier />
        </div>
      </div>
    </div>
  );
}
