# Product Requirements Document (PRD)
# All-in-One Chat - Generative UI Platform

**Phiên bản**: 1.0
**Ngày cập nhật**: 2025-12-05
**Trạng thái**: Phase 1 - MVP (Đang phát triển)

---

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Mục Tiêu Sản Phẩm](#mục-tiêu-sản-phẩm)
3. [Ngữ Cảnh & Vấn Đề](#ngữ-cảnh--vấn-đề)
4. [Yêu Cầu Chức Năng](#yêu-cầu-chức-năng)
5. [Yêu Cầu Phi Chức Năng](#yêu-cầu-phi-chức-năng)
6. [Luồng Người Dùng Chính](#luồng-người-dùng-chính)
7. [Ranh Giới & Giả Định](#ranh-giới--giả-định)
8. [Tiêu Chí Thành Công](#tiêu-chí-thành-công)
9. [Lộ Trình Phát Triển](#lộ-trình-phát-triển)

---

## 🎯 Tổng Quan

**All-in-One Chat** là một nền tảng AI tạo giao diện tương tác tự động. Thay vì chỉ trả về văn bản thường, AI sẽ tự động sinh ra các thành phần UI phong phú (biểu đồ, bảng, form, v.v.) phù hợp với câu hỏi của người dùng.

### Slogan
> **"Từ văn bản đơn điệu đến giao diện tương tác - AI sinh ra trực tiếp những gì bạn cần"**

### Độc Đáo
- **2-Request Architecture**: Gửi 2 yêu cầu song song (text summary + component generation) để có kết quả nhanh và chính xác
- **Progressive Disclosure UI**: Văn bản luôn hiển thị, component có thể mở rộng khi cần
- **7 Loại Component**: Card, Chart, Table, Form, List, Slides, Report

---

## 🎯 Mục Tiêu Sản Phẩm

### Mục Tiêu Chính
1. **Tạo trải nghiệm chat hiện đại**: Kết hợp text response và UI component tương tác
2. **Tiết kiệm thời gian người dùng**: Dữ liệu phức tạp được hiển thị trực quan
3. **Nền tảng mở rộng**: Dễ thêm component mới, LLM provider mới, tool mới

### Mục Tiêu Kinh Doanh
- MVP hoàn thành tháng 1-2 (Phase 1-2)
- Hỗ trợ đa user tháng 3 (Phase 3)
- Tích hợp Odoo tháng 4-5 (Phase 4)
- Sản phẩm commercial tháng 6 (Phase 5)

### Thị Trường Mục Tiêu
- **B2B**: ERP/CRM users (tích hợp Odoo sau)
- **B2C**: Anyone cần tạo report/dashboard từ data
- **Người sáng lập**: Teams sử dụng Gemini API

---

## 🌍 Ngữ Cảnh & Vấn Đề

### Vấn Đề Hiện Tại
| Vấn Đề | Mô Tả |
|--------|-------|
| **Văn bản tĩnh** | ChatGPT chỉ trả text, khó đọc với dữ liệu phức tạp |
| **Nhiều bước thao tác** | Phải copy data, vào Excel/Tableau để visualize |
| **Không tương tác** | Không thể drill-down, filter, export dữ liệu từ response |
| **Thiếu context** | AI không biết tool/data của user |

### Giải Pháp Của All-in-One Chat
1. **Tự động sinh UI**: AI chọn component phù hợp
2. **Tương tác ngay**: Click vào chart để xem chi tiết
3. **Tool-aware**: AI có quyền gọi tool (calculate, get_weather, v.v.)
4. **Text + Component**: Cả 2 cùng có, linh hoạt cách sử dụng

---

## 📋 Yêu Cầu Chức Năng

### F1: Chat Interface (Giao Diện Chat)
**Mô Tả**: Người dùng nhập message, nhấn Enter, nhận response

**Acceptance Criteria**:
- [ ] Input field với placeholder "Hỏi gì đó..."
- [ ] Send button kích hoạt khi có text
- [ ] Message hiển thị trong chat history
- [ ] Typing indicator khi AI đang xử lý
- [ ] Scroll to latest message tự động

**Out of Scope**: Authentication (Phase 3)

---

### F2: Dual-Stream Response (Trả Về Kép)
**Mô Tả**: AI trả về CÙNG LÚC text summary + component spec

**Acceptance Criteria**:
- [ ] Backend gửi 2 request song song (Gemini Flash + Gemini Pro)
- [ ] Response bao gồm: `{ textSummary, componentSpec, metadata }`
- [ ] Text summary ≤ 3 câu, nhanh
- [ ] Component spec valid JSON schema, kích hoạt rendering
- [ ] Total time < 5 giây cho cả 2 stream
- [ ] Nếu component generation fail, fallback về text-only

**Acceptance Criteria Chi Tiết**:
```typescript
Response {
  success: boolean,
  data: {
    textSummary: string,        // Tóm tắt nhanh
    componentSpec: {             // Spec để render
      type: string,              // 'Card' | 'Chart' | 'Table' | ...
      props: Record<string, any> // Tuỳ component
    } | null,
    metadata: {
      textGenTime: number,       // ms
      componentGenTime: number,  // ms
      toolsUsed: string[]        // tool names
    }
  }
}
```

---

### F3: 7 Component Types (7 Loại Component)

#### F3.1: Chart Component
- **Use Cases**: Biểu đồ tăng trưởng, phân bố dữ liệu, trendline
- **Props**: chartType, data, xAxis, yAxis, colors, showLegend, etc.
- **Library**: Recharts
- **Acceptance**:
  - [ ] Render line, bar, area, pie, scatter, radar, combo
  - [ ] Tooltip hiển thị khi hover
  - [ ] Responsive (mobile-friendly)
  - [ ] Legend có thể toggle

#### F3.2: Table Component
- **Use Cases**: Danh sách dữ liệu, inventory, results list
- **Props**: columns, data, striped, hover, pagination
- **Acceptance**:
  - [ ] Header có thể sort (nếu data.length > 10)
  - [ ] Pagination nếu > 20 rows
  - [ ] Striped rows option
  - [ ] Responsive scroll mobile

#### F3.3: Card Component
- **Use Cases**: KPI display, status box, metric card
- **Props**: title, content, variant, icon, image, actions
- **Acceptance**:
  - [ ] Title + content hiển thị rõ
  - [ ] Variant colors (success, warning, error, info, default)
  - [ ] Optional icon + image
  - [ ] Action buttons (onClick triggers?)

#### F3.4: Form Component
- **Use Cases**: Input data, filter options, search form
- **Props**: fields[], layout, onSubmit handler
- **Acceptance**:
  - [ ] Text, select, checkbox, radio fields
  - [ ] Validation on submit
  - [ ] Required field indicator
  - [ ] Vertical/horizontal layout

#### F3.5: List Component
- **Use Cases**: Task list, menu items, result items
- **Props**: items[], variant, selectable, searchable
- **Acceptance**:
  - [ ] Simple list / card variant
  - [ ] Searchable (filter by title/description)
  - [ ] Selectable (checkboxes)
  - [ ] Badge support (status, count)

#### F3.6: Slides Component
- **Use Cases**: Presentation, tutorial, image carousel
- **Props**: slides[], autoPlay, autoPlayInterval, showDots
- **Acceptance**:
  - [ ] Previous/Next buttons
  - [ ] Navigation dots
  - [ ] Auto-play with interval control
  - [ ] Touch swipe mobile

#### F3.7: Report Component
- **Use Cases**: Business report, document export, summary
- **Props**: title, sections[], summary, footer, printable
- **Acceptance**:
  - [ ] Section headings + content
  - [ ] Print button → PDF
  - [ ] Author/date stamp
  - [ ] Page breaks

---

### F4: Progressive Disclosure UI (Giao Diện Phân Cấp)
**Mô Tả**: Text luôn hiển thị, component có collapse/expand

**Acceptance Criteria**:
- [ ] Message có text summary lúc đầu
- [ ] Button "Xem chi tiết" / "🔽" để mở component
- [ ] Component collapse sau khi xem (tiết kiệm space)
- [ ] Hover trên component → show close button
- [ ] Chat không lag khi render many components

---

### F5: Tool System (Hệ Thống Tool)
**Mô Tả**: AI có thể gọi tool để lấy real-time data

**Acceptance Criteria**:
- [ ] Built-in tools: `get_current_date`, `calculate`, `get_weather`
- [ ] Tool result cached 5 phút
- [ ] AI có thể call tool tự động khi cần
- [ ] Tool error gracefully fallback
- [ ] `/api/tools` endpoint liệt kê available tools
- [ ] Tool schema rõ ràng (input/output)

**Tools Trong MVP**:
```
1. get_current_date() → 2025-12-05
2. calculate(expression: string) → result
3. get_weather(city: string) → { temp, condition, humidity }
4. list_files(directory: string) → [files]
5. read_file(path: string) → content
6. web_search(query: string) → [results]
7. translate(text: string, from: string, to: string) → translated
```

---

### F6: Session Management (Quản Lý Phiên)
**Mô Tả**: Track conversation history, maintain context

**Acceptance Criteria**:
- [ ] Session auto-create on first message
- [ ] SessionId stored in localStorage
- [ ] Context window keeps last 5 messages
- [ ] `/api/sessions/:id/history` endpoint
- [ ] Manual session creation via button
- [ ] Clear history button
- [ ] Session timeout after 24 hours (Phase 3)

---

### F7: Error Handling & Recovery (Xử Lý Lỗi)
**Mô Tả**: Graceful failure, retry, fallback

**Acceptance Criteria**:
- [ ] Invalid component spec → fallback text
- [ ] API timeout → retry 1x automatically
- [ ] Component render error → error boundary + fallback
- [ ] Network error → show retry button
- [ ] User sees: error message + helpful hint
- [ ] Console logs all errors for debugging

---

### F8: Multi-Language Support (Hỗ Trợ Đa Ngôn Ngữ)
**Mô Tả**: UI/responses in Vietnamese + future languages

**Acceptance Criteria**:
- [ ] UI labels in Vietnamese
- [ ] AI responses adaptive (user language)
- [ ] Date format localized (VN: dd/mm/yyyy)
- [ ] Number format localized (VN: . for decimal, , for thousands)
- [ ] Future: i18n infrastructure ready

---

## ⚙️ Yêu Cầu Phi Chức Năng

### Performance (Hiệu Suất)
| Yêu Cầu | Target |
|--------|--------|
| Text generation time | < 2 giây |
| Component generation time | < 3 giây |
| Total response time | < 5 giây |
| Chat UI responsiveness | < 100ms |
| Component render | < 500ms |
| Page load | < 3 giây |

### Reliability (Độ Tin Cậy)
- **Uptime**: 99.5% (Phase 3+)
- **Error Recovery**: Auto-retry on timeout
- **Fallback**: Always show text if component fails
- **Testing**: 70%+ code coverage (Phase 2)

### Security (Bảo Mật)
- **MVP**: No auth (Phase 3 add)
- **API Key**: .env protected (never commit)
- **CORS**: Configurable
- **Input Validation**: Zod schema enforcement
- **Component XSS Prevention**: React default safe

### Scalability (Khả Năng Mở Rộng)
- **Architecture**: Monorepo ready (turbo)
- **DB**: Stateless backend (Phase 3: add DB)
- **Component System**: Plugin-based
- **Tool System**: Registry-based (easy extend)

### Accessibility (Khả Năng Tiếp Cận)
- **Semantic HTML**: All components use proper tags
- **ARIA Labels**: Interactive elements labeled
- **Keyboard Navigation**: Focus visible, tab order correct
- **Color Contrast**: WCAG AA compliant
- **Future**: WCAG AAA (Phase 5)

### Maintainability (Dễ Bảo Trì)
- **Code Style**: ESLint + Prettier
- **Type Safety**: 100% TypeScript
- **Documentation**: JSDoc + inline comments
- **Testing**: Unit + E2E tests
- **Modularity**: Services, interfaces, components loosely coupled

---

## 🔄 Luồng Người Dùng Chính

### Use Case 1: View Analytics Dashboard
```
User: "Show me sales trend for Q4"
       ↓
AI (Gemini Flash): "Q4 sales up 15% YoY"  [text]
AI (Gemini Pro):   { Chart: line chart }  [component]
       ↓
User sees: Text summary + "Xem chi tiết" button
       ↓
User: Click "Xem chi tiết"
       ↓
UI: Expand chart, show interactive line chart
       ↓
User: Hover data point → tooltip shows exact value
```

### Use Case 2: Generate Report
```
User: "Create Q4 sales report"
       ↓
AI: Calls tool: read_file("Q4_data.csv")
       ↓
AI (Gemini Flash): "Q4 total $2.5M revenue"  [text]
AI (Gemini Pro):   { Report: sections }      [component]
       ↓
User: Click "Print" in Report component
       ↓
UI: Opens print dialog → user saves as PDF
```

### Use Case 3: Data Analysis
```
User: "Compare top 5 cities by revenue"
       ↓
AI: Calls tool: read_file("cities_revenue.json")
       ↓
AI (Gemini Flash): "NYC leads with $1.2M"   [text]
AI (Gemini Pro):   { Table + Chart }        [component]
       ↓
User: Click chart → drill-down to city details
User: Click table header → sort by revenue desc
```

---

## 🚧 Ranh Giới & Giả Định

### Ranh Giới (Out of Scope Phase 1)
- ❌ User authentication & multi-tenant
- ❌ Persistent database (in-memory only)
- ❌ Multi-language AI responses (English/VN UI)
- ❌ Real-time collaboration
- ❌ Offline mode
- ❌ Mobile-native apps
- ❌ Odoo integration
- ❌ Advanced security (TLS, encryption)
- ❌ Analytics/monitoring
- ❌ Rate limiting

### Giả Định (Phase 1)
1. **Single User**: Một user per session
2. **Gemini API Free**: Sử dụng Gemini free tier (quotas apply)
3. **English Prompts**: AI prompts in English (responses adaptive)
4. **Network**: Always online, no offline sync
5. **Browser**: Modern browsers (Chrome, Firefox, Safari, Edge)
6. **Node.js**: >= 18.0.0
7. **Data**: Không lưu persistent (ephemeral session)

---

## ✅ Tiêu Chí Thành Công

### Phase 1 Success Metrics
- [ ] Chat interface works end-to-end
- [ ] 2-request architecture deployed
- [ ] All 7 components render without error
- [ ] Response time < 5 sec
- [ ] Session management works
- [ ] No critical bugs in testing
- [ ] Code coverage > 60%
- [ ] Documentation complete

### User Feedback Success
- User can use without training
- Response quality > 80% satisfactory
- Component rendering > 90% accurate

---

## 📅 Lộ Trình Phát Triển

### Phase 1: MVP (Làm Ngay)
**Duration**: 2-4 tuần
**Goal**: Core functionality working

**Deliverables**:
- [ ] 2-request architecture fully functional
- [ ] All 7 components implemented + tested
- [ ] Session management (in-memory)
- [ ] Tool system with 7 tools
- [ ] Chat UI with progressive disclosure
- [ ] Error handling & retry logic
- [ ] Documentation complete
- [ ] Deploy locally testable

**Success**: Everything above working with < 5 sec response time

---

### Phase 2: Optimization & Memory
**Duration**: 2-3 tuần
**Goal**: Better UX, persistent memory

**Deliverables**:
- [ ] Conversation memory (Redis/DB)
- [ ] Faster responses (streaming, caching)
- [ ] Better prompts (fewer retries)
- [ ] 80% code coverage
- [ ] Performance monitoring
- [ ] UX polish (animations, transitions)

---

### Phase 3: Multi-User & Auth
**Duration**: 3-4 tuần
**Goal**: Production-ready single-tenant

**Deliverables**:
- [ ] User auth (email/password + social)
- [ ] PostgreSQL/MongoDB integration
- [ ] Multi-user sessions
- [ ] User profiles + preferences
- [ ] Conversation history persistence
- [ ] Subscription/billing system (optional)

---

### Phase 4: Odoo Integration
**Duration**: 3-4 tuần
**Goal**: Seamless Odoo connectivity

**Deliverables**:
- [ ] Odoo API connector
- [ ] Real-time Odoo data in responses
- [ ] Odoo-aware prompts
- [ ] Create/update Odoo records via AI
- [ ] Odoo auth flow

---

### Phase 5: Production & Scaling
**Duration**: Ongoing
**Goal**: Commercial product

**Deliverables**:
- [ ] Cloud deployment (AWS/GCP/Azure)
- [ ] CDN for frontend
- [ ] Load balancing
- [ ] Monitoring & alerting
- [ ] Support & documentation
- [ ] Multi-language support
- [ ] Advanced features (LLM provider choice, etc.)

---

## 📊 Success Definition

**Berapa là "sản phẩm tốt"?**

1. ✅ **Reliable**: Người dùng sử dụng được mà không gặp bug
2. ✅ **Fast**: Response < 5 giây (mục tiêu < 3 giây)
3. ✅ **Intuitive**: Không cần training, UI rõ ràng
4. ✅ **Accurate**: AI response đúng 90%+ cases
5. ✅ **Maintainable**: Code dễ đọc, test, mở rộng
6. ✅ **Scalable**: Ready cho nhiều users sau này

---

## 📝 Ghi Chú & Tham Khảo

- **Inspiration**: Odoo AI Chat (tool registry, service separation)
- **Reference**: thesys.dev (generative UI concept)
- **Tech Docs**: See `docs/ARCHITECTURE.md`
- **User Stories**: See `docs/USER_STORIES.md`

---

**Document Created**: 2025-12-05
**Last Updated**: 2025-12-05
**Owner**: Master
**Status**: ACTIVE

---
