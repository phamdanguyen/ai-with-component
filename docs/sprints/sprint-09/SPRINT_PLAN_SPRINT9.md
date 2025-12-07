# Sprint 9: Phase 3 Kickoff - Authentication & Database Foundation
# All-in-One Chat - Generative UI Platform

**Sprint Goal**: Thiết lập nền tảng Database và hệ thống xác thực người dùng (Authentication), chuyển đổi session từ in-memory sang persistent storage.
**Giai đoạn**: Phase 3 (Week 1)
**Thời gian**: 1 tuần
**Trạng thái**: 🟡 PLANNING

---

## 🎯 Mục tiêu chính (Core Objectives)

### 1. 🗄️ Database Infrastructure (Epic 10)
Triển khai persistent storage thay vì in-memory.
- **Story E10.S1**: Setup PostgreSQL & Prisma ORM.
- **Story E10.S2**: Design Schema (Users, Sessions, Conversations).

### 2. 🔐 User Authentication (Epic 11)
Bảo vệ ứng dụng và định danh người dùng.
- **Story E11.S1**: Backend Auth API (Register, Login, JWT).
- **Story E11.S2**: Frontend Auth Integration (Login Page, Protected Routes).

### 3. 💾 Data Persistence (Epic 12)
Lưu trữ lịch sử chat lâu dài.
- **Story E12.S1**: Migrate SessionStore từ Memory sang Database.

---

## 📋 Danh sách công việc (Backlog)

### Database Infrastructure (Epic 10)
- [ ] **Task 10.1**: Update `docker-compose.yml` add `postgres` service.
- [ ] **Task 10.2**: Init Prisma in `packages/middleware`.
- [ ] **Task 10.3**: Define `User`, `Session`, `Message` schema.

### Authentication (Epic 11)
- [ ] **Task 11.1**: Implement `AuthService` (Fastify plugin).
- [ ] **Task 11.2**: APIs: `/auth/register`, `/auth/login`, `/auth/me`.
- [ ] **Task 11.3**: Frontend Login UI (`/login` page).
- [ ] **Task 11.4**: Update `api-client.ts` to attach Bearer Token.

### Persistence (Epic 12)
- [ ] **Task 12.1**: Implement `PrismaSessionStore` (replace `InMemorySessionStore`).

---

## 📅 Definition of Done
- ✅ Database PostgreSQL chạy trong Docker.
- ✅ Người dùng có thể Đăng ký & Đăng nhập.
- ✅ Refresh trang không mất phiên đăng nhập (Token persistence).
- ✅ Lịch sử chat được lưu trong Database (check bảng `Message`).
- ✅ Unit test cho AuthService.
