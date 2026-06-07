"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { X, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
  showImage: (src, alt) => {},
  closeImage: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const showImage = (src, alt = "") => {
    setLightboxImage({ src, alt });
  };

  const closeImage = () => {
    setLightboxImage(null);
  };

  // Sync with body class for global styling
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Handle ESC key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, showImage, closeImage }}>
      {children}
      
      {/* Global Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImage}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-zoom-out"
          >
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeImage();
              }}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shadow-lg hover:scale-105 cursor-pointer z-[10000]"
            >
              <X size={24} />
            </button>

            {/* Main content container */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative max-w-[95vw] max-h-[80vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Zoom badge indicator */}
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/10 pointer-events-none">
                <ZoomIn size={12} /> Tỉ lệ ảnh gốc
              </div>

              {/* The image itself (forced object-contain to display full image without crop) */}
              <img
                src={lightboxImage.src}
                alt={lightboxImage.alt || "Tư liệu phóng đại"}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/5 pointer-events-auto cursor-default"
              />
            </motion.div>

            {/* Caption bottom bar */}
            {lightboxImage.alt && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 max-w-xl text-center px-4"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="font-serif-body text-sm text-slate-300 leading-relaxed italic">
                  — {lightboxImage.alt} —
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}
