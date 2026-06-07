"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Gavel, Scale, AlertTriangle, RefreshCw, X, Fingerprint, FileText, Trophy, Star, Eye, ExternalLink, Bookmark } from "lucide-react";
import { useTheme } from "../../components/ThemeProvider";

const RAINBOW_COLORS = [
  "#8B1E1E", "#3A4F3B", "#D4AF37", "#4A6B82", "#A25A38", "#6D4C41", "#37474F", "#B71C1C", "#2E7D32", "#F57F17", "#0D47A1", "#4E342E", "#D4AF37"
];

const WHEEL_ITEMS = [
  {
    title: "Tham ô tài sản",
    law: "Điều 353",
    law_source: "Bộ luật Hình sự 2015",
    desc: "Hành vi lợi dụng chức vụ, quyền hạn để chiếm đoạt tài sản mà mình có trách nhiệm quản lý. Đây là sự phản bội trực tiếp lòng tin và trách nhiệm được Nhà nước giao phó.",
    signs: "Tự ý trích lập quỹ riêng, ký khống giấy tờ để rút tiền từ ngân sách do mình quản lý.",
    penalty: "Phạt tù từ 02 năm đến Tử hình.",
    link: "https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Van-ban-hop-nhat-01-VBHN-VPQH-2017-Bo-luat-Hinh-su-359050.aspx?anchor=dieu_353",
    image: "/images/wheel/tham-o.jpg"
  },
  {
    title: "Nhận hối lộ",
    law: "Điều 354",
    law_source: "Bộ luật Hình sự 2015",
    desc: "Lợi dụng chức vụ trực tiếp hoặc qua trung gian nhận tiền, tài sản hoặc lợi ích khác để làm hoặc không làm một việc vì lợi ích của người đưa hối lộ.",
    signs: "Những 'phong bì' ngầm, những món quà đắt tiền đổi lấy sự ưu tiên hoặc lờ đi sai phạm.",
    penalty: "Phạt tù từ 02 năm đến Tử hình.",
    link: "https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Van-ban-hop-nhat-01-VBHN-VPQH-2017-Bo-luat-Hinh-su-359050.aspx?anchor=dieu_354",
    image: "/images/wheel/nhan-hoi-lo.jpg"
  },
  {
    title: "Lạm dụng chức vụ chiếm đoạt",
    law: "Điều 355",
    law_source: "Bộ luật Hình sự 2015",
    desc: "Dùng địa vị, uy tín để lừa dối, uy hiếp khiến người khác sợ hãi hoặc tin tưởng mà giao tài sản cho mình (tài sản không do mình quản lý trực tiếp).",
    signs: "Dùng chức danh để 'mượn' tài sản doanh nghiệp nhưng không trả, ép cấp dưới đóng góp trái quy định.",
    penalty: "Phạt tù từ 06 năm đến Tù chung thân.",
    link: "https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Van-ban-hop-nhat-01-VBHN-VPQH-2017-Bo-luat-Hinh-su-359050.aspx?anchor=dieu_355",
    image: "/images/wheel/lam-dung-chiem-doat.jpg"
  },
  {
    title: "Lợi dụng chức vụ khi thi hành công vụ",
    law: "Điều 356",
    law_source: "Bộ luật Hình sự 2015",
    desc: "Vì vụ lợi hoặc động cơ cá nhân mà làm trái công vụ gây thiệt hại cho lợi ích Nhà nước, tổ chức hoặc cá nhân.",
    signs: "Ưu tiên người thân trong đấu thầu, ký duyệt dự án sai quy trình vì lợi ích nhóm.",
    penalty: "Phạt cải tạo không giam giữ đến 03 năm hoặc tù từ 01 - 15 năm.",
    link: "https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Van-ban-hop-nhat-01-VBHN-VPQH-2017-Bo-luat-Hinh-su-359050.aspx?anchor=dieu_356",
    image: "/images/wheel/loi-dung-cong-vu.jpg"
  },
  {
    title: "Lạm quyền khi thi hành công vụ",
    law: "Điều 357",
    law_source: "Bộ luật Hình sự 2015",
    desc: "Vì vụ lợi mà vượt quá thẩm quyền của mình, thực hiện những việc không thuộc thẩm quyền được giao gây thiệt hại lớn.",
    signs: "Cấp dưới tự ý ký thay cấp trên, can thiệp trái phép vào việc điều hành của cơ quan khác.",
    penalty: "Phạt tù từ 01 năm đến 20 năm.",
    link: "https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Van-ban-hop-nhat-01-VBHN-VPQH-2017-Bo-luat-Hinh-su-359050.aspx?anchor=dieu_357",
    image: "/images/wheel/lam-quyen.jpg"
  },
  {
    title: "Lợi dụng chức vụ gây ảnh hưởng",
    law: "Điều 358",
    law_source: "Bộ luật Hình sự 2015",
    desc: "Dùng sức mạnh vị trí công tác để tác động, ép người có chức vụ khác giải quyết việc có lợi cho mình hoặc người thân.",
    signs: "Tác động kết quả thanh tra, gọi điện can thiệp quy trình hành chính ở cơ quan khác.",
    penalty: "Phạt tù từ 01 năm đến Tù chung thân.",
    link: "https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Van-ban-hop-nhat-01-VBHN-VPQH-2017-Bo-luat-Hinh-su-359050.aspx?anchor=dieu_358",
    image: "/images/wheel/gay-anh-huong.jpg"
  },
  {
    title: "Giả mạo trong công tác",
    law: "Điều 359",
    law_source: "Bộ luật Hình sự 2015",
    desc: "Vì vụ lợi mà sửa chữa, làm sai lệch nội dung giấy tờ; lập giấy tờ giả hoặc giả mạo chữ ký người có thẩm quyền.",
    signs: "Sửa báo cáo tài chính, làm giả bằng cấp hoặc giấy tờ đất đai chính thống.",
    penalty: "Phạt tù từ 01 năm đến 20 năm.",
    link: "https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Van-ban-hop-nhat-01-VBHN-VPQH-2017-Bo-luat-Hinh-su-359050.aspx?anchor=dieu_359",
    image: "/images/wheel/gia-mao-cong-tac.jpg"
  },
  {
    title: "Đưa & Môi giới hối lộ",
    law: "Điều 364 & 365",
    law_source: "Bộ luật Hình sự 2015",
    desc: "Dùng lợi ích mua chuộc người có chức vụ hoặc làm trung gian kết nối các giao dịch tham nhũng (thực hiện bởi người có chức vụ).",
    signs: "Sử dụng ngân sách 'ngoại giao' bất chính, sắp xếp các cuộc gặp gỡ ngầm trục lợi.",
    penalty: "Cải tạo không giam giữ đến 03 năm hoặc tù đến 20 năm.",
    link: "https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Van-ban-hop-nhat-01-VBHN-VPQH-2017-Bo-luat-Hinh-su-359050.aspx?anchor=dieu_364",
    image: "/images/wheel/moi-gioi-hoi-lo.jpg"
  },
  {
    title: "Sử dụng trái phép tài sản công",
    law: "Điều 366",
    law_source: "Bộ luật Hình sự 2015",
    desc: "Dùng tài sản Nhà nước (xe, nhà đất...) vào mục đích cá nhân hoặc kinh doanh trái phép mà không được phép.",
    signs: "Dùng xe công đi lễ chùa, dùng trụ sở cơ quan cho thuê lấy tiền riêng cho cá nhân.",
    penalty: "Phạt tiền đến 100 triệu đồng hoặc tù đến 07 năm.",
    link: "https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Van-ban-hop-nhat-01-VBHN-VPQH-2017-Bo-luat-Hinh-su-359050.aspx?anchor=dieu_366",
    image: "/images/wheel/su-dung-tai-san-cong.jpg"
  },
  {
    title: "Nhũng nhiễu vì vụ lợi",
    law: "Điều 2 Luật PCTN",
    law_source: "Luật PCTN 2018",
    desc: "Hành vi cửa quyền, hạch sách, gây khó khăn phiền hà cho dân và doanh nghiệp nhằm gợi ý 'lót tay'.",
    signs: "Hồ sơ đủ nhưng bị ngâm không lý do, thái độ hách dịch khi tiếp nhận yêu cầu hành chính.",
    penalty: "Kỷ luật cách chức hoặc xử lý hình sự (tù đến 15 năm).",
    link: "https://thuvienphapluat.vn/phap-luat/ho-tro-phap-luat/nhung-nhieu-la-gi-hanh-vi-nhung-nhieu-vi-vu-loi-co-phai-la-hanh-vi-tham-nhung-trong-khu-vuc-nha-nuo-932816-82766.html",
    image: "/images/wheel/nhung-nhieu.jpg"
  },
  {
    title: "Không thực hiện nhiệm vụ",
    law: "Điều 360 BLHS",
    law_source: "Bộ luật Hình sự 2015",
    desc: "Cố ý bỏ mặc hoặc không làm đúng trách nhiệm được giao để đạt được lợi ích cá nhân hoặc lợi ích nhóm.",
    signs: "Lờ đi sai phạm của doanh nghiệp quen biết, không kiểm tra công trình có dấu hiệu xuống cấp.",
    penalty: "Cải tạo không giam giữ đến 03 năm hoặc tù đến 12 năm.",
    link: "https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Van-ban-hop-nhat-01-VBHN-VPQH-2017-Bo-luat-Hinh-su-359050.aspx?anchor=dieu_360",
    image: "/images/wheel/khong-thuc-hien-nhiem-vu.jpg"
  },
  {
    title: "Bao che & Cản trở điều tra",
    law: "Điều 389 BLHS",
    law_source: "Bộ luật Hình sự 2015",
    desc: "Dùng quyền lực che giấu tội phạm, làm sai lệch hồ sơ hoặc gây khó khăn cho thanh tra để bảo vệ đồng phạm.",
    signs: "Tiêu hủy chứng cứ, đe dọa người tố cáo hoặc can thiệp quá trình lấy lời khai.",
    penalty: "Phạt tù từ 06 tháng đến 07 năm.",
    link: "https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Van-ban-hop-nhat-01-VBHN-VPQH-2017-Bo-luat-Hinh-su-359050.aspx?anchor=dieu_389",
    image: "/images/wheel/bao-che.jpg"
  },
  {
    title: "TRONG SẠCH",
    law: "Quy định 144-QD/TW",
    law_source: "Chuẩn mực đạo đức",
    desc: "Lựa chọn con đường chính trực, đặt lợi ích tập thể lên trên cá nhân. Đây là nền tảng của danh dự người cán bộ.",
    signs: "Minh bạch trong công tác, tận tụy phục vụ nhân dân, từ chối mọi hình thức quà cáp vụ lợi.",
    penalty: "Vinh danh & Khen thưởng từ Đảng và Nhà nước.",
    link: "https://thuvienphapluat.vn/van-ban/Xay-dung-Dang/Quy-dinh-144-QD-TW-2024-chuan-muc-dao-duc-cach-mang-cua-can-bo-dang-vien-611100.aspx",
    image: "/images/wheel/trong-sach.jpg.png"
  }
].map((item, idx) => ({ ...item, color: RAINBOW_COLORS[idx % RAINBOW_COLORS.length] }));

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[150] overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <motion.div
           key={i}
           initial={{ top: -20, left: `${Math.random() * 100}%`, rotate: 0 }}
           animate={{ 
             top: "120%", 
             left: `${Math.random() * 100}%`, 
             rotate: 360,
           }}
           transition={{ 
             duration: 2 + Math.random() * 2, 
             repeat: Infinity, 
             delay: Math.random() * 2,
             ease: "linear"
           }}
           className="absolute w-2 h-2 opacity-80"
           style={{ 
             backgroundColor: ["#f4d03f", "#3369e8", "#d50f25", "#009925"][Math.floor(Math.random() * 4)],
             borderRadius: Math.random() > 0.5 ? "50%" : "0%"
           }}
        />
      ))}
    </div>
  );
}

// Helper to split text into lines
const splitTextIntoLines = (text: string, maxCharsPerLine: number = 18) => {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  lines.push(currentLine);
  return lines;
};

export default function CorruptionWheel() {
  const { isDarkMode } = useTheme();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<typeof WHEEL_ITEMS[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Disable body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setIsModalOpen(false);
    
    // Deceleration factor: more rotations = smoother stop
    const spinCount = 12 + Math.random() * 8; 
    const extraDegree = Math.floor(Math.random() * 360);
    const totalRotation = rotation + (spinCount * 360) + extraDegree;
    
    setRotation(totalRotation);
    
    const sliceAngle = 360 / WHEEL_ITEMS.length;
    const actualRotation = totalRotation % 360;
    const index = Math.floor((360 - actualRotation) / sliceAngle) % WHEEL_ITEMS.length;
    
    setTimeout(() => {
      setIsSpinning(false);
      setResult(WHEEL_ITEMS[index]);
      setIsModalOpen(true);
    }, 8000); 
  };

  const sliceAngle = 360 / WHEEL_ITEMS.length;

  return (
    <div className="flex flex-col items-center gap-12 py-12 relative overflow-visible">
      
      {/* ── THE WHEEL (WHEEL OF NAMES STYLE) ── */}
      <div className="relative w-full max-w-[700px] aspect-square flex items-center justify-center p-2">
        
        {/* Pointer (The "Clicker") - Now Static */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-[60] translate-x-3">
          <div 
            className="w-10 h-10 drop-shadow-xl"
            style={{ 
              clipPath: "polygon(0 50%, 100% 0, 100% 100%)",
              background: "#ffffff",
              border: "2px solid #ccc"
            }}
          >
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#DA251D]" />
          </div>
        </div>

        {/* Outer Rim Ring */}
        <div className={`absolute inset-0 rounded-full border-[8px] z-50 transition-colors ${
          isDarkMode ? 'border-[#333]' : 'border-white'
        } shadow-[0_10px_30px_rgba(0,0,0,0.2)]`} />

        {/* The SVG Wheel */}
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full relative z-30"
          animate={{ rotate: rotation }}
          transition={{ duration: 8, ease: [0.1, 0, 0, 1] }}
        >
          {WHEEL_ITEMS.map((item, i) => {
            const startAngle = i * sliceAngle;
            const endAngle = (i + 1) * sliceAngle;
            const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
            const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
            const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
            const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
            
            const path = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
            const textLines = splitTextIntoLines(item.title, 14); 
            const lineSpacing = 3.2; 
            
            return (
              <g key={i}>
                <path
                  d={path}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="0.4"
                />
                <g transform={`rotate(${startAngle + sliceAngle / 2}, 50, 50)`}>
                  <text
                    x="94"
                    y={50 - ((textLines.length - 1) * lineSpacing) / 2}
                    fill="white"
                    fontSize="2.6"
                    fontWeight="900"
                    textAnchor="end"
                    alignmentBaseline="middle"
                    className="select-none uppercase tracking-tighter"
                    style={{ 
                      fontFamily: "'Playfair Display', serif"
                    }}
                  >
                    {textLines.map((line, lineIdx) => (
                      <tspan
                        key={lineIdx}
                        x="94"
                        dy={lineIdx === 0 ? 0 : lineSpacing}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              </g>
            );
          })}
        </motion.svg>

        {/* Center Control Button */}
        <div className="absolute z-[70] flex items-center justify-center">
           <motion.button
            onClick={spin}
            disabled={isSpinning}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-14 h-14 rounded-full flex items-center justify-center font-black transition-all shadow-2xl border-[3px] text-white overflow-hidden ${
              isSpinning ? 'opacity-80' : 'cursor-pointer'
            } ${isDarkMode ? 'bg-[#000] border-[#DA251D]' : 'bg-white border-[#2C2A29] !text-[#2C2A29]'}`}
          >
            {isSpinning ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <div className="flex flex-col items-center">
                 <span className="text-[10px] tracking-widest font-serif-heading">SPIN</span>
              </div>
            )}
          </motion.button>
        </div>
      </div>

      <div className="text-center">
         <p className={`font-serif-heading font-black text-sm uppercase tracking-widest opacity-40 transition-colors ${
           isDarkMode ? 'text-white' : 'text-black'
         }`}>Bấm vào giữa để bắt đầu quay</p>
      </div>

      {/* ── CELEBRATION MODAL (Highly Responsive & Optimized for height) ── */}
      <AnimatePresence>
        {isModalOpen && result && (
          <div className="fixed top-[80px] bottom-0 left-0 right-0 z-[9999] flex items-center justify-center p-3 sm:p-6 lg:p-10">
            <Confetti />
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 30, opacity: 0 }}
              className={`relative w-full max-w-7xl max-h-[calc(100vh-120px)] flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden border-2 transition-colors duration-500 ${
                isDarkMode ? 'bg-[#0A0A0A] border-[#DA251D]/40' : 'bg-[#FAF3EB] border-white'
              } shadow-2xl`}
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-[210] w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-[#DA251D] transition-colors border border-white/10"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col lg:grid lg:grid-cols-5 h-full overflow-y-auto lg:overflow-visible">
                {/* Visual Side */}
                <div className="lg:col-span-2 relative min-h-[220px] lg:h-full flex items-center justify-center bg-black/10">
                  <motion.div 
                    initial={{ scale: 1.15, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="relative w-full h-full lg:aspect-auto overflow-hidden group"
                  >
                    <Image 
                      src={result.image} 
                      alt={result.title} 
                      fill 
                      className={`object-contain transition-transform duration-10000 group-hover:scale-105 ${isDarkMode ? 'brightness-75' : 'brightness-95'}`}
                    />
                    {/* Artistic Paper Texture Overlay */}
                    <div 
                      className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
                      style={{ 
                        backgroundImage: "url('https://www.transparenttextures.com/patterns/old-map.png')",
                        filter: "contrast(150%) brightness(120%)"
                      }}
                    />
                    {/* Vignette & Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 opacity-60" />
                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
                  </motion.div>
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 animate-pulse z-10">
                     <Trophy className="text-[#DA251D] drop-shadow-[0_0_10px_rgba(218,37,29,0.5)]" size={32} strokeWidth={3} />
                  </div>
                </div>

                {/* Content Side */}
                <div className="lg:col-span-3 p-6 sm:p-8 lg:p-10 flex flex-col h-full overflow-y-auto">
                    <div className="mb-4 sm:mb-6">
                       <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="bg-[#DA251D] text-white px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase tracking-tighter inline-block shadow-lg">
                            GIÁM ĐỊNH HÀNH VI
                          </span>
                          <span className={`${isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black/60'} px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-tighter flex items-center gap-1`}>
                            <Bookmark size={10} /> {result.law_source}
                          </span>
                       </div>
                       <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif-heading font-black leading-tight uppercase tracking-tighter transition-colors">
                         Chúc mừng bạn đã quay vào ô <span className="text-[#DA251D]">{result.title}</span> 
                         <span className="block sm:inline-block ml-0 sm:ml-2 text-sm md:text-lg opacity-70 tracking-normal font-serif-body normal-case">
                           ({result.law})
                         </span>
                       </h2>
                       <div className="w-12 h-1 bg-[#DA251D] mt-2 rounded-full" />
                    </div>

                    <div className="space-y-4 sm:space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                      {/* Description */}
                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5 shadow-inner">
                        <div className="flex items-center gap-2 mb-2 opacity-50">
                           <FileText size={12} className="shrink-0" />
                           <p className="text-[9px] font-black uppercase tracking-[0.1em] font-serif-body m-0 leading-none">Mô tả hành vi:</p>
                        </div>
                        <p className="text-sm sm:text-base font-serif-body italic leading-relaxed text-justify m-0 opacity-80 decoration-[#DA251D]/20">
                          {result.desc}
                        </p>
                      </div>

                      {/* Signs */}
                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5 shadow-inner">
                        <div className="flex items-center gap-2 mb-2 opacity-50">
                           <Eye size={12} className="shrink-0" />
                           <p className="text-[9px] font-black uppercase tracking-[0.1em] font-serif-body m-0 leading-none">Dấu hiệu nhận biết:</p>
                        </div>
                        <p className="text-sm sm:text-base font-serif-body leading-relaxed text-justify m-0">
                          {result.signs}
                        </p>
                      </div>

                      {/* Penalty */}
                      <div className={`p-5 sm:p-6 border-l-[4px] rounded-r-xl border-[#DA251D] transition-colors ${
                        isDarkMode ? 'bg-[#151515]/80' : 'bg-white shadow-xl'
                      }`}>
                         <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-[#DA251D]">
                               <Scale size={14} className="shrink-0" />
                               <p className="text-[9px] font-black uppercase tracking-[0.1em] font-serif-body m-0 leading-none">Căn cứ pháp lý & Hình phạt:</p>
                            </div>
                            <a 
                              href={result.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[8px] font-black uppercase text-[#DA251D] hover:underline bg-[#DA251D]/5 px-2 py-1 rounded"
                            >
                              Chi tiết luật <ExternalLink size={10} />
                            </a>
                         </div>
                         <p className="font-serif-body font-bold text-sm sm:text-base leading-relaxed m-0 text-[#DA251D]">
                          {result.penalty}
                         </p>
                      </div>
                    </div>
                    
                    {/* Footer Info Area */}
                    <div className="pt-6 flex flex-wrap gap-4 items-center justify-between border-t border-black/5 dark:border-white/10">
                       <div className="flex items-center gap-2.5 opacity-30">
                          <Fingerprint size={24} />
                          <div className="flex flex-col">
                             <span className="text-[7px] font-black uppercase">Case ID: 131-PC</span>
                             <span className="text-[7px] font-mono">2026_X_VERIFY</span>
                          </div>
                       </div>
                       <button 
                          onClick={() => setIsModalOpen(false)}
                          className="bg-[#8B1E1E] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 group flex items-center gap-2"
                       >
                          QUAY TIẾP
                       </button>
                    </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
