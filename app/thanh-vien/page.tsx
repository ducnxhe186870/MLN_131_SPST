"use client";

import { motion } from "framer-motion";
import { Users, Bot, MessageSquare, Terminal, Sparkles, Code } from "lucide-react";

const members = [
  { id: "1", name: "Nguyễn Hoàng Dũng", code: "HE180993", role: "Thành viên", initial: "D" },
  { id: "2", name: "Nguyễn Hữu Tuấn", code: "HE181032", role: "Thành viên", initial: "T" },
  { id: "3", name: "Đỗ Văn Thái", code: "HE180509", role: "Thành viên", initial: "T" },
  { id: "4", name: "Nguyễn Bá Thiết", code: "HS200948", role: "Thành viên", initial: "T" },
  { id: "5", name: "Nguyễn Quang Minh", code: "HE181174", role: "Thành viên", initial: "M" },
  { id: "6", name: "Nguyễn Tuấn Minh", code: "HE181922", role: "Thành viên", initial: "M" },
  { id: "7", name: "Đỗ Quang Anh", code: "HE186977", role: "Thành viên", initial: "A" },
  { id: "8", name: "Lê Minh Đức", code: "HE182440", role: "Thành viên", initial: "Đ" },
  { id: "9", name: "Lê Văn An", code: "HE186705", role: "Thành viên", initial: "A" },
  { id: "10", name: "Nguyễn Xuân Đức", code: "HE186870", role: "Lập trình viên", initial: "Đ" },
];

const aiTools = [
  {
    name: "ChatGPT",
    description: "Tra cứu tài liệu, nghiên cứu và hỗ trợ biên soạn nội dung lý thuyết học thuật.",
    icon: MessageSquare,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    name: "Gemini",
    description: "Hỗ trợ phân tích chuyên sâu, lên ý tưởng và hoàn thiện kết cấu nội dung.",
    icon: Sparkles,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    name: "Antigravity AI",
    description: "Trợ lý AI lập trình trực tiếp, hỗ trợ xây dựng mã nguồn, thiết kế UI/UX và tối ưu hóa hệ thống.",
    icon: Code,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

export default function ThanhVienPage() {
  return (
    <div className="min-h-screen py-12 bg-[var(--bg-color)] relative overflow-hidden pb-16" spellCheck={false}>
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[15%] left-[5%] w-[30vw] h-[30vw] bg-red-500/[0.02] rounded-full blur-[100px]" />
        <div className="absolute bottom-[15%] right-[5%] w-[35vw] h-[35vw] bg-amber-500/[0.02] rounded-full blur-[120px]" />
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 mt-12">
        <div className="modern-glass p-8 mb-8 text-center mt-8">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-[10px] md:text-xs uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 mb-3 border-b border-slate-200/20 dark:border-slate-800/20 pb-3">
            <span>Học phần: Chủ nghĩa xã hội khoa học</span>
            <span className="text-red-500">•</span>
            <span>Lớp: SE1867 — Nhóm 5</span>
          </div>
          <h1 
            spellCheck={false}
            data-ms-editor="false"
            data-gramm="false"
            lang="vi"
            className="text-2xl md:text-4xl font-serif-heading font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider"
          >
            Nhóm Thực Hiện <span className="text-red-500 relative inline-block">&<span className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-10 h-[3px] bg-red-500 rounded-full"></span></span> Báo Cáo AI
          </h1>
          <p className="font-serif-body text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-xl mx-auto italic mt-3">
            Danh sách thành viên ban biên tập và các công cụ trí tuệ nhân tạo hỗ trợ nghiên cứu nội dung chuyên đề.
          </p>
        </div>

        <div className="space-y-8">
          {/* Members Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="modern-glass p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-xl">
                <Users size={20} />
              </div>
              <h2 className="text-lg md:text-xl font-serif-heading font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Ban Biên Tập</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member, index) => {
                const isDev = member.role === "Lập trình viên";
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-slate-950/20 border transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                      isDev 
                        ? 'border-red-500/30 hover:border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.05)]' 
                        : 'border-slate-200/35 dark:border-slate-800/35 hover:border-red-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-sans font-black text-sm border shrink-0 ${
                        isDev
                          ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                          : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-355'
                      }`}>
                        {member.initial}
                      </div>
                      <div>
                        <h3 className="font-serif-heading text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{member.name}</h3>
                        <p className="text-[10px] font-sans text-slate-500 dark:text-slate-400 mt-1">{member.code}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[8px] font-sans font-bold uppercase tracking-wider rounded-lg border shrink-0 ${
                      isDev
                        ? "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20"
                        : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    }`}>
                      {isDev && <Terminal size={8} className="inline mr-1 -mt-0.5" />}
                      {member.role}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* AI Report Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="modern-glass p-6 md:p-8 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
              <div className="p-2 bg-violet-500/10 text-violet-500 rounded-xl">
                <Bot size={20} />
              </div>
              <h2 className="text-lg md:text-xl font-serif-heading font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider text-center md:text-left">Trợ Lý Công Nghệ</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {aiTools.map((tool, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl bg-white/40 dark:bg-slate-950/20 border border-slate-200/35 dark:border-slate-800/35 hover:border-violet-500/40 transition-all duration-300 flex flex-col h-full overflow-hidden"
                >
                  <div className="p-5 flex-1 flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl shrink-0 ${tool.bg} ${tool.color} border border-current/10`}>
                      <tool.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-serif-heading text-sm font-bold text-slate-800 dark:text-slate-200">{tool.name}</h3>
                      <p className="text-[10px] font-serif-body text-slate-500 leading-normal mt-1">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Footer quote */}
        <div className="mt-12 text-center">
          <p className="font-serif-body text-xs text-slate-500 dark:text-slate-400 italic">
            "Tất cả vì mục tiêu xây dựng chủ nghĩa xã hội khoa học và phục vụ chấn hưng nước nhà."
          </p>
        </div>
      </div>
    </div>
  );
}
