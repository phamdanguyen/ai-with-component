# SYSTEM CONTEXT (NGUỒN SỰ THẬT DUY NHẤT)

Tài liệu này định nghĩa **SỰ THẬT DUY NHẤT (Single Source of Truth)** cho toàn bộ hệ thống. Mọi tài liệu khác (Architecture, Tech Spec) nếu mâu thuẫn với tài liệu này đều được coi là **SAI**.

## 1. Cấu Hình Cổng (Ports) & URL

| Service | Port | Local URL | Mô tả |
| :--- | :--- | :--- | :--- |
| **Frontend App** | **8080** | `http://localhost:8080` | Next.js App (apps/web). Entry point chính của người dùng. |
| **Backend API** | **3001** | `http://localhost:3001` | Fastify Middleware. Xử lý logic và AI. |
| **Odoo ERP** | **8069** | `http://localhost:8069` | Odoo Server. Backend ERP & Database. |

> [!CAUTION]
> **KHÔNG BAO GIỜ** giả định Frontend chạy ở port 3000. Cấu hình mặc định của dự án này là **8080**.

## 2. Tên & Cấu Trúc Module

| Module Name | Path | Mô tả |
| :--- | :--- | :--- |
| `odoo_ai_chat` | `d:\code\ai.odoo-ai-power-dev\odoo_ai_chat` | Module Odoo chính chứa AI Logic & Controllers. |
| `uniai_website` | `d:\code\ai.odoo-ai-power-dev\uniai_website` | Module Website tích hợp giao diện UniAI. |
| `apps/web` | `d:\code\ai-with-component\apps\web` | Frontend Next.js (GenUI Platform). |
| `packages/middleware` | `d:\code\ai-with-component\packages\middleware` | Backend Node.js (Fastify). |

## 3. Quy Tắc Cốt Lõi (Core Rules)

1.  **Ngôn Ngữ**: Mọi giao tiếp, tài liệu, plan, commit message đều phải dùng **Tiếng Việt**.
2.  **Cổng (Ports)**: Luôn tuân thủ bảng Cấu Hình Cổng ở mục 1.
3.  **Tích hợp Odoo**:
    *   Sử dụng API `/api/chat/stream` cho streaming.
    *   Module `odoo_ai_chat` là nơi chứa bảng `embedding_model_config`. (Đã fix lỗi thiếu bảng này).
4.  **Cập nhật Tài liệu**: Khi code thay đổi, **PHẢI** cập nhật tài liệu này và `ARCHITECTURE.md` nếu có thay đổi về kiến trúc mức cao.

## 4. Tech Stack (Chính thức)

*   **Frontend**: Next.js 14 (App Router), TailwindCSS, Radix UI.
*   **Backend**: Fastify, Zod, LangChain (hoặc Google Generative AI SDK trực tiếp).
*   **Database**: Odoo (PostgreSQL) cho business data. File system cho session (dev).
*   **AI Model**: Google Gemini Flash (Text), Gemini Pro (Component).

---
*Cập nhật lần cuối: 2025-12-06*
