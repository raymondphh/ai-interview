# AI Interview Platform

Nền tảng luyện phỏng vấn bằng AI: upload CV → AI phân tích CV → AI tạo câu hỏi phỏng vấn →
ghi âm / speech-to-text trả lời → AI chấm điểm → Dashboard theo dõi tiến độ.

## Kiến trúc

- **Frontend**: Nuxt 3, TypeScript, Ant Design Vue, Tailwind CSS, Pinia, Axios
- **Backend**: Express.js, TypeScript, PostgreSQL (Prisma ORM), JWT auth, Multer, OpenAI API (GPT cho phân tích/chấm điểm, Whisper cho speech-to-text)

## Cấu trúc thư mục

```
ai-interview-platform/
├── backend/            # Express API
│   ├── prisma/schema.prisma
│   └── src/
│       ├── config/     # kết nối DB
│       ├── middleware/ # auth (JWT), upload (multer)
│       ├── routes/     # định nghĩa route
│       ├── controllers/# xử lý request
│       └── services/   # AI service, speech-to-text, CV parser
├── frontend/            # Nuxt 3 app
│   ├── pages/           # login, upload-cv, interview/[id], dashboard
│   ├── components/      # RecordButton, QuestionCard
│   ├── stores/           # Pinia: auth, cv, interview
│   └── services/        # axios API clients
└── docker-compose.yml   # PostgreSQL cho local dev
```

## Cài đặt & chạy thử

### 1. Khởi động PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # cập nhật OPENAI_API_KEY, JWT_SECRET...
npm install
npm run prisma:generate
npm run prisma:migrate    # tạo bảng trong DB
npm run dev                # chạy tại http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # chạy tại http://localhost:3000
```

## Luồng nghiệp vụ chính

1. **Login/Register** (`/login`) — JWT lưu trong cookie, Pinia store `auth`.
2. **Upload CV** (`/upload-cv`) — upload PDF/DOC/DOCX, backend trích xuất text (`pdf-parse`).
3. **AI phân tích CV** — gọi OpenAI (GPT) để trả về JSON: kỹ năng, điểm mạnh/yếu, vai trò phù hợp...
4. **AI tạo câu hỏi** — dựa trên kết quả phân tích, sinh ra bộ câu hỏi phỏng vấn.
5. **Record / Speech to Text** — người dùng ghi âm câu trả lời (MediaRecorder API ở trình duyệt),
   gửi file audio lên backend, backend dùng Whisper API để chuyển thành văn bản.
6. **AI chấm điểm** — so khớp câu hỏi & câu trả lời (transcript), GPT chấm điểm 0-10 kèm nhận xét.
7. **Dashboard** — thống kê số CV, số buổi phỏng vấn, điểm trung bình, lịch sử điểm số.

## Các điểm cần bổ sung khi đưa vào production

- Parser cho file `.doc/.docx` (hiện `pdf-parse` mới hỗ trợ PDF; có thể dùng thêm `mammoth`).
- Validate/giới hạn dung lượng & loại file kỹ hơn, quét virus cho file upload.
- Hàng đợi (queue) xử lý AI để tránh block request khi phân tích CV / chấm điểm số lượng lớn.
- Rate limiting, logging, test tự động (unit/integration).
- Lưu trữ file audio/CV trên cloud storage (S3, GCS...) thay vì local disk.
