# Component Quick Start Guide
## Hướng Dẫn Nhanh Xây Dựng Từng Component

**Date**: 2025-12-05
**Target**: Sprint 3 (Dec 19-25)

---

## 🎯 Quick Reference: What Each Component Needs

### Chart Component (5 pts) ⭐ MOST COMPLEX

**What it does**: Renders data visualizations (7 types)

**Tech Stack**: Recharts

**Key Props**:
```typescript
{
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'radar' | 'combo',
  data: Array<Record<string, unknown>>,
  xAxis: { key: string, label?: string },
  yAxis: { key: string, label?: string },
  title?: string,
  showLegend?: boolean,
  showTooltip?: boolean,
  responsive?: boolean
}
```

**Implementation Steps**:
1. Install Recharts: `pnpm add recharts`
2. Create mapping: chart type → Recharts component
3. Extract data key names from props
4. Render appropriate chart
5. Add legend and tooltip
6. Handle empty data

**Test Data**:
```json
{
  "chartType": "line",
  "data": [
    { "month": "Jan", "value": 100 },
    { "month": "Feb", "value": 150 }
  ],
  "xAxis": { "key": "month" },
  "yAxis": { "key": "value" }
}
```

**Challenge**: Supporting 7 different chart types
**Difficulty**: ⭐⭐⭐⭐⭐

---

### Form Component (4 pts)

**What it does**: Renders interactive forms with validation

**Tech Stack**: React Hook Form + Zod

**Key Props**:
```typescript
{
  title?: string,
  fields: Array<{
    name: string,
    label: string,
    type: 'text' | 'email' | 'password' | 'number' | 'date' | 'checkbox' | 'radio' | 'select' | 'textarea',
    required?: boolean,
    validation?: { pattern?: string, minLength?: number }
  }>,
  submitLabel?: string,
  layout?: 'vertical' | 'horizontal'
}
```

**Implementation Steps**:
1. Install React Hook Form: `pnpm add react-hook-form`
2. Create Field component for each type
3. Implement form validation with Zod
4. Handle form submission
5. Display validation errors
6. Support vertical/horizontal layouts

**Test Data**:
```json
{
  "title": "Contact Form",
  "fields": [
    {
      "name": "email",
      "label": "Email",
      "type": "email",
      "required": true
    }
  ]
}
```

**Challenge**: Supporting 9 field types + validation
**Difficulty**: ⭐⭐⭐⭐

---

### Table Component (4 pts)

**What it does**: Renders tabular data with sorting/pagination

**Tech Stack**: React + CSS

**Key Props**:
```typescript
{
  columns: Array<{
    key: string,
    label: string,
    type?: 'text' | 'number' | 'date' | 'status',
    sortable?: boolean
  }>,
  data: Array<Record<string, unknown>>,
  striped?: boolean,
  hover?: boolean,
  pagination?: { enabled: boolean, pageSize?: number }
}
```

**Implementation Steps**:
1. Create table header from columns
2. Create table rows from data
3. Implement sorting on click
4. Implement pagination logic
5. Format values by type
6. Add striping/hover effects

**Test Data**:
```json
{
  "columns": [
    { "key": "id", "label": "ID", "type": "number", "sortable": true },
    { "key": "name", "label": "Name", "type": "text" }
  ],
  "data": [
    { "id": 1, "name": "Alice" }
  ]
}
```

**Challenge**: Handling large datasets efficiently
**Difficulty**: ⭐⭐⭐

---

### Card Component (3 pts)

**What it does**: Display content in card container

**Tech Stack**: React + CSS Modules

**Key Props**:
```typescript
{
  title?: string,
  content: string,
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info',
  icon?: string,
  image?: string,
  footer?: string
}
```

**Implementation Steps**:
1. Create variants (5 color themes)
2. Render title, content, footer
3. Style based on variant
4. Add icon if provided
5. Add image if provided
6. Add hover effects

**Test Data**:
```json
{
  "title": "Success",
  "content": "Data saved successfully",
  "variant": "success",
  "icon": "check"
}
```

**Challenge**: Consistent styling across variants
**Difficulty**: ⭐⭐

---

### List Component (3 pts)

**What it does**: Render list of items with variants

**Tech Stack**: React + CSS

**Key Props**:
```typescript
{
  items: Array<{
    id: string,
    title: string,
    description?: string,
    icon?: string,
    badge?: string,
    avatar?: string
  }>,
  variant?: 'simple' | 'card' | 'interactive',
  selectable?: boolean,
  searchable?: boolean
}
```

**Implementation Steps**:
1. Create ListItem component
2. Implement 3 variants
3. Add search filtering
4. Add selection handling
5. Render badges/avatars
6. Handle empty state

**Test Data**:
```json
{
  "items": [
    {
      "id": "1",
      "title": "Alice",
      "description": "Developer",
      "avatar": "https://..."
    }
  ],
  "variant": "card"
}
```

**Challenge**: Search/filter performance
**Difficulty**: ⭐⭐

---

### Slides Component (3 pts)

**What it does**: Display carousel/slideshow

**Tech Stack**: Swiper

**Key Props**:
```typescript
{
  slides: Array<{
    id: string,
    title: string,
    content: string,
    image?: string,
    backgroundColor?: string
  }>,
  autoPlay?: boolean,
  autoPlayInterval?: number,
  showNavigationArrows?: boolean,
  showNavigationDots?: boolean
}
```

**Implementation Steps**:
1. Install Swiper: `pnpm add swiper`
2. Create Slide component
3. Implement navigation
4. Add auto-play timer
5. Handle keyboard shortcuts
6. Add touch/swipe support

**Test Data**:
```json
{
  "slides": [
    {
      "id": "1",
      "title": "Feature 1",
      "content": "Description",
      "image": "https://..."
    }
  ],
  "autoPlay": true,
  "autoPlayInterval": 5000
}
```

**Challenge**: Touch/swipe handling on mobile
**Difficulty**: ⭐⭐

---

### Report Component (3 pts)

**What it does**: Display document-style report

**Tech Stack**: React + CSS (print-friendly)

**Key Props**:
```typescript
{
  title: string,
  summary?: string,
  sections: Array<{
    id: string,
    title: string,
    content?: string,
    metrics?: Array<{
      label: string,
      value: string | number,
      status?: 'positive' | 'neutral' | 'negative'
    }>
  }>,
  footer?: string,
  printable?: boolean
}
```

**Implementation Steps**:
1. Create Section component
2. Create Metrics display
3. Add print styles
4. Implement page breaks
5. Add header/footer
6. Style for PDF export

**Test Data**:
```json
{
  "title": "Monthly Report",
  "sections": [
    {
      "title": "Summary",
      "content": "Text here",
      "metrics": [
        { "label": "Revenue", "value": "$1M", "status": "positive" }
      ]
    }
  ]
}
```

**Challenge**: PDF-ready formatting
**Difficulty**: ⭐⭐

---

## 🏗️ DynamicRenderer Setup (4 pts)

**What it does**: Routes component specs to right components

**Key Code**:
```typescript
// apps/web/components/generative/DynamicRenderer.tsx

import { ComponentSpec } from '@/types/core.types';
import { Chart } from './Chart';
import { Table } from './Table';
import { Form } from './Form';
import { Card } from './Card';
import { List } from './List';
import { Slides } from './Slides';
import { Report } from './Report';
import { ErrorBoundary } from './ErrorBoundary';

type ComponentMap = {
  [K in ComponentSpec['type']]: React.ComponentType<any>;
};

const componentMap: ComponentMap = {
  chart: Chart,
  table: Table,
  form: Form,
  card: Card,
  list: List,
  slides: Slides,
  report: Report,
};

export interface DynamicRendererProps {
  spec: ComponentSpec;
  onError?: (error: Error) => void;
}

export const DynamicRenderer: React.FC<DynamicRendererProps> = ({ spec, onError }) => {
  try {
    const Component = componentMap[spec.type];

    if (!Component) {
      throw new Error(`Unknown component type: ${spec.type}`);
    }

    return (
      <ErrorBoundary onError={onError}>
        <Component {...spec.props} />
      </ErrorBoundary>
    );
  } catch (error) {
    onError?.(error as Error);
    return <div className="error">Failed to render component</div>;
  }
};
```

---

## 📋 Component Checklist Template

Use this for each component:

### Component: [Name]

**Prerequisites**:
- [ ] Understand props structure
- [ ] Know test data format
- [ ] Review example data

**Setup** (30 min):
- [ ] Create directory structure
- [ ] Install dependencies
- [ ] Create index.tsx file
- [ ] Define component interface

**Implementation** (2-3 hours):
- [ ] Create component skeleton
- [ ] Implement rendering logic
- [ ] Add props binding
- [ ] Add error handling
- [ ] Add styling

**Testing** (1 hour):
- [ ] Write unit tests
- [ ] Test with sample data
- [ ] Test error cases
- [ ] Test responsive design

**Validation** (30 min):
- [ ] Props validation with Zod
- [ ] Error boundary integration
- [ ] DynamicRenderer routing
- [ ] Type safety check

**Polish** (30 min):
- [ ] Documentation
- [ ] Accessibility check
- [ ] Performance optimization
- [ ] Code review

**Total per component**: 5-6 hours

---

## 🚀 Getting Started

### Step 1: Understand the System (30 min)
```bash
# Read these files in order
1. docs/SPRINT_SUMMARY.md
2. packages/middleware/src/types/core.types.ts
3. docs/SPRINT3_KICKOFF.md
```

### Step 2: Setup Environment (30 min)
```bash
# Install dependencies
pnpm add recharts react-hook-form swiper zod

# Create directory structure
mkdir -p apps/web/components/generative/{Chart,Table,Form,Card,List,Slides,Report}
```

### Step 3: Implement DynamicRenderer (1 hour)
```bash
# This unblocks all other components
# File: apps/web/components/generative/DynamicRenderer.tsx
# Reference: Code example above
```

### Step 4: Implement Components in Parallel (3 days)
```bash
# Day 1: Charts (hardest, start early)
# Day 2: Forms, Tables (parallel work)
# Day 3: Cards, Lists, Slides (easier, parallel)
# Day 4: Testing, Polish
```

---

## 📚 Important Files to Reference

| File | Purpose | Read Time |
|------|---------|-----------|
| `core.types.ts` | All component specs | 15 min |
| `SPRINT3_KICKOFF.md` | Detailed requirements | 20 min |
| `SPRINT2_FINAL_SUMMARY.md` | Architecture | 15 min |
| `SPRINT3_PREPARATION.md` | Setup checklist | 10 min |
| Library docs (Recharts, etc.) | Implementation help | 20 min |

**Total**: ~90 minutes to be fully prepared

---

## 🎯 Daily Goals Template

**Morning Standup** (9:00 AM):
- What did I complete yesterday?
- What will I complete today?
- Do I have any blockers?

**Work Sessions**:
- 9:30-12:00: Implementation (2.5 hours)
- 12:00-13:00: Lunch
- 13:00-15:30: Implementation (2.5 hours)
- 15:30-16:00: Code review + testing
- 16:00-17:00: Polish + documentation

**Evening**:
- Update SPRINT3_STATUS.md
- Mark completed tasks
- Plan next day

---

## 💬 Quick Questions Cheat Sheet

**Q: How do I access component props?**
A: `const Chart: React.FC<ChartProps> = (props) => { console.log(props.data) }`

**Q: How do I test a component?**
A: Use React Testing Library + Jest. Mock Recharts/Form libraries.

**Q: How do I handle errors?**
A: Wrap in ErrorBoundary, show fallback UI, log to console.

**Q: How do I optimize performance?**
A: Use React.memo for items, virtualization for large lists, lazy load heavy libs.

**Q: How do I validate props?**
A: Use Zod schemas, validate in component or parent.

**Q: How do I make it responsive?**
A: Use Tailwind's responsive classes (sm:, md:, lg:) or CSS media queries.

**Q: What if a library isn't compatible?**
A: Check next.js 16 compatibility, try alternatives (Victory vs Recharts, etc.)

---

## ✅ Success = Shipped

A component is **shipped** when:
- ✅ Renders with sample data
- ✅ No TypeScript errors
- ✅ Tests pass (80%+ coverage)
- ✅ Works in DynamicRenderer
- ✅ Responsive design verified
- ✅ Accessibility checked
- ✅ Documentation complete
- ✅ Code reviewed

---

## 🎓 Real-World Example: Chart Component

**User asks**: "Show me a line chart of monthly revenue"

**Flow**:
1. Backend generates: `ChartProps` with data
2. Backend sends: `ComponentSpec` with `type: 'chart'`
3. Frontend receives: `StreamChunk` with component spec
4. Frontend renders: `<DynamicRenderer spec={componentSpec} />`
5. DynamicRenderer routes to: `<Chart {...props} />`
6. Chart component renders: `<LineChart data={data}><Line dataKey="revenue" /></LineChart>`
7. User sees: Beautiful line chart with legend and tooltip

**Magic**: All this happens in < 500ms!

---

**Document Version**: 1.0
**Created**: 2025-12-05
**Owner**: Engineering Lead
**Next**: Read SPRINT3_KICKOFF.md for component specs

**Ready to build? Let's go! 🚀**
