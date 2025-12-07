# Sprint 3 - Day 1 Kickoff
## Hôm Nay: Chuẩn Bị Hạ Tầng & DynamicRenderer

**Date**: 2025-12-19 (Friday)
**Goals**: 4 story points (DynamicRenderer working)
**Status**: 🔴 **STARTING NOW**

---

## 🎯 Mục Tiêu Hôm Nay

**Goal**: `DynamicRenderer.tsx` hoàn thành, có thể route tất cả 7 component types

**Deliverable**: Component factory hoạt động, sẵn sàng cho 7 components

**Success Criteria**:
- ✅ DynamicRenderer component created
- ✅ Component factory pattern implemented
- ✅ ErrorBoundary working
- ✅ Type routing verified
- ✅ Props passing correctly
- ✅ TypeScript strict mode passing

---

## 📋 Checklist Hôm Nay

### Phase 1: Setup & Preparation (09:00 - 10:00)

**Standup** (9:00 - 9:15):
- [ ] Team xác nhận mục tiêu hôm nay
- [ ] Frontend Lead: Charts responsibility confirmed
- [ ] Backend Lead: Forms responsibility confirmed
- [ ] Full-stack Dev: Cards/Lists/Slides responsibility confirmed

**Environment Setup** (9:15 - 9:45):
- [ ] Pull latest code: `git pull origin feat/e2-s1-dual-stream-handler`
- [ ] Run `pnpm install` (nếu cần)
- [ ] Run `pnpm build` - verify success
- [ ] Verify GEMINI_API_KEY set
- [ ] Run `pnpm dev` - verify no errors

**Create Directory Structure** (9:45 - 10:00):
```bash
mkdir -p apps/web/components/generative/{Chart,Table,Form,Card,List,Slides,Report}

# Tạo các file skeleton
touch apps/web/components/generative/Chart/index.tsx
touch apps/web/components/generative/Table/index.tsx
touch apps/web/components/generative/Form/index.tsx
touch apps/web/components/generative/Card/index.tsx
touch apps/web/components/generative/List/index.tsx
touch apps/web/components/generative/Slides/index.tsx
touch apps/web/components/generative/Report/index.tsx
touch apps/web/components/generative/DynamicRenderer.tsx
touch apps/web/components/generative/ErrorBoundary.tsx
touch apps/web/components/generative/index.ts
```

**Verify Structure**:
```bash
ls -la apps/web/components/generative/
# Phải thấy 10 files/folders vừa tạo
```

---

### Phase 2: DynamicRenderer Implementation (10:00 - 12:00)

**Step 1: Create ErrorBoundary** (10:00 - 10:30)

**File**: `apps/web/components/generative/ErrorBoundary.tsx`

```typescript
import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-red-700 mb-4">
              {this.state.error?.message || 'Unknown error'}
            </p>
            {this.props.fallback && (
              <div className="mt-4">{this.props.fallback}</div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Verify**: No TypeScript errors

---

**Step 2: Create Component Stubs** (10:30 - 11:00)

Mỗi component cần stub đơn giản cho hôm nay:

**File**: `apps/web/components/generative/Chart/index.tsx`

```typescript
import React from 'react';
import { ChartProps } from '@/types/core.types';

export const Chart: React.FC<ChartProps> = (props) => {
  return (
    <div className="chart-container p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h2 className="text-lg font-bold mb-2">Chart (Type: {props.chartType})</h2>
      <p className="text-sm text-gray-600">Chart component - Coming Soon</p>
      <pre className="mt-2 p-2 bg-gray-100 text-xs rounded overflow-auto">
        {JSON.stringify({ data: props.data?.length || 0 }, null, 2)}
      </pre>
    </div>
  );
};

Chart.displayName = 'Chart';
```

Làm tương tự cho:
- `Table/index.tsx`
- `Form/index.tsx`
- `Card/index.tsx`
- `List/index.tsx`
- `Slides/index.tsx`
- `Report/index.tsx`

Mỗi component tạm thời hiển thị:
- Component name
- Props data
- Placeholder "Coming Soon"

---

**Step 3: Create DynamicRenderer** (11:00 - 12:00)

**File**: `apps/web/components/generative/DynamicRenderer.tsx`

```typescript
import React, { useMemo } from 'react';
import { ComponentSpec } from '@/types/core.types';

// Import all components
import { Chart } from './Chart';
import { Table } from './Table';
import { Form } from './Form';
import { Card } from './Card';
import { List } from './List';
import { Slides } from './Slides';
import { Report } from './Report';
import { ErrorBoundary } from './ErrorBoundary';

// Define component map type-safely
type ComponentMapType = {
  [K in ComponentSpec['type']]: React.ComponentType<any>;
};

// Create component factory
const componentMap: ComponentMapType = {
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
  className?: string;
}

/**
 * DynamicRenderer
 * Routes component specs to appropriate React components
 *
 * Usage:
 * ```tsx
 * const spec: ComponentSpec = {
 *   type: 'chart',
 *   id: 'chart_1',
 *   props: { chartType: 'line', data: [...] }
 * };
 * <DynamicRenderer spec={spec} />
 * ```
 */
export const DynamicRenderer: React.FC<DynamicRendererProps> = ({
  spec,
  onError,
  className = '',
}) => {
  // Type-safe component lookup
  const Component = useMemo(() => {
    return componentMap[spec.type];
  }, [spec.type]);

  // Fallback for unknown types
  if (!Component) {
    const error = new Error(
      `Unknown component type: "${spec.type}". Valid types: ${Object.keys(componentMap).join(', ')}`
    );
    onError?.(error);
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm font-medium text-yellow-900">
          Unknown component type: {spec.type}
        </p>
      </div>
    );
  }

  // Render component with error boundary
  return (
    <ErrorBoundary onError={onError}>
      <div className={className}>
        <Component {...spec.props} />
      </div>
    </ErrorBoundary>
  );
};

DynamicRenderer.displayName = 'DynamicRenderer';

// Export component map for testing
export { componentMap };
```

---

### Phase 3: Create Export Index (12:00 - 12:15)

**File**: `apps/web/components/generative/index.ts`

```typescript
// Export all components
export { Chart } from './Chart';
export { Table } from './Table';
export { Form } from './Form';
export { Card } from './Card';
export { List } from './List';
export { Slides } from './Slides';
export { Report } from './Report';

// Export renderer
export { DynamicRenderer } from './DynamicRenderer';
export type { DynamicRendererProps } from './DynamicRenderer';

// Export error boundary
export { ErrorBoundary } from './ErrorBoundary';
```

---

### Phase 4: Testing & Verification (12:15 - 13:00)

**Lunch Break**: 13:00 - 14:00 (mang theo laptop nếu có issue)

**Test 1: TypeScript Compilation**
```bash
pnpm build
# ✅ Should pass with 0 errors
```

**Test 2: Type Safety**
```bash
# Verify DynamicRenderer accepts ComponentSpec correctly
# Check: spec.type is narrowed properly
# Check: props match component type
```

**Test 3: Manual Test (Optional)**
```bash
pnpm dev
# Open http://localhost:3000
# Verify no console errors
```

**Test 4: Component Props Validation**
Create test file (optional for today): `apps/web/components/generative/__tests__/DynamicRenderer.test.tsx`

```typescript
import { render } from '@testing-library/react';
import { DynamicRenderer } from '../DynamicRenderer';
import { ComponentSpec } from '@/types/core.types';

describe('DynamicRenderer', () => {
  it('should render chart component', () => {
    const spec: ComponentSpec = {
      type: 'chart',
      id: 'test_chart',
      props: {
        chartType: 'line',
        data: [{ x: 1, y: 2 }],
      },
    };

    const { container } = render(<DynamicRenderer spec={spec} />);
    expect(container.querySelector('.chart-container')).toBeInTheDocument();
  });

  it('should render error for unknown type', () => {
    const spec = {
      type: 'unknown',
      id: 'test',
      props: {},
    } as ComponentSpec;

    const { container } = render(<DynamicRenderer spec={spec} />);
    expect(container.textContent).toContain('Unknown component type');
  });
});
```

---

## 🔄 Afternoon: Review & Prepare (14:00 - 17:00)

### 14:00 - 14:30: Code Review
- [ ] Review DynamicRenderer implementation
- [ ] Check ErrorBoundary properly catches errors
- [ ] Verify component stubs have correct structure
- [ ] Check TypeScript strict mode passing

### 14:30 - 15:00: Documentation
- [ ] Add JSDoc comments to DynamicRenderer
- [ ] Document component map structure
- [ ] Add usage examples
- [ ] Comment error handling

### 15:00 - 16:00: Tomorrow Preparation

**Frontend Lead** (Charts):
- [ ] Read Recharts documentation
- [ ] Understand 7 chart types
- [ ] Plan data binding strategy
- [ ] Prepare test data

**Backend Lead** (Forms):
- [ ] Read React Hook Form docs
- [ ] Understand form submission flow
- [ ] Plan field type mapping
- [ ] Review Zod validation

**Full-stack** (Cards/Lists/Slides):
- [ ] Plan component layouts
- [ ] Review CSS approach
- [ ] Prepare styling strategy

### 16:00 - 17:00: Team Sync
- [ ] Verify all components stubbed correctly
- [ ] Confirm DynamicRenderer working
- [ ] Review tomorrow's plan
- [ ] Address any blockers

---

## ✅ Definition of Done for Day 1

**DynamicRenderer is DONE when**:

- ✅ `apps/web/components/generative/DynamicRenderer.tsx` exists
- ✅ ErrorBoundary component created
- ✅ Component stubs for all 7 types created
- ✅ Component map type-safe (TypeScript enforces it)
- ✅ Props passing correctly to components
- ✅ Error handling for unknown types works
- ✅ TypeScript compilation passes (0 errors)
- ✅ No console warnings or errors
- ✅ Export index created
- ✅ Code commented and documented

---

## 📊 Success Metrics

| Metric | Target | Verification |
|--------|--------|--------------|
| TypeScript Errors | 0 | `pnpm build` passes |
| DynamicRenderer working | ✅ | Can accept ComponentSpec |
| All 7 stubs created | ✅ | Folder structure correct |
| Error boundary catches errors | ✅ | Try passing bad type |
| Props routing correct | ✅ | Props match component signature |

---

## 🎯 Tomorrow's Plan (Monday, Dec 22)

### Frontend Lead - Chart Component (5 pts)
- [ ] Install Recharts: `pnpm add recharts`
- [ ] Implement 7 chart types
- [ ] Data binding logic
- [ ] Legend support
- [ ] Tooltip support
- [ ] Responsive design

### Backend Lead - Form Component (4 pts)
- [ ] Install React Hook Form: `pnpm add react-hook-form`
- [ ] Implement 9 field types
- [ ] Form submission handler
- [ ] Validation with Zod
- [ ] Error display

### Full-stack - Setup Common
- [ ] CSS modules setup
- [ ] Tailwind utilities
- [ ] Performance optimization patterns

---

## 📞 Quick Reference

### If You Get Stuck
1. Check `COMPONENT_QUICK_START.md`
2. Review `core.types.ts` for props
3. Look at this document for code examples
4. Ask team in Slack/standup

### Common Commands
```bash
# Check types
pnpm build

# Run dev server
pnpm dev

# Run tests
pnpm test

# TypeScript check
pnpm type-check
```

---

## 🚨 Critical Success Factors

1. **DynamicRenderer type-safe** ← Most important
   - Must be impossible to pass wrong props to component
   - TypeScript should catch errors at compile time

2. **Error handling** ← Second most important
   - Unknown types show error, don't crash app
   - ErrorBoundary catches rendering errors

3. **Component stubs** ← Foundation
   - Must match component type signatures
   - Props must be passable to real implementations tomorrow

---

## 📝 Notes for Team

**Communication**:
- Daily standup: 9:00 AM
- Code review: Before 5 PM
- Blockers: Report immediately (Slack/chat)

**Git Workflow**:
- Push to `feat/e2-s1-dual-stream-handler` branch
- Create PR when ready for review
- Don't merge until code reviewed

**Code Standards**:
- TypeScript strict mode enabled
- No console.log in production code
- Comments for non-obvious logic
- Proper error handling

---

**Document Version**: 1.0
**Created**: 2025-12-19
**Owner**: Engineering Lead
**Status**: 🔴 **SPRINT 3 DAY 1 KICKOFF**

---

## Next: Execute Today's Plan

Start with standup at 9:00 AM! 🚀

**4 story points. 1 day. Component factory ready.**

Let's go! 💪
