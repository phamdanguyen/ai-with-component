# Sprint 5: Optimization & Memory Kickoff
# All-in-One Chat - Generative UI Platform

**Sprint Goal**: Kích hoạt Streaming Response toàn diện và thiết lập bộ nhớ hội thoại bền vững (Persistent Memory Foundation).
**Giai đoạn**: Phase 2 - Optimization & Memory (Tuần 1)
**Thời gian**: 1 tuần

---

## 🎯 Mục tiêu chính (Core Objectives)

### 1. 🌊 Full Streaming Integration (P0 - Critical)
Hiện tại Backend đã hỗ trợ streaming nhưng Frontend (Next.js API Route) chưa chuyển tiếp luồng dữ liệu này. Sprint này sẽ kết nối hoàn chỉnh pipeline streaming từ Gemini -> Middleware -> Next.js -> React Client.
- **Frontend**: Tạo endpoint `/api/chat/stream` trên Next.js để stream data.
- **Client**: Cập nhật `ChatAPIClient` để consume Server-Sent Events (SSE).
- **UI**: Cải thiện `ChatInterface` để hiển thị text mượt mà từng token.

### 2. 🧠 Persistent Memory Foundation (P1 - High)
Chuyển đổi từ InMemory storage tạm thời sang File-based storage (bước đệm cho Database ở Phase 3). Điều này giúp hội thoại không bị mất khi restart server.
- **Storage**: Implement `FileSessionStore` và `FileConversationStore` (dùng JSON file).
- **Middleware**: Cấu hình `SessionManagementService` dùng FileStore mới.

### 3. ⚡ Optimization Base (P2 - Medium)
Đo lường và tối ưu hóa thời gian phản hồi ban đầu (Time to First Byte - TTFB).

---

## 📋 Danh sách công việc (Backlog)

### Story 5.1: Next.js Streaming Proxy
**Owner**: Full-stack Dev
- Tạo `apps/web/app/api/chat/stream/route.ts`.
- Implement logic chuyển tiếp `ReadableStream` từ Backend về Client.
- Xử lý lỗi connection và timeout trong quá trình stream.

### Story 5.2: Client-side Streaming Consumption
**Owner**: Frontend Dev
- Kiểm tra và tinh chỉnh `ChatAPIClient.streamMessage()`.
- Đảm bảo `useDualStreamUI` hook xử lý đúng các loại chunk (text, component, error).
- Fix issue hiển thị component khi chưa nhận đủ props (nếu có).

### Story 5.3: File-based Persistence
**Owner**: Backend Dev
- Implement `FileSessionStore` (lưu sessions.json).
- Implement `FileConversationStore` (lưu conversations.json).
- Đảm bảo thread-safety cơ bản (dùng lock file hoặc sync write).
- Config server để switch từ Memory sang FileStore.

---

## 📅 Definition of Done
- ✅ User thấy text xuất hiện dần dần (streaming) thay vì chờ load xong cả cục.
- ✅ Restart middleware server không làm mất lịch sử chat cũ.
- ✅ Các component phức tạp (Chart, Table) vẫn render đúng sau khi stream xong.
- ✅ Test coverage cho Storage service > 80%.
