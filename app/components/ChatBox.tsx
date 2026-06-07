'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from "next/image";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }] }),
      });

      const data = await response.json();
      
      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#A61F2B] text-white w-14 h-14 rounded-full shadow-lg hover:bg-[#8B1923] transition-colors duration-200 flex items-center justify-center"
          aria-label="Mở trợ lý học tập"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-lg shadow-xl w-[380px] h-[560px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header - Cập nhật tiêu đề */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5] bg-white">
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-[#1C1C1C] uppercase tracking-tight">
                Trợ lý Lý luận Chính trị
              </h3>
              <span className="text-[10px] text-[#A61F2B] font-medium uppercase tracking-widest">Hỗ trợ 24/7</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#585858] hover:text-[#A61F2B] transition-colors"
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages - Cập nhật nội dung chào mừng */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50/30">
            {messages.length === 0 && (
              <div className="text-center text-[#585858] text-sm mt-8 space-y-2">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <Image
                    src="/image.png" 
                    alt="AI Assistant"
                    fill
                    className="rounded-full object-cover border-2 border-[#A61F2B]/20 p-1 bg-white shadow-sm"
                  />
                </div>
                <p className="font-semibold text-black">Chào mừng bạn!</p>
                <p className="px-4 text-xs leading-relaxed">
                  Tôi có thể giúp bạn tìm hiểu về <strong>Thời kỳ quá độ lên CNXH</strong> và <strong>Bản chất của Dân chủ xã hội chủ nghĩa</strong>.
                </p>
                <div className="pt-4 flex flex-wrap gap-2 justify-center">
                   <button 
                    onClick={() => setInput("Bỏ qua chế độ TBCN là gì?")}
                    className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-full hover:border-[#A61F2B] transition-colors"
                   >
                     "Bỏ qua chế độ TBCN là gì?"
                   </button>
                </div>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#A61F2B] text-white rounded-tr-none'
                      : 'bg-white border border-gray-200 text-[#1C1C1C] rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="prose prose-sm max-w-full">
                  <ReactMarkdown >
                  {msg.content}
                  </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl rounded-tl-none text-xs text-[#585858] flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce [animation-delay:0.2s]">.</span>
                    <span className="animate-bounce [animation-delay:0.4s]">.</span>
                  </span>
                  Đang phân tích dữ liệu...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-[#E5E5E5] px-4 py-4 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi về CNXH, Dân chủ..."
                className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#A61F2B] transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#A61F2B] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#8B1923] transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}