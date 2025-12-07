# Sprint 8: Integration Hardening & Feature Polish
# All-in-One Chat - Generative UI Platform

**Sprint Goal**: Ổn định hóa kết nối trực tiếp (Direct Frontend -> Odoo), xử lý chênh lệch dữ liệu (Data Normalization) và triển khai các tính năng nâng cao (Deep Think).
**Giai đoạn**: Phase 2 -> Phase 3 Transition
**Thời gian**: 1 tuần
**Trạng thái**: 🟡 PLANNING

---

## 🎯 Mục tiêu chính (Core Objectives)

### 1. 🛡️ Integration Hardening (Epic 7)
Đảm bảo Frontend xử lý mượt mà luồng dữ liệu SSE từ Odoo.
- **Story E7.S1**: Chuẩn hóa dữ liệu Stream (Data Normalization) tại Frontend.
- **Story E7.S2**: Kiểm thử E2E với 7 công cụ Odoo (Product, Sales, Inventory...).

### 2. 🧠 Advanced AI Features (Epic 8)
Nâng cao trải nghiệm thông minh.
- **Story E8.S1**: Implement **Deep Think Toggle** (Reasoning Mode).
- **Story E8.S2**: Hiển thị trạng thái "Thinking..." và các bước suy luận.

### 3. 🐳 DevOps & Deployment (Epic 9)
Cập nhật môi trường triển khai cho kiến trúc mới.
- **Story E9.S1**: Cập nhật `docker-compose.yml` (Link Web -> Odoo).
- **Story E9.S2**: Xác thực môi trường Docker.

---

## 📋 Danh sách công việc (Backlog)

### Integration Hardening (Epic 7)
- [ ] **Task 7.1**: Cập nhật `api-client.ts` để handle các event type đặc thù của Odoo (`suggestions`, `rag`, `tools`).
- [ ] **Task 7.2**: Verify Component Rendering (Chart, Table, Form) từ dữ liệu Odoo thực tế.

### Advanced Features (Epic 8)
- [ ] **Task 8.1**: UI Toggle "Deep Think" trên Chat Interface.
- [ ] **Task 8.2**: Truyền tham số `deep_think=true` xuống Odoo API.
- [ ] **Task 8.3**: Hiển thị process logs/thinking step trong UI.

### DevOps (Epic 9)
- [ ] **Task 9.1**: Update `docker-compose.yml` (Remove Middleware link requirement for Chat).
- [ ] **Task 9.2**: Verify Docker Networking (Web Container -> Odoo Container).

---

## 📅 Definition of Done
- ✅ Frontend hiển thị đúng Component từ Odoo Stream.
- ✅ Toggle Deep Think hoạt động (gửi param đúng).
- ✅ Docker Compose chạy ổn định (Web + Odoo).
- ✅ Test E2E thành công trên môi trường Docker.
