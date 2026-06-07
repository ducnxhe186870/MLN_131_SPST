'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShieldAlert, Sparkles, BookOpen, AlertTriangle, ArrowRight, ShieldCheck, Lock, Upload, Send, HelpCircle, Trash2, RefreshCw } from 'lucide-react';
import { useTheme } from '@/app/components/ThemeProvider';

export default function CitizenStudentRole() {
  const { showImage } = useTheme();
  
  // Interactive checklist states
  const [checkedList, setCheckedList] = useState([false, false, false]);
  
  // Whistleblower mock form states
  const [reportType, setReportType] = useState('anonymous');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // New interactive upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New simulated transmission states
  const [transmissionStage, setTransmissionStage] = useState(0); // 0: idle, 1: logs, 2: success
  const [transmissionLogs, setTransmissionLogs] = useState<string[]>([]);

  const toggleCheck = (idx: number) => {
    const next = [...checkedList];
    next[idx] = !next[idx];
    setCheckedList(next);
  };

  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitted(true);
    setTransmissionStage(1);
    setTransmissionLogs([]);

    const steps = [
      "🔄 Đang nén dữ liệu chứng cứ...",
      "🔐 Đang mã hóa gói tin bằng AES-256...",
      "🌐 Đang kết nối đường truyền SSL an toàn...",
      "📡 Đang gửi dữ liệu ẩn danh thành công...",
      "🧹 Đang xóa sạch Access Logs thiết bị..."
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setTransmissionLogs(prev => [...prev, step]);
        if (index === steps.length - 1) {
          setTimeout(() => {
            setTransmissionStage(2); // Show final success screen
          }, 800);
        }
      }, (index + 1) * 800);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setTransmissionStage(0);
    setTransmissionLogs([]);
    setSubject('');
    setContent('');
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const allChecked = checkedList.every(Boolean);

  return (
    <div className="w-full py-4 transition-colors duration-500">
      {/* Title */}
      <div className="text-center mb-8">
        <span
          className="text-[9px] font-sans font-extrabold uppercase tracking-wide px-3 py-1 rounded-lg"
          style={{
            color: 'var(--accent-color)',
            backgroundColor: 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-color) 20%, transparent)',
          }}
        >
          CHƯƠNG VI: VAI TRÒ CỦA CÔNG DÂN &amp; SINH VIÊN
        </span>
        <h2
          className="text-2xl md:text-3xl font-serif-heading font-black mt-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Trách Nhiệm Liêm Chính &amp; Giám Sát Xã Hội
        </h2>
        <p
          className="font-serif-body text-xs md:text-sm max-w-xl mx-auto italic mt-1.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          Thực hành đạo đức liêm chính học đường và chủ động tham gia giám sát, phòng chống tham nhũng
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
        
        {/* Left Column: Interactive Integrity Checklist */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-3" style={{ color: 'var(--accent-color)' }}>
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color) 10%, transparent)' }}
            >
              <BookOpen size={16} />
            </div>
            <span className="text-[10px] font-sans font-extrabold uppercase tracking-wide">Cam kết hành động sinh viên</span>
          </div>

          <div
            className="p-6 relative"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-card)',
              borderTop: '3px solid var(--accent-color)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h3
              className="text-sm font-serif-heading font-bold mb-4 flex items-center justify-between"
              style={{ color: 'var(--text-primary)' }}
            >
              Bản Tự Đánh Giá &amp; Cam Kết Liêm Chính
              {allChecked && (
                <span className="text-[9px] font-sans font-extrabold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1 animate-bounce">
                  <ShieldCheck size={10} /> ĐÃ CAM KẾT
                </span>
              )}
            </h3>

            <div className="space-y-4">
              {[
                {
                  t: 'Liêm chính học đường',
                  d: 'Nói không với gian lận thi cử, đạo văn, sao chép bài luận. Tôn trọng công sức lao động trí tuệ thực chất.',
                  i: Sparkles
                },
                {
                  t: 'Nâng cao nhận thức pháp cương',
                  d: 'Chủ động nghiên cứu pháp luật hành chính, Hiến pháp và các quy chế dân chủ giám sát tại trường học.',
                  i: Eye
                },
                {
                  t: 'Dũng cảm phản ánh',
                  d: 'Không dung túng cho sai phạm học thuật, sẵn sàng lên tiếng đấu tranh loại bỏ hiện tượng tiêu cực ở giảng đường.',
                  i: ShieldAlert
                }
              ].map((item, idx) => {
                const ItemIcon = item.i;
                const isChecked = checkedList[idx];
                return (
                  <div 
                    key={idx} 
                    onClick={() => toggleCheck(idx)}
                    className="p-4 rounded-xl transition-all cursor-pointer flex gap-4"
                    style={{
                      backgroundColor: isChecked
                        ? 'color-mix(in srgb, #10b981 5%, var(--bg-card))'
                        : 'var(--bg-card)',
                      border: isChecked
                        ? '1px solid color-mix(in srgb, #10b981 40%, transparent)'
                        : '1px solid var(--border-color)',
                    }}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : ''
                      }`}
                        style={!isChecked ? { borderColor: 'var(--border-color)' } : {}}
                      >
                        {isChecked && <span className="text-[10px] font-sans leading-none">✓</span>}
                      </div>
                    </div>

                    <div>
                      <h4
                        className="text-xs font-sans font-extrabold uppercase tracking-normal mb-1"
                        style={{ color: isChecked ? '#059669' : 'var(--text-primary)' }}
                      >
                        {item.t}
                      </h4>
                      <p
                        className="text-[11px] font-serif-body leading-relaxed text-justify"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {item.d}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Congratulations Banner */}
            <AnimatePresence>
              {allChecked && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"
                >
                  <p className="font-serif-body text-[11px] text-emerald-700 leading-relaxed">
                    🌟 <strong>Bạn đã cam kết thực hành đạo đức liêm chính!</strong> Đội ngũ biên tập trân trọng tinh thần thượng tôn luật pháp của thế hệ sinh viên Việt Nam.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Whistleblower Secure Vault UI */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-3" style={{ color: 'var(--accent-color)' }}>
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'color-mix(in srgb, var(--accent-color) 10%, transparent)' }}
            >
              <Lock size={16} />
            </div>
            <span className="text-[10px] font-sans font-extrabold uppercase tracking-wide">Hộp tố giác bảo mật (Simulated Vault)</span>
          </div>

          <div
            className="p-6 relative"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-card)',
              borderTop: '3px solid var(--accent-color)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[8px] font-sans font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
              <ShieldCheck size={10} /> MÃ HÓA AES-256
            </div>

            <h3
              className="text-sm font-serif-heading font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Cổng Tiếp Nhận Phản Ánh Sai Phạm Công Vụ
            </h3>

            <div className="mb-4 p-3 rounded-lg text-[10px] leading-relaxed text-justify opacity-85 border border-[#DA251D]/15" style={{ color: 'var(--text-secondary)', backgroundColor: 'color-mix(in srgb, #DA251D 5%, var(--bg-paper))' }}>
              ℹ️ <strong>Mục đích giả lập:</strong> Form tương tác này giúp người học tìm hiểu quy trình gửi đơn tố giác an toàn. Dữ liệu chỉ được chạy trên trình duyệt của bạn và <strong>KHÔNG được gửi đi bất cứ đâu</strong> để bảo mật thông tin cá nhân.
            </div>

            <form onSubmit={handleMockSubmit} className="space-y-4">
              {/* Report identity type */}
              <div>
                <span
                  className="block text-[8px] font-sans font-extrabold uppercase tracking-wide mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  CHẾ ĐỘ BẢO MẬT
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReportType('anonymous')}
                    className="py-2 px-3 text-[10px] font-sans font-bold uppercase tracking-normal rounded-lg text-center transition-all animate-none"
                    style={
                      reportType === 'anonymous'
                        ? {
                            backgroundColor: 'var(--text-primary)',
                            color: 'var(--bg-color)',
                            border: '1px solid var(--text-primary)',
                          }
                        : {
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                          }
                    }
                  >
                    Ẩn danh tuyệt đối
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportType('identified')}
                    className="py-2 px-3 text-[10px] font-sans font-bold uppercase tracking-normal rounded-lg text-center transition-all animate-none"
                    style={
                      reportType === 'identified'
                        ? {
                            backgroundColor: 'var(--text-primary)',
                            color: 'var(--bg-color)',
                            border: '1px solid var(--text-primary)',
                          }
                        : {
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                          }
                    }
                  >
                    Công khai định danh
                  </button>
                </div>
              </div>

              {/* Subject Input */}
              <div>
                <label
                  className="block text-[8px] font-sans font-extrabold uppercase tracking-wide mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ĐƠN VỊ / CÁ NHÂN BỊ PHẢN ÁNH
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Nhập tên cơ quan, đơn vị hoặc chức danh sai phạm..."
                  className="w-full text-xs p-3 rounded-lg focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-paper)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Text Area Content */}
              <div>
                <label
                  className="block text-[8px] font-sans font-extrabold uppercase tracking-wide mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  TÓM TẮT HÀNH VI TIÊU CỰC
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Mô tả cụ thể hành vi nhũng nhiễu, cửa quyền hoặc lợi dụng chức vụ..."
                  rows={3}
                  required
                  className="w-full text-xs p-3 rounded-lg focus:outline-none resize-none"
                  style={{
                    backgroundColor: 'var(--bg-paper)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Interactive Upload Box */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
              />
              <div
                onClick={handleUploadClick}
                className="rounded-lg p-3.5 text-center cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 relative"
                style={{
                  border: uploadedFile ? '1px solid color-mix(in srgb, var(--accent-color) 50%, transparent)' : '1px dashed var(--border-color)',
                  backgroundColor: uploadedFile ? 'color-mix(in srgb, var(--accent-color) 4%, var(--bg-paper))' : 'var(--bg-paper)',
                }}
              >
                {uploadedFile ? (
                  <div className="flex items-center justify-between text-xs font-serif-body">
                    <div className="flex items-center gap-2 truncate">
                      <div className="p-1.5 bg-red-500/10 text-red-500 rounded-md">
                        <Upload size={12} />
                      </div>
                      <div className="text-left truncate">
                        <p className="font-bold text-[10px] uppercase font-sans tracking-wide text-slate-800 dark:text-slate-200 truncate">{uploadedFile.name}</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={14} className="mx-auto mb-1 text-red-500 animate-pulse" />
                    <span
                      className="text-[9px] font-sans font-bold uppercase tracking-normal"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Tải lên chứng cứ tài liệu (Ảnh, PDF)
                    </span>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitted}
                className="w-full py-2.5 text-white rounded-lg font-sans font-extrabold text-[10px] uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                style={{
                  backgroundColor: 'var(--accent-color)',
                  borderRadius: 'var(--radius-btn)',
                }}
              >
                <Send size={12} /> {submitted ? 'ĐANG GỬI TIN AN TOÀN...' : 'GỬI BÁO CÁO PHÒNG CHỐNG THAM NHŨNG'}
              </button>
            </form>

            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col p-6 z-20 justify-between overflow-y-auto"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.96)',
                    borderRadius: 'var(--radius-card)',
                  }}
                >
                  {transmissionStage === 1 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
                      <RefreshCw className="animate-spin text-[#DA251D] mb-4" size={32} />
                      <h4 className="text-[#DA251D] font-sans font-black text-xs uppercase tracking-widest mb-4">
                        ĐANG TRUYỀN DỮ LIỆU BẢO MẬT
                      </h4>
                      <div className="w-full max-w-xs bg-black/40 rounded-lg p-4 font-mono text-[9px] text-left text-emerald-450 space-y-2 border border-emerald-500/10">
                        {transmissionLogs.map((log, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="truncate"
                          >
                            {log}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-between h-full pt-4">
                      <div className="flex flex-col items-center text-center">
                        <ShieldCheck size={40} className="text-emerald-500 mb-3 animate-bounce" />
                        <h4 className="text-emerald-400 font-sans font-black text-sm uppercase tracking-wider mb-2">
                          GỬI BÁO CÁO THÀNH CÔNG (GIẢ LẬP)
                        </h4>
                        
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-[10px] font-serif-body text-slate-300 leading-relaxed text-justify space-y-2.5 max-w-sm mt-2">
                          <p>
                            🔒 <strong>Mục đích giáo dục:</strong> Biểu mẫu này giả lập các lớp bảo mật nâng cao (như mã hóa bất đối xứng AES-256 và hủy nhật ký truy cập thiết bị) để bảo vệ tuyệt đối danh tính người phản ánh trước pháp luật.
                          </p>
                          <p>
                            ⚖️ <strong>Quyền lợi bảo vệ:</strong> Trong thực tế, khi bạn tố giác qua các cổng chính thống của Nhà nước, danh tính của bạn sẽ được giữ bí mật hoàn toàn theo pháp luật về Phòng, chống tham nhũng.
                          </p>
                          <p>
                            🛡️ <strong>Bảo mật thông tin:</strong> Do đây là tài liệu học tập, nội dung bạn nhập chỉ chạy cục bộ và <strong>KHÔNG hề được lưu trữ hay gửi đi bất kỳ đâu</strong>.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-sans font-extrabold text-[10px] uppercase tracking-wide transition-colors cursor-pointer shadow-md"
                      >
                        QUAY LẠI TRANG GỬI TIN
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Sơ đồ quy trình */}
      <div className="max-w-md mx-auto mt-8 flex flex-col items-center">
        <div 
          onClick={() => showImage('/images/anti-corruption/whistleblowing.png', 'Sơ đồ quy trình tiếp nhận tin tố cáo')}
          className="w-full relative overflow-hidden flex items-center justify-center cursor-zoom-in group"
          style={{
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-paper)',
          }}
        >
          <img 
            src="/images/anti-corruption/whistleblowing.png" 
            alt="Quy trình tiếp nhận" 
            className="w-full h-auto block opacity-90 transition-transform duration-500 group-hover:scale-[1.01]" 
          />
        </div>
        <span
          className="text-[10px] font-serif-body italic mt-2 text-center"
          style={{ color: 'var(--text-secondary)' }}
        >
          — Sơ đồ Bảo mật Thông tin Tiếp nhận Tố cáo (Click để xem toàn màn hình) —
        </span>
      </div>
    </div>
  );
}
