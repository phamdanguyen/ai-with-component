# Sprint 4 Kickoff
# All-in-One Chat - Integration & Hardening

**Start Date**: 2025-12-26 (Friday)
**End Date**: 2025-12-31 (Wednesday)
**Duration**: 1 week (Phase 1, Week 4)
**Team**: Full Team
**Goal**: Integration & Hardening - Finalize MVP

---

## 🎯 Sprint 4 Goal

**Đảm bảo toàn bộ luồng hoạt động trơn tru (End-to-End) và xử lý lỗi (Error Recovery) để hoàn thành MVP.**

Kết thúc Sprint 4, chúng ta sẽ có:
- Luồng chat hoạt động hoàn chỉnh từ đầu đến cuối với tất cả 7 loại component.
- Hệ thống tự động phục hồi khi có lỗi (thử lại, fallback).
- Cache cho Tool để tăng tốc độ.
- Unit Test và E2E Test bao phủ các luồng chính.
- Tài liệu dự án hoàn chỉnh.

---

## 📋 Sprint 4 Stories

| Story | Points | Description | Owner | Status |
|-------|--------|-------------|-------|--------|
| **E4.S1** - Full E2E Integration | 5 | Tích hợp hoàn chỉnh Frontend-Backend với tất cả component | Full-stack | 🔴 Not Started |
| **E4.S2** - Error Recovery | 5 | Xử lý lỗi graceful, retry mechanism | Backend | 🔴 Not Started |
| **E4.S3** - Tool Caching | 3 | Cache kết quả tool call để giảm độ trễ | Backend | 🔴 Not Started |
| **E4.S4** - Unit Tests | 5 | Viết unit test cho Core logic và Components | Full Team | 🔴 Not Started |
| **E4.S5** - E2E Tests | 5 | Viết E2E test scenarios (Playwright/Cypress) | QC/Dev | 🔴 Not Started |
| **E4.S6** - Documentation | 2 | Cập nhật README, API docs, hướng dẫn chạy | Tech Writer | 🔴 Not Started |
| **TOTAL** | **~25 pts** | - | - | - |

---

## 🏗️ Implementation Details

### 1. Full E2E Integration (E4.S1)
- Đảm bảo `DualRequestHandler` trả về đúng format cho mọi loại component.
- Frontend `DynamicRenderer` xử lý mượt mà việc chuyển đổi giữa text streaming và component rendering.
- Kiểm tra các case biên: component rỗng, dữ liệu thiếu.

### 2. Error Recovery (E4.S2)
- Implement `RetryStrategy` trong `LLMService`.
- Frontend hiển thị thông báo lỗi thân thiện thay vì crash (đã có `ErrorBoundary` từ Sprint 3, cần review lại).
- Fallback về text response nếu không generate được component.

### 3. Tool Caching (E4.S3)
- Sử dụng in-memory cache (hoặc Redis nếu có) cho các tool call tốn kém.
- TTL (Time To Live) hợp lý (ví dụ: 5 phút cho dữ liệu ít thay đổi).

### 4. Testing (E4.S4, E4.S5)
- **Unit Tests**: Jest/Vitest cho `LLMService`, `ComponentGenerationService`, và các UI components.
- **E2E Tests**: Playwright kịch bản người dùng chat -> nhận biểu đồ -> tương tác biểu đồ.

---

## ✅ Definition of Done (Sprint 4 & Phase 1)

- ✅ MVP hoàn chỉnh và hoạt động ổn định.
- ✅ Tất cả 7 components hiển thị đúng dữ liệu thực tế.
- ✅ Xử lý lỗi tốt, không crash app.
- ✅ Coverage code > 60%.
- ✅ Demo nội bộ thành công.

---

## 📅 Daily Schedule

| Day | Focus | Owner |
|-----|-------|-------|
| **Fri 12/26** | E2E Integration, fix bugs tồn đọng Sprint 3 | Full Team |
| **Mon 12/29** | Error Recovery & Tool Caching | Backend |
| **Tue 12/30** | Writing Tests (Unit & E2E) | Full Team |
| **Wed 12/31** | Documentation & Final Polish (MVP Release) | Full Team |

---
