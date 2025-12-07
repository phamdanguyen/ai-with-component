# Sprint 7: Tool System & Reliability
# All-in-One Chat - Generative UI Platform

**Sprint Goal**: Hoàn thiện Hệ thống Công cụ (Tool System) để AI có thể thực hiện các tác vụ thực tế và nâng cao độ tin cậy của hệ thống thông qua xử lý lỗi toàn diện.
**Giai đoạn**: Phase 2 - Optimization & Completion
**Thời gian**: 1 tuần
**Trạng thái**: 🟡 PLANNING

---

## 🎯 Mục tiêu chính (Core Objectives)

### 1. 🛠️ Tool System Implementation (Epic 4)
Triển khai đầy đủ hệ thống công cụ để AI có thể tương tác với môi trường và lấy dữ liệu thực tế.
- **Story E4.S1**: Tool Registry & Execution Service.
- **Story E4.S3**: Tích hợp Tool vào `DualRequestHandler`.
- **Implementation**: 7 tools tích hợp Odoo (`search_product`, `create_sale_order`, `check_inventory`, `search_customer`, `get_order_status`, `create_support_ticket`, `lookup_contract`).

### 2. 🛡️ Advanced Error Handling (Epic 6)
Đảm bảo hệ thống có khả năng tự phục hồi và thông báo lỗi thân thiện.
- **Story E6.S1**: Component Generation Error Recovery (Retry logic).
- **Story E6.S2**: API Error Handling & Timeouts.

### 3. ✅ Verification & Hardening
- Đảm bảo E2E tests bao phủ các scenarios sử dụng tool.
- Fix các lỗi còn tồn đọng từ các sprint trước.

---

## 📋 Danh sách công việc (Backlog)

### Tool System (Epic 4) - ARCHITECTURE PIVOT
> [!IMPORTANT]
> **Final Architecture**: `ai-with-component` acts as the direct Frontend for Odoo. 
> - **Chat Stream**: Next.js -> Odoo (`/api/chat/stream` -> Odoo Port 8069).
> - **Middleware**: Bypassed for critical path.
> - **Tools**: Executed natively by Odoo.

- [x] **Task 4.0**: Configure Next.js Proxy to route `/api/chat/stream` directly to Odoo.
- [x] **Task 4.1**: (SKIPPED) Implement Middleware Tool Registry (Not needed).
- [ ] **Task 4.2**: Verify Odoo Tools via Frontend:
    - [x] `search_product`
    - [x] `create_sale_order`
    - [x] `check_inventory`
    - [x] `search_customer`
    - [x] `get_order_status`
    - [x] `create_support_ticket`
    - [x] `lookup_contract`
- [ ] **Task 4.3**: Integrate Tool selection logic (Handled by Odoo).

### Error Handling (Epic 6)
- [ ] **Task 6.1**: Implement Retry Strategy for Component Generation (Zod validation failure).
- [ ] **Task 6.2**: Add Global Error Handler in Fastify/Middleware.
- [ ] **Task 6.3**: Improve Frontend Error Boundaries (User-friendly messages).

---

## 📅 Definition of Done
- ✅ AI có thể tự động gọi tool khi người dùng yêu cầu (VD: "Tìm đơn hàng SO001").
- ✅ Tool results được sử dụng trong câu trả lời text và component.
- ✅ Hệ thống không crash khi tool fail (fallback gracefully).
- ✅ Validation lỗi component được tự động retry và sửa lỗi.
- ✅ Unit tests cho ToolService.
- ✅ E2E tests bao phủ các scenarios sử dụng tool.
- ✅ Fix các lỗi còn tồn đọng từ các sprint trước.
- ✅ Tạo plan cho sprint tiếp theo.
