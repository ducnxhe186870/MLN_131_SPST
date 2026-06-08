# Đề Tài Nghiên Cứu Lịch Sử & Pháp Luật Việt Nam (Giai Đoạn 1975 - 1981)

Dự án nghiên cứu học thuật chính trị về chủ đề: **"Nhà nước Pháp quyền Xã hội Chủ nghĩa Việt Nam | 1975 - 1981"** (Giai đoạn Đảng lãnh đạo cả nước xây dựng chủ nghĩa xã hội và bảo vệ Tổ quốc).

---

## 👤 Thông Tin Phát Triển (Developer)

* **Họ và tên:** Nguyễn Xuân Đức
* **Mã sinh viên:** HE186870
* **Vai trò:** Lập trình viên (Sole Developer)
* **Lớp:** SE1867 — Nhóm 5 (Học phần: Chủ nghĩa xã hội khoa học)

---

## 🔒 Bảo Mật Mã Nguồn (Git Security Guide)

Dự án này chứa các mã nguồn đặc thù và cấu hình API tích hợp riêng. Để tránh lộ mã nguồn, vui lòng tuân thủ:
1. **Repository Chế Độ Riêng Tư (Private):** Luôn cài đặt kho lưu trữ trên GitHub/GitLab ở chế độ **Private**.
2. **Không commit file cấu hình:** Tuyệt đối không xóa `.env.local` khỏi file `.gitignore`. Các API key (Firebase Client, Firebase Admin, Gemini AI, Upstash Redis) phải được lưu trữ an toàn trong file `.env.local` cục bộ.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS & Vanilla CSS
* **Database & Realtime:** Firebase Firestore (Dùng cho phòng thi trực tuyến / Realtime Quiz)
* **Authentication:** Firebase Anonymous Auth (Đăng nhập ẩn danh tham gia thi nhanh)
* **AI Chatbot:** Google Gemini AI API SDK (Tích hợp trợ lý chatbot học thuật)
* **Animation:** Framer Motion & Lucide Icons
* **Hosting đề xuất:** Netlify hoặc Vercel (Có hỗ trợ Next.js)

---

## 🚀 Hướng Dẫn Cài Đặt và Chạy Cục Bộ (Local Development)

### 1. Cài đặt các thư viện phụ thuộc:
```bash
npm install
# Hoặc
npm ci
```

### 2. Cấu hình biến môi trường:
* Copy file `env.local.template` thành file mới tên là `.env.local`:
```bash
cp env.local.template .env.local
```
* Điền đầy đủ các thông tin Key của **Firebase** và **Gemini API** vào file `.env.local`.

### 3. Chạy dự án ở chế độ phát triển:
```bash
npm run dev
```
Truy cập ứng dụng tại địa chỉ: [http://localhost:3000](http://localhost:3000).

---

## 🌐 Triển Khai (Deployment)

1. Kết nối tài khoản GitHub (chứa repository **Private**) với Netlify hoặc Vercel.
2. Thêm các biến môi trường cấu hình trong file `.env.local` vào mục **Environment Variables** trong bảng quản trị của Netlify/Vercel.
3. Tiến hành deploy. Website sẽ chạy online công khai nhưng mã nguồn trên GitHub vẫn được bảo mật 100%.
