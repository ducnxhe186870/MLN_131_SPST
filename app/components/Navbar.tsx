"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";

const ROUTES = {
  HOME: "/",
  NOIDUNG: "/noi-dung-chinh",
  ONTAP: "/on-tap-quiz",
  QUIZ_JOIN: "/quiz",
  GAME: "/game",
  THANHVIEN: "/thanh-vien"
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isDarkMode, toggleTheme } = useTheme();

  const links = [
    { name: "Trang chủ", path: ROUTES.HOME },
    { name: "Chuyên đề PCTN", path: ROUTES.NOIDUNG },
    { name: "Hồ sơ Đại án", path: ROUTES.ONTAP },
    { name: "Thi Quiz", path: ROUTES.QUIZ_JOIN },
    { name: "Trò chơi", path: ROUTES.GAME },
    { name: "Thành viên", path: ROUTES.THANHVIEN }
  ];

  const [logoClicks, setLogoClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleLogoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastClickTime > 2000) {
      setLogoClicks(1);
    } else {
      const nextClicks = logoClicks + 1;
      if (nextClicks >= 5) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("trigger-dev-secret"));
        setLogoClicks(0);
      } else {
        setLogoClicks(nextClicks);
      }
    }
    setLastClickTime(now);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full">
      {/* Top Accent Strip */}
      <div className="h-1 w-full bg-[var(--accent-color)]" />
      
      {/* Main Nav Bar */}
      <nav 
        className="border-b transition-colors duration-300"
        style={{ 
          backgroundColor: isDarkMode ? 'rgba(12,15,26,0.97)' : 'rgba(248,247,244,0.97)',
          borderColor: 'var(--border-color)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between px-6">
          
          {/* Logo */}
          <Link href="/" onClick={handleLogoClick} className="flex items-center gap-3 group">
            {/* Emblem */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-xs"
              style={{ background: 'var(--accent-color)' }}
            >
              PQ
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm leading-none" style={{ color: 'var(--text-primary)' }}>
                Pháp Quyền <span style={{ color: 'var(--accent-color)' }}>Việt Nam</span>
              </span>
              <span className="text-[9px] font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Nghiên cứu học thuật chính trị
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className="relative px-3 py-2 text-[11.5px] font-semibold transition-all duration-200"
                  style={{
                    color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                    borderBottom: isActive ? '2px solid var(--accent-color)' : '2px solid transparent',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-200"
              style={{ 
                background: isDarkMode ? 'var(--bg-card)' : 'var(--border-color)',
                color: isDarkMode ? '#FBBF24' : 'var(--text-secondary)'
              }}
              title={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Flag Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold"
              style={{ 
                background: isDarkMode ? 'var(--bg-card)' : '#FEF2F2',
                color: 'var(--accent-color)',
                border: '1px solid var(--border-color)'
              }}
            >
              <span className="text-[8px]">🇻🇳</span>
              VIỆT NAM
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ 
                background: isDarkMode ? 'var(--bg-card)' : 'var(--border-color)',
                color: isDarkMode ? '#FBBF24' : 'var(--text-secondary)'
              }}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
            style={{ 
              backgroundColor: isDarkMode ? 'var(--bg-paper)' : 'var(--bg-paper)',
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            <div className="px-4 py-2">
              {links.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2.5 text-[13px] font-semibold transition-colors rounded-lg"
                    style={{
                      color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'var(--accent-glow)' : 'transparent',
                    }}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
