'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import HostView from './components/HostView';
import PlayerView from './components/PlayerView';
import { motion } from 'framer-motion';
import { BookOpen, Users, Compass, Trophy, Info } from 'lucide-react';

export default function QuizPage() {
  const [viewMode, setViewMode] = useState<'landing' | 'host' | 'player'>('landing');

  if (viewMode === 'landing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 bg-gradient-to-br from-[#FAF8F5] via-[#FDF9F2] to-[#FAF8F5] dark:from-[#0B0D17] dark:via-[#12162A] dark:to-[#0B0D17] relative overflow-hidden">
        {/* Animated Background Mesh & Lights */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[35vw] h-[35vw] bg-red-650/10 dark:bg-red-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] bg-amber-500/5 dark:bg-amber-500/5 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '12s' }} />
          
          {/* Subtle Grid Lines */}
          <div 
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
            style={{ 
              backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '40px 40px' 
            }}
          />
        </div>

        {/* Outer Decorative Indochine Corner Frames */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-red-650/30 dark:border-red-500/40 pointer-events-none hidden md:block" />
        <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-red-650/30 dark:border-red-500/40 pointer-events-none hidden md:block" />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-red-650/30 dark:border-red-500/40 pointer-events-none hidden md:block" />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-red-650/30 dark:border-red-500/40 pointer-events-none hidden md:block" />

        {/* Title Block */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-2xl mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs font-sans font-bold uppercase tracking-[0.2em] mb-4">
            <Trophy className="w-3.5 h-3.5 animate-bounce" /> Đấu trường học thuật
          </div>
          <h1 className="mb-4 text-4xl md:text-6xl font-serif-heading font-black tracking-wider text-slate-900 dark:text-white uppercase drop-shadow-md">
            Trò Chơi <span className="bg-gradient-to-r from-red-650 to-amber-600 dark:from-red-500 dark:to-amber-500 bg-clip-text text-transparent">Lịch Sử</span>
          </h1>
          <p className="text-sm font-serif-body text-slate-500 dark:text-slate-400 italic max-w-md mx-auto leading-relaxed">
            Hệ thống ôn luyện lý luận và tìm hiểu lịch sử giai đoạn 1975 - 1986. Hãy chọn một chế độ để bắt đầu hành trình.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent mx-auto mt-4" />
        </motion.div>

        {/* Option Cards Grid */}
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 relative z-10 w-full max-w-5xl px-4">
          
          {/* Card 1: Self-Study (Offline) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1"
          >
            <Link href="/quiz-join" className="group h-full flex">
              <div className="w-full flex flex-col justify-between p-8 rounded-3xl backdrop-blur-xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 shadow-sm hover:shadow-xl hover:border-red-500/50 hover:bg-white/60 dark:hover:bg-slate-950/60 transition-all duration-300 transform group-hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-[100px] group-hover:bg-red-500/10 transition-colors" />
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-mono font-bold text-red-650 dark:text-red-400 tracking-widest bg-red-550/10 px-2.5 py-1 rounded-md">CHẾ ĐỘ 01</span>
                    <span className="text-3xl transition-transform group-hover:scale-110 duration-300">📝</span>
                  </div>
                  <h3 className="text-2xl font-serif-heading font-black text-slate-900 dark:text-white uppercase tracking-wide group-hover:text-red-500 transition-colors">Tự Ôn Tập</h3>
                  <p className="mt-3 text-xs font-serif-body text-slate-500 dark:text-slate-400 leading-relaxed">
                    Khóa thi cá nhân ôn luyện bộ câu hỏi ngẫu nhiên trong thư viện. Thích hợp tự học lý luận, hiến pháp.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-200/20 dark:border-slate-800/20 flex justify-between items-center text-xs font-sans font-bold text-red-650 dark:text-red-400 uppercase tracking-widest">
                  <span>Vào thi đấu đơn</span>
                  <span className="transform group-hover:translate-x-1.5 transition-transform">→</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Card 2: Multiplayer Player (Join Room) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1"
          >
            <button 
              onClick={() => setViewMode('player')}
              className="w-full h-full flex flex-col justify-between p-8 text-left rounded-3xl backdrop-blur-xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 shadow-sm hover:shadow-xl hover:border-red-500/50 hover:bg-white/60 dark:hover:bg-slate-950/60 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-[100px] group-hover:bg-amber-500/10 transition-colors" />
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-md">CHẾ ĐỘ 02</span>
                  <span className="text-3xl transition-transform group-hover:scale-110 duration-300">📱</span>
                </div>
                <h3 className="text-2xl font-serif-heading font-black text-slate-900 dark:text-white uppercase tracking-wide group-hover:text-red-500 transition-colors">Sĩ Tử Dự Thi</h3>
                <p className="mt-3 text-xs font-serif-body text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tham gia vào phòng thi đấu trực tuyến được tạo bởi Chỉ huy (Giáo viên). Nhập mã PIN và tranh tài với tập thể.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-200/20 dark:border-slate-800/20 flex justify-between items-center text-xs font-sans font-bold text-red-650 dark:text-red-400 uppercase tracking-widest w-full">
                <span>Nhập mã PIN thi đấu</span>
                <span className="transform group-hover:translate-x-1.5 transition-transform">→</span>
              </div>
            </button>
          </motion.div>

          {/* Card 3: Multiplayer Host (Create Room) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-1"
          >
            <button 
              onClick={() => setViewMode('host')}
              className="w-full h-full flex flex-col justify-between p-8 text-left rounded-3xl backdrop-blur-xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 shadow-sm hover:shadow-xl hover:border-red-500/50 hover:bg-white/60 dark:hover:bg-slate-950/60 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-[100px] group-hover:bg-red-500/10 transition-colors" />
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-mono font-bold text-red-650 dark:text-red-400 tracking-widest bg-red-550/10 px-2.5 py-1 rounded-md">CHẾ ĐỘ 03</span>
                  <span className="text-3xl transition-transform group-hover:scale-110 duration-300">🖥️</span>
                </div>
                <h3 className="text-2xl font-serif-heading font-black text-slate-900 dark:text-white uppercase tracking-wide group-hover:text-red-500 transition-colors">Bàn Máy Chủ</h3>
                <p className="mt-3 text-xs font-serif-body text-slate-500 dark:text-slate-400 leading-relaxed">
                  Thiết lập phòng thi, phát mã PIN cho cả lớp, kiểm soát tốc độ câu hỏi và chiếu kết quả xếp hạng thời gian thực.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-200/20 dark:border-slate-800/20 flex justify-between items-center text-xs font-sans font-bold text-red-650 dark:text-red-400 uppercase tracking-widest w-full">
                <span>Tạo phòng thi đấu mới</span>
                <span className="transform group-hover:translate-x-1.5 transition-transform">→</span>
              </div>
            </button>
          </motion.div>
        </div>

        {/* Instructions Manual Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-xl w-full mt-12 p-6 rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/30 shadow-sm relative z-10"
        >
          <div className="flex items-center gap-2 mb-3 border-b border-slate-200/20 dark:border-slate-800/20 pb-2">
            <Info className="w-4 h-4 text-red-650 dark:text-red-400" />
            <span className="font-serif-heading font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Sổ tay Chỉ huy phòng máy</span>
          </div>
          <ol className="list-decimal pl-5 space-y-2 text-xs font-serif-body text-slate-650 dark:text-slate-400">
            <li>Dùng thiết bị trình chiếu chính (như máy chiếu, laptop) để mở <strong className="text-red-650 dark:text-red-400">Bàn Máy Chủ</strong>.</li>
            <li>Hướng dẫn toàn bộ sĩ tử dùng thiết bị cá nhân di động chọn chế độ <strong className="text-slate-800 dark:text-white">Sĩ Tử Dự Thi</strong>.</li>
            <li>Nhập chính xác mã PIN gồm 5 chữ số hiển thị trên máy chủ và điền họ tên.</li>
            <li>Chờ Máy chủ phát tín hiệu <strong className="text-emerald-600">Bắt đầu</strong> để toàn phòng cùng tranh tài.</li>
          </ol>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <button 
        onClick={() => setViewMode('landing')}
        className="fixed z-50 px-3.5 py-2 text-[10px] font-sans font-black uppercase tracking-widest text-white bg-gradient-to-r from-red-650 to-red-600 hover:from-red-600 hover:to-red-500 border border-red-750 dark:border-red-500 rounded-xl top-20 right-4 shadow-md shadow-red-650/15 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-md"
      >
        Thoát chế độ
      </button>
      
      {viewMode === 'host' ? <HostView /> : <PlayerView />}
    </div>
  );
}