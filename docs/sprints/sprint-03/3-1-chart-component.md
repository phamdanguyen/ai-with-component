# Story 3-1: Chart Component

## Story Info
- **Epic**: E3 - Component Library
- **Story ID**: 3-1
- **Title**: Chart Component
- **Priority**: P0 Critical
- **Points**: 5
- **Status**: in-progress (60% complete)

---

## User Story

**As a** user
**I want to** see interactive charts (line, bar, pie, etc.)
**So that** I can visualize data trends

---

## Acceptance Criteria

- [ ] Component renders: `<ChartComponent chartType="line" data={[...]} />`
- [ ] Supported chart types: line, bar, area, pie, scatter, radar, combo
- [ ] Data prop: array of objects
- [ ] xAxis/yAxis: configurable key + label
- [ ] Colors customizable
- [ ] Legend toggleable
- [ ] Tooltip on hover (show exact values)
- [ ] Responsive (mobile-friendly)
- [ ] Height adjustable (default 400px)
- [ ] Error boundary: render fallback if Recharts error
- [ ] Storybook story created with examples

---

## Technical Details

### Files
```
apps/web/components/generative/Chart/ChartComponent.tsx
apps/web/components/generative/Chart/index.ts
```

### Props Interface
```typescript
interface ChartComponentProps {
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'radar' | 'combo';
  data: Array<Record<string, any>>;
  xAxis?: { key: string; label?: string };
  yAxis?: { key: string; label?: string };
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  title?: string;
}
```

### Library
- **Recharts** - React charting library

---

## Current Status

### Working (80%)
- Basic line/bar/area charts render
- Data binding works
- Responsive sizing

### Not Working (20%)
- Tooltip on hover inconsistent
- Some chart types not fully implemented
- Error boundary missing

---

## Tasks

### Task 1: Verify Current Implementation
- [ ] Test all 7 chart types
- [ ] Verify data binding for each type
- [ ] Check responsive behavior
- [ ] Document what's working vs broken

### Task 2: Fix Tooltip
- [ ] Ensure tooltip shows on hover
- [ ] Format tooltip values properly
- [ ] Test on mobile (touch)

### Task 3: Complete Missing Chart Types
- [ ] Verify scatter chart
- [ ] Verify radar chart
- [ ] Implement combo chart (if missing)

### Task 4: Add Error Boundary
- [ ] Wrap chart in error boundary
- [ ] Show fallback UI on error
- [ ] Log error details

### Task 5: Testing
- [ ] Unit tests for prop validation
- [ ] E2E test for rendering
- [ ] Storybook stories for all types

---

## Example Usage

```tsx
// Line Chart
<ChartComponent
  chartType="line"
  data={[
    { month: 'Jan', sales: 100, profit: 20 },
    { month: 'Feb', sales: 150, profit: 35 },
    { month: 'Mar', sales: 200, profit: 50 },
  ]}
  xAxis={{ key: 'month', label: 'Month' }}
  yAxis={{ key: 'sales', label: 'Sales ($)' }}
  showLegend={true}
  showTooltip={true}
  height={400}
/>

// Pie Chart
<ChartComponent
  chartType="pie"
  data={[
    { name: 'Product A', value: 400 },
    { name: 'Product B', value: 300 },
    { name: 'Product C', value: 200 },
  ]}
  colors={['#8884d8', '#82ca9d', '#ffc658']}
/>
```

---

## Definition of Done

- [ ] All 7 chart types render correctly
- [ ] Tooltip works on hover
- [ ] Responsive on mobile
- [ ] Error boundary catches errors
- [ ] Storybook stories complete
- [ ] E2E tests passing

---

## Dependencies

- **Depends On**: DynamicRenderer support
- **Blocks**: Full component demo

---

## Notes

Chart is one of the most important components. Must work reliably for the demo. Focus on line, bar, and pie charts first as they are most commonly used.
