'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, X, Send, Minimize2, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Xin chào đồng chí! Tôi là **Trợ lý Trí tuệ Nhân tạo chuyên trách giai đoạn 1975 - 1986**. Đồng chí cần tìm hiểu hay làm rõ nội dung lý thuyết, lịch sử nào trong giai đoạn kiến thiết & bảo vệ Tổ quốc này?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
        let errorMsg = 'Có lỗi xảy ra khi kết nối đài phát đài.';
        if (data && data.error) {
          if (typeof data.error === 'object') {
            errorMsg = data.error.message || JSON.stringify(data.error);
          } else if (typeof data.error === 'string') {
            try {
              // Sometimes error is a JSON string
              const parsed = JSON.parse(data.error);
              errorMsg = parsed.error?.message || parsed.message || data.error;
            } catch (e) {
              errorMsg = data.error;
            }
          }
        }
        setMessages(prev => [...prev, { 
          role: 'model', 
          content: `Rất tiếc, hệ thống AI đang quá tải hoặc gặp sự cố đường truyền: **${errorMsg}**. Xin đồng chí vui lòng thử lại sau vài giây.` 
        }]);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMsg = error.message || 'Lỗi không xác định';
      try {
        if (errorMsg.startsWith('{')) {
          const parsed = JSON.parse(errorMsg);
          errorMsg = parsed.error?.message || parsed.message || errorMsg;
        }
      } catch (e) {}
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `Rất tiếc, đường truyền tín hiệu đang gặp sự cố: ${errorMsg}. Xin đồng chí liên lạc lại sau.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="chat-bot-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 text-white rounded-full flex items-center justify-center transition-all z-50 group cursor-pointer"
            style={{
              backgroundColor: 'var(--accent-color)',
              boxShadow: 'var(--shadow-card)',
              border: '2px solid var(--accent-color)',
            }}
          >
            <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
            
            <span
              className="absolute -top-12 right-0 px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-card)',
                border: '1px solid var(--border-color)',
              }}
            >
              Cố vấn AI
              <div
                className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRight: '1px solid var(--border-color)',
                  borderBottom: '1px solid var(--border-color)',
                }}
              ></div>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[90vw] sm:w-[380px] h-[550px] rounded-xl flex flex-col z-50 overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Header */}
            <div
              className="p-4 flex justify-between items-center"
              style={{
                backgroundColor: 'var(--accent-color)',
                borderBottom: '1px solid var(--border-color)',
                color: '#ffffff',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Bot className="w-5 h-5 animate-pulse text-white" />
                </div>
                <div>
                  <h3 className="font-serif-heading font-black text-sm text-white">Trợ Lý Lịch Sử AI</h3>
                  <span className="text-[9px] font-sans font-bold text-emerald-300 block -mt-0.5">Trực tuyến</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-1.5 rounded-lg transition-colors text-white/80 hover:text-white cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-1.5 rounded-lg transition-colors text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ backgroundColor: 'var(--bg-color)' }}
            >
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 text-xs md:text-sm ${
                      message.role === 'user' 
                        ? 'text-white rounded-xl rounded-tr-none' 
                        : 'rounded-xl rounded-tl-none'
                    }`}
                    style={
                      message.role === 'user'
                        ? {
                            backgroundColor: 'var(--accent-color)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          }
                        : {
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          }
                    }
                  >
                    {message.role === 'model' ? (
                      <div
                        className="prose prose-sm font-serif-body prose-p:leading-normal prose-li:my-0 max-w-none prose-strong:text-red-500"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="font-sans whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="p-3 rounded-xl rounded-tl-none"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-color)' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s]" style={{ backgroundColor: 'var(--accent-color)' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s]" style={{ backgroundColor: 'var(--accent-color)' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              className="p-3"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Nhập câu hỏi tại đây..."
                  className="flex-1 rounded-lg p-2 text-xs md:text-sm focus:outline-none focus:ring-1"
                  style={{
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    '--tw-ring-color': 'var(--accent-color)',
                  } as React.CSSProperties}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="text-white p-2 rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--accent-color)',
                    border: '1px solid var(--accent-color)',
                  }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
