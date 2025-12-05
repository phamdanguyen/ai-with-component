# Sprint 3 - Daily Implementation Guide
## Hướng Dẫn Chi Tiết Cho Mỗi Ngày

**Sprint Duration**: Dec 19-25, 2025 (5 business days)
**Total Points**: 35 story points
**Status**: 🔴 **STARTING**

---

## 📅 Weekly Overview

| Day | Date | Focus | Points | Owner | Status |
|-----|------|-------|--------|-------|--------|
| **Day 1** | Fri 12/19 | DynamicRenderer | 4 | Full Team | 🔴 |
| **Day 2** | Mon 12/22 | Charts + Forms | 9 | Frontend + Backend | 🔴 |
| **Day 3** | Tue 12/23 | Tables + Reports | 7 | Backend + Full-stack | 🔴 |
| **Day 4** | Wed 12/24 | Cards + Lists + Slides | 9 | Full-stack | 🔴 |
| **Day 5** | Thu 12/25 | Testing + Polish | 4 | Full Team | 🔴 |
| **TOTAL** | | **Component Library** | **35** | | 🔴 |

---

## 🎯 Day 1: Friday, Dec 19 - DynamicRenderer (4 pts)

### Timeline

| Time | Task | Duration | Owner |
|------|------|----------|-------|
| 09:00 | Standup | 15 min | All |
| 09:15 | Setup & Directory Structure | 45 min | Frontend Lead |
| 10:00 | Create ErrorBoundary | 30 min | Full-stack |
| 10:30 | Create Component Stubs | 30 min | Full-stack |
| 11:00 | Create DynamicRenderer | 60 min | Frontend Lead |
| 12:00 | Create Export Index | 15 min | Frontend Lead |
| 12:15 | Testing & Verification | 45 min | All |
| **13:00** | **LUNCH** | **60 min** | **All** |
| 14:00 | Code Review | 30 min | All |
| 14:30 | Documentation | 30 min | Frontend Lead |
| 15:00 | Prepare For Day 2 | 60 min | Team |
| 16:00 | Team Sync & Blockers | 60 min | All |

### Deliverables

- ✅ `apps/web/components/generative/ErrorBoundary.tsx`
- ✅ `apps/web/components/generative/DynamicRenderer.tsx`
- ✅ 7 component stubs (Chart, Table, Form, Card, List, Slides, Report)
- ✅ `apps/web/components/generative/index.ts`
- ✅ TypeScript compilation passing (0 errors)
- ✅ Code reviewed

### Success Criteria

- ✅ DynamicRenderer accepts `ComponentSpec`
- ✅ Type routing works (spec.type → correct component)
- ✅ Props passing correctly
- ✅ Error handling for unknown types
- ✅ ErrorBoundary catches rendering errors

### Key Code References

See: `SPRINT3_DAY1_KICKOFF.md`

---

## 🎯 Day 2: Monday, Dec 22 - Charts & Forms (9 pts)

### Timeline (Parallel Work)

**Frontend Lead - Chart Component (5 pts)**:
| Time | Task | Duration |
|------|------|----------|
| 09:00 | Standup + Setup | 45 min |
| 09:45 | Recharts setup & docs | 30 min |
| 10:15 | Chart type mapping | 60 min |
| 11:15 | Data binding logic | 60 min |
| **12:15** | **LUNCH** | **60 min** |
| 13:15 | Legend + Tooltip | 60 min |
| 14:15 | Responsive design | 45 min |
| 15:00 | Tests | 60 min |
| 16:00 | Code review | 30 min |

**Backend Lead - Form Component (4 pts)**:
| Time | Task | Duration |
|------|------|----------|
| 09:00 | Standup + Setup | 45 min |
| 09:45 | React Hook Form setup | 30 min |
| 10:15 | Field type mapping | 60 min |
| 11:15 | Form submission handler | 60 min |
| **12:15** | **LUNCH** | **60 min** |
| 13:15 | Validation with Zod | 60 min |
| 14:15 | Error display | 45 min |
| 15:00 | Tests | 60 min |
| 16:00 | Code review | 30 min |

### Deliverables

**Chart Component**:
- ✅ `apps/web/components/generative/Chart/index.tsx`
- ✅ All 7 chart types rendering
- ✅ Data binding working
- ✅ Legend toggles visibility
- ✅ Tooltip shows on hover
- ✅ Responsive design verified
- ✅ 80%+ test coverage

**Form Component**:
- ✅ `apps/web/components/generative/Form/index.tsx`
- ✅ `apps/web/components/generative/Form/Field.tsx`
- ✅ All 9 field types rendering
- ✅ Form submission works
- ✅ Validation with Zod
- ✅ Error messages display
- ✅ 80%+ test coverage

### Success Criteria

**Chart**:
- ✅ Line chart renders
- ✅ Bar chart renders
- ✅ Pie chart renders
- ✅ Data from props displays correctly
- ✅ Legend clickable
- ✅ Responsive to container width

**Form**:
- ✅ Text field renders
- ✅ Email field validates
- ✅ Number field accepts numbers
- ✅ Select field shows options
- ✅ Submit button works
- ✅ Validation errors display

### Key Commands

```bash
# Install dependencies
pnpm add recharts
pnpm add react-hook-form

# Check types
pnpm build

# Run tests
pnpm test -- Chart
pnpm test -- Form
```

### Recharts Resources

- Chart types: https://recharts.org/
- Examples: https://recharts.org/en-US/examples
- API: https://recharts.org/en-US/api

### React Hook Form Resources

- Docs: https://react-hook-form.com/
- Examples: https://react-hook-form.com/form-builder
- Field validation: https://react-hook-form.com/form-builder/custom-validation

---

## 🎯 Day 3: Tuesday, Dec 23 - Tables & Reports (7 pts)

### Timeline (Parallel Work)

**Backend Lead - Table Component (4 pts)**:
| Time | Task | Duration |
|------|------|----------|
| 09:00 | Standup + Review | 45 min |
| 09:45 | Table structure | 60 min |
| 10:45 | Column rendering | 60 min |
| **11:45** | **LUNCH** | **60 min** |
| 12:45 | Sorting + Pagination | 90 min |
| 14:15 | Performance optimization | 45 min |
| 15:00 | Tests | 60 min |
| 16:00 | Code review | 30 min |

**Full-stack - Report Component (3 pts)**:
| Time | Task | Duration |
|------|------|----------|
| 09:00 | Standup + Review | 45 min |
| 09:45 | Section layout | 60 min |
| 10:45 | Metrics display | 45 min |
| **11:45** | **LUNCH** | **60 min** |
| 12:45 | Print styles | 60 min |
| 13:45 | PDF-ready formatting | 45 min |
| 14:30 | Tests | 60 min |
| 15:30 | Code review | 30 min |

### Deliverables

**Table Component**:
- ✅ `apps/web/components/generative/Table/index.tsx`
- ✅ Dynamic column rendering
- ✅ Sorting by clicking headers
- ✅ Pagination working
- ✅ Data types formatted correctly
- ✅ Striped rows option
- ✅ Hover highlight effect
- ✅ 80%+ test coverage

**Report Component**:
- ✅ `apps/web/components/generative/Report/index.tsx`
- ✅ Sections render correctly
- ✅ Metrics display with colors
- ✅ Print layout optimized
- ✅ Page breaks working
- ✅ Header + Footer display
- ✅ PDF-ready structure
- ✅ 80%+ test coverage

### Success Criteria

**Table**:
- ✅ Columns render from props
- ✅ Click header to sort
- ✅ Pagination buttons work
- ✅ Large datasets (1000+ rows) performant
- ✅ Data types display correctly
- ✅ Responsive on mobile

**Report**:
- ✅ Sections render
- ✅ Metrics show with status colors
- ✅ Print preview looks good
- ✅ Page breaks at right places
- ✅ Footer appears on each page

---

## 🎯 Day 4: Wednesday, Dec 24 - Cards, Lists, Slides (9 pts)

### Timeline (Parallel Work)

**Full-stack - Cards (3 pts)**:
| Time | Task | Duration |
|------|------|----------|
| 09:00 | Standup + Review | 45 min |
| 09:45 | Card layout | 45 min |
| 10:30 | 5 variants | 45 min |
| 11:15 | Icon + Image | 30 min |
| **11:45** | **LUNCH** | **60 min** |
| 12:45 | Styling | 45 min |
| 13:30 | Tests | 60 min |
| 14:30 | Code review | 30 min |

**Full-stack - Lists (3 pts)**:
| Time | Task | Duration |
|------|------|----------|
| 09:00 | Standup + Review | 45 min |
| 09:45 | ListItem component | 45 min |
| 10:30 | 3 variants | 45 min |
| 11:15 | Search/filter | 30 min |
| **11:45** | **LUNCH** | **60 min** |
| 12:45 | Selection handling | 45 min |
| 13:30 | Tests | 60 min |
| 14:30 | Code review | 30 min |

**Full-stack - Slides (3 pts)**:
| Time | Task | Duration |
|------|------|----------|
| 09:00 | Standup + Review | 45 min |
| 09:45 | Swiper setup | 45 min |
| 10:30 | Slide rendering | 45 min |
| 11:15 | Navigation | 30 min |
| **11:45** | **LUNCH** | **60 min** |
| 12:45 | Auto-play + Touch | 45 min |
| 13:30 | Tests | 60 min |
| 14:30 | Code review | 30 min |

### Deliverables

**Card Component**:
- ✅ `apps/web/components/generative/Card/index.tsx`
- ✅ 5 variants (default, success, warning, error, info)
- ✅ Icon support
- ✅ Image support
- ✅ Title + Content + Footer
- ✅ Hover effects
- ✅ 80%+ test coverage

**List Component**:
- ✅ `apps/web/components/generative/List/index.tsx`
- ✅ 3 variants (simple, card, interactive)
- ✅ Search filtering
- ✅ Selection support
- ✅ Avatar + Badge support
- ✅ Empty state handling
- ✅ 80%+ test coverage

**Slides Component**:
- ✅ `apps/web/components/generative/Slides/index.tsx`
- ✅ Slide rendering
- ✅ Navigation arrows
- ✅ Navigation dots
- ✅ Auto-play timer
- ✅ Keyboard shortcuts
- ✅ Touch/swipe support
- ✅ 80%+ test coverage

### Success Criteria

**Card**:
- ✅ All 5 variants display correctly
- ✅ Icon renders
- ✅ Image displays
- ✅ Hover effect visible

**List**:
- ✅ Items render
- ✅ Search filters items
- ✅ Selection toggles
- ✅ Avatars display

**Slides**:
- ✅ Slides display
- ✅ Navigation works
- ✅ Auto-play timer works
- ✅ Keyboard arrows work

---

## 🎯 Day 5: Thursday, Dec 25 - Testing & Polish (4 pts)

### Timeline

| Time | Task | Duration | Owner |
|------|------|----------|-------|
| 09:00 | Standup + Review Yesterday | 60 min | All |
| 10:00 | End-to-End Testing | 120 min | All |
| **12:00** | **LUNCH** | **60 min** | **All** |
| 13:00 | Fix Issues Found | 90 min | All |
| 14:30 | Documentation | 60 min | All |
| 15:30 | Final Code Review | 60 min | All |
| 16:30 | Wrap-up & Metrics | 30 min | All |

### Deliverables

- ✅ All 7 components rendering
- ✅ DynamicRenderer routing all types
- ✅ End-to-end flow working (chat → render)
- ✅ Props validation working
- ✅ Error boundaries protecting app
- ✅ > 80% test coverage
- ✅ Zero TypeScript errors
- ✅ Documentation complete
- ✅ Code reviewed
- ✅ Ready for Sprint 4

### End-to-End Test Plan

**Test 1: Chart Flow**
```
1. User: "Show me sales data"
2. Backend: Generates ComponentSpec with type: 'chart'
3. Frontend: Receives StreamChunk
4. DynamicRenderer: Routes to Chart component
5. Chart: Renders with data
Expected: Beautiful chart appears ✅
```

**Test 2: Form Flow**
```
1. User: "Create a contact form"
2. Backend: Generates ComponentSpec with type: 'form'
3. Frontend: Receives StreamChunk
4. DynamicRenderer: Routes to Form component
5. Form: Renders with fields
6. User: Submits form
Expected: Form submits and validates ✅
```

Similar tests for Table, Card, List, Slides, Report

### Documentation Checklist

- ✅ Component API documented
- ✅ Props reference complete
- ✅ Usage examples provided
- ✅ Accessibility notes added
- ✅ Performance tips documented
- ✅ Common patterns explained

### Sprint 3 Done Criteria

- ✅ All 7 components building
- ✅ DynamicRenderer working
- ✅ Props validation complete
- ✅ Error boundaries active
- ✅ Tests > 80%
- ✅ TypeScript 0 errors
- ✅ Documentation done
- ✅ Code reviewed
- ✅ No critical bugs
- ✅ Ready to merge main

---

## 🚀 Quick Daily Standup Template

**Every Standup** (9:00 AM):

**Person**: "I completed X story points yesterday"
**Update**: "I'm working on Y story points today"
**Blocker**: "I'm blocked by Z" (if any)
**Help**: "I need help with W" (if any)

---

## 📊 Tracking Progress

### Daily Metrics

Track in `SPRINT3_STATUS.md`:

```markdown
## Day 1 (Fri 12/19)
- Target: 4 pts (DynamicRenderer)
- Completed: 4 pts ✅
- Blocker: None

## Day 2 (Mon 12/22)
- Target: 9 pts (Charts + Forms)
- Completed: X pts
- Blocker: Y

...and so on
```

### Weekly Summary

By Friday evening, create summary:
- Total points completed
- Completed vs planned
- Blockers faced
- Lessons learned
- Ready for Sprint 4?

---

## 🎓 Common Issues & Solutions

### TypeScript Errors

**Issue**: `Cannot assign type X to type ComponentSpec`
**Solution**: Check props structure matches core.types.ts

**Issue**: `Property missing from props`
**Solution**: Verify all required props passed from DynamicRenderer

### Component Rendering Issues

**Issue**: Component shows "Unknown type"
**Solution**: Check spec.type matches componentMap key

**Issue**: Props not showing in component
**Solution**: Verify component accepts and destructures props

### Performance Issues

**Issue**: Large tables slow
**Solution**: Implement virtualization (React Window)

**Issue**: Charts slow to render
**Solution**: Memoize component, lazy load Recharts

---

## 📞 Escalation Path

**Stuck for 15 minutes?**
1. Check this document
2. Check COMPONENT_QUICK_START.md
3. Check core.types.ts
4. Ask team in standup

**Stuck for 30 minutes?**
1. Slack the team
2. Share code snippet
3. Describe the issue
4. Get help immediately

**Blocked by dependencies?**
1. Slack right away
2. Don't wait for standup
3. Ask for help immediately

---

## 🏆 Success Celebration

**After Day 1**: ✅ Foundation set, 7 components stubbed
**After Day 2**: ✅ Charts amazing, Forms powerful
**After Day 3**: ✅ Tables searchable, Reports ready
**After Day 4**: ✅ Cards beautiful, Lists interactive, Slides smooth
**After Day 5**: ✅ All working together, production ready!

---

**Document Version**: 1.0
**Created**: 2025-12-19
**Owner**: Engineering Lead
**Next**: Share daily with team, update daily

---

## 🚀 Let's Ship It!

**35 story points. 5 days. 7 components.**

**We've got this! Let's make something amazing!** 💪✨
