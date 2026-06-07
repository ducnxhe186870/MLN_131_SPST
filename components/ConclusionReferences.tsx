'use client';

import { BookOpen, Bookmark, ArrowUpRight, GraduationCap } from 'lucide-react';

export default function ConclusionReferences() {
  const references = [
    { text: "Hiến pháp nước Cộng hòa xã hội chủ nghĩa Việt Nam năm 2013.", source: "Cổng TTĐT Quốc hội Việt Nam" },
    { text: "Nghị quyết số 27-NQ/TW ngày 09/11/2022 của Ban Chấp hành Trung ương Đảng khóa XIII về tiếp tục xây dựng và hoàn thiện Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam.", source: "Văn phòng Trung ương Đảng" },
    { text: "Luật Phòng, chống tham nhũng năm 2018 và các văn bản hướng dẫn thi hành.", source: "Bộ Tư pháp Việt Nam" },
    { text: "Giáo trình Chủ nghĩa xã hội khoa học.", source: "Bộ Giáo dục và Đào tạo" },
    { text: "Công ước Liên Hợp Quốc về chống tham nhũng (UNCAC) mà Việt Nam là thành viên.", source: "United Nations (UNCAC)" }
  ];

  return (
    <div className="w-full py-4 transition-colors duration-500">
      {/* Slide Title */}
      <div className="text-center mb-8">
        <span className="text-[9px] font-sans font-extrabold uppercase tracking-wide text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/15">
          CHƯƠNG VII: KẾT LUẬN & TÀI LIỆU
        </span>
        <h2 className="text-2xl md:text-3xl font-serif-heading font-black text-slate-900 dark:text-white mt-3">
          Lời Kết & Thư Viện Học Thuật
        </h2>
        <p className="font-serif-body text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto italic mt-1.5">
          Tổng kết chuyên đề nghiên cứu khoa học và nguồn tài liệu tra cứu số hóa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">
        
        {/* Lời kết */}
        <div className="modern-glass p-6 md:p-8 flex flex-col border border-slate-200/50 dark:border-slate-800/40">
          <div className="flex items-center gap-2 text-red-500 mb-3">
            <Bookmark size={16} />
            <span className="text-[10px] font-sans font-extrabold uppercase tracking-wide">Lời kết chuyên đề</span>
          </div>
          <h3 className="text-sm md:text-base font-serif-heading font-black text-slate-900 dark:text-white mb-3">
            Kiên trì Kiến tạo Chế độ Liêm chính & Thượng tôn Pháp luật
          </h3>
          <p className="font-serif-body text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400 text-justify flex-1">
            Xây dựng Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam là một quá trình cải cách toàn diện, đòi hỏi tính kiên trì, tự kiểm soát chặt chẽ của các cơ quan nhà nước và sự giám sát xã hội rộng rãi từ nhân dân. Cuộc đấu tranh chống tham nhũng, lãng phí không có vùng cấm, không có ngoại lệ là tiền đề để củng cố vững chắc chế độ chính trị và lòng tin của người dân. Là sinh viên, chúng ta cam kết thực hành liêm chính học đường để trở thành những viên gạch vững chắc xây dựng xã hội thượng tôn pháp luật.
          </p>
        </div>

        {/* Tài liệu tham khảo */}
        <div className="modern-glass p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/40">
          <div className="flex items-center gap-2 text-red-500 mb-4.5">
            <BookOpen size={16} />
            <span className="text-[10px] font-sans font-extrabold uppercase tracking-wide">Tài liệu tham khảo số hóa</span>
          </div>
          <div className="space-y-3">
            {references.map((ref, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-500/5 hover:bg-slate-500/10 transition-colors border border-slate-200/15 dark:border-slate-800/10 group">
                <span className="h-6 w-6 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-sans font-extrabold text-[9px] shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-serif-body text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-bold">{ref.text}</p>
                  <span className="text-[8px] font-sans font-extrabold uppercase tracking-normal text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-1">
                    <GraduationCap size={10} /> {ref.source}
                  </span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
