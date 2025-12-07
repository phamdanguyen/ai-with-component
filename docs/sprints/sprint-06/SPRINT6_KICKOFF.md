# Sprint 6: Caching & Enhanced Memory Kickoff
# All-in-One Chat - Generative UI Platform

**Sprint Goal**: Tối ưu hóa tốc độ phản hồi thông qua Caching và quản lý ngữ cảnh hội thoại (Memory Context) hiệu quả hơn.
**Giai đoạn**: Phase 2 - Optimization & Memory (Tuần 2)
**Thời gian**: 1 tuần
**Trạng thái**: 🟡 PLANNING

---

## 🎯 Mục tiêu chính (Core Objectives)

### 1. ⚡ Response Caching System (P1 - High)
Triển khai hệ thống cache để lưu trữ các phản hồi cho các câu hỏi trùng lặp hoặc tương tự, giúp giảm tải cho LLM và tăng tốc độ phản hồi tức thì.
- **Cache Layer**: Tạo interface `ICacheStore` và implement `InMemoryCacheStore` (có thể mở rộng sang Redis sau này).
- **Caching Strategy**: Implement logic cache với TTL (Time-To-Live).
- **Integration**: Tích hợp Caching vào `ChatService`.

### 2. 🧠 Smart Context Management (P1 - High)
Cải thiện cách quản lý bộ nhớ hội thoại gửi lên LLM để tránh vượt quá giới hạn token và tối ưu chi phí, đồng thời vẫn giữ được ngữ cảnh quan trọng.
- **Context Window**: Giới hạn số lượng message gửi đi (sliding window).
- **Summarization**: (Optional) Tóm tắt các hội thoại cũ nếu ngữ cảnh quá dài.

### 3. 🔍 Similar Query Detection (P2 - Medium)
Phát hiện các câu hỏi tương tự để tận dụng cache hiệu quả hơn (bước đầu có thể dùng exact match hoặc normalized string match).

---

## 📋 Danh sách công việc (Backlog)

### Story 6.1: Caching Infrastructure
**Owner**: Backend Dev
- Tạo `ICacheStore` interface.
- Implement `InMemoryCacheStore` (dùng Map hoặc LRU Cache).
- Implement `ResponseCacheService` với các method `get`, `set` (có TTL).

### Story 6.2: Cache Integration
**Owner**: Backend Dev
- Sửa đổi `ChatService` hoặc `ToolService` để check cache trước khi gọi LLM/Tools.
- Cache key strategy: Hash của user prompt + context (hoặc chỉ prompt nếu context ít ảnh hưởng).

### Story 6.3: Context Window Strategy
**Owner**: AI Engineer / Backend Dev
- Cập nhật `PromptService` hoặc `LLMProvider`.
- Implement logic cắt bớt message cũ: Chỉ giữ N message gần nhất hoặc tính toán token count.
- Đảm bảo System Prompt luôn được giữ lại.

---

## 📅 Definition of Done
- ✅ Các câu hỏi lặp lại trả về kết quả tức thì (< 500ms).
- ✅ Hệ thống không bị crash do ngữ cảnh quá dài (Context limit exceeded).
- ✅ Cache tự động hết hạn sau khoảng thời gian cấu hình (TTL).
- ✅ Unit tests cho Caching Service.
- ✅ Kiểm thử tích hợp (Integration Tests) với  playground chat