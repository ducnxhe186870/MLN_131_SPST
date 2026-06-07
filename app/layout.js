import './globals.css'
import Navbar from './components/Navbar'
import ThemeProvider from './components/ThemeProvider'
import MainContent from './components/MainContent'
import ChatBot from '@/components/AIChatbot'

export const metadata = {
  title: 'Nhà nước Pháp quyền Xã hội Chủ nghĩa Việt Nam | 1975 - 1981',
  description: 'Giai đoạn Đảng lãnh đạo cả nước xây dựng chủ nghĩa xã hội và bảo vệ Tổ quốc',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <ThemeProvider>
          <Navbar />
          <MainContent>{children}</MainContent>
          <ChatBot />
        </ThemeProvider>
      </body>
    </html>
  )
}
