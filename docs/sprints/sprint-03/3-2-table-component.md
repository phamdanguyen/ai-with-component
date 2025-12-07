# Story 3-2: Table Component

## Story Info
- **Epic**: E3 - Component Library
- **Story ID**: 3-2
- **Title**: Table Component
- **Priority**: P0 Critical
- **Points**: 5
- **Status**: in-progress (50% complete)

---

## User Story

**As a** user
**I want to** see structured data in interactive tables
**So that** I can browse and sort results

---

## Acceptance Criteria

- [ ] Component renders: `<TableComponent columns={[...]} data={[...]} />`
- [ ] Columns: configurable key, label, width, sortable flag, type
- [ ] Data: array of objects
- [ ] Sortable: Click header to sort (if sortable=true)
- [ ] Pagination: Show X rows per page (if enabled)
- [ ] Striped rows: Alternate row colors
- [ ] Hover: Highlight row on hover
- [ ] Mobile: Horizontal scroll on small screens
- [ ] Empty state: Show message if no data
- [ ] Responsive layout
- [ ] Storybook story with examples

---

## Technical Details

### Files
```
apps/web/components/generative/Table/TableComponent.tsx
apps/web/components/generative/Table/index.ts
```

### Props Interface
```typescript
interface TableColumn {
  key: string;
  label: string;
  width?: string | number;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'currency';
  align?: 'left' | 'center' | 'right';
}

interface TableComponentProps {
  columns: TableColumn[];
  data: Array<Record<string, any>>;
  striped?: boolean;
  hoverable?: boolean;
  pagination?: {
    enabled: boolean;
    pageSize: number;
  };
  emptyMessage?: string;
  title?: string;
}
```

### Library
- Native HTML `<table>` or TanStack Table

---

## Current Status

### Working (60%)
- Basic table structure renders
- Columns and data binding
- Basic styling

### Not Working (40%)
- Sorting not implemented
- Pagination not implemented
- Striped rows missing
- Mobile horizontal scroll broken

---

## Tasks

### Task 1: Verify Current Implementation
- [ ] Test basic table rendering
- [ ] Check column configuration
- [ ] Verify data binding
- [ ] Test with different data sizes

### Task 2: Implement Sorting
- [ ] Add click handler to sortable headers
- [ ] Sort data by column (asc/desc)
- [ ] Show sort indicator arrow
- [ ] Handle different data types

### Task 3: Implement Pagination
- [ ] Add pagination controls
- [ ] Show page numbers
- [ ] Previous/Next buttons
- [ ] Configurable page size

### Task 4: Fix Styling
- [ ] Striped rows (odd/even)
- [ ] Hover highlight
- [ ] Mobile horizontal scroll
- [ ] Empty state message

### Task 5: Testing
- [ ] Unit tests for sorting logic
- [ ] E2E test for rendering
- [ ] Test with large datasets (100+ rows)
- [ ] Storybook stories

---

## Example Usage

```tsx
<TableComponent
  columns={[
    { key: 'id', label: 'ID', width: 80, sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'amount', label: 'Amount', type: 'currency', align: 'right', sortable: true },
  ]}
  data={[
    { id: 1, name: 'John Doe', email: 'john@example.com', amount: 1500 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', amount: 2300 },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', amount: 890 },
  ]}
  striped={true}
  hoverable={true}
  pagination={{ enabled: true, pageSize: 10 }}
  emptyMessage="No data available"
/>
```

---

## Definition of Done

- [ ] Table renders with columns and data
- [ ] Sorting works on sortable columns
- [ ] Pagination works correctly
- [ ] Striped and hover styling applied
- [ ] Mobile horizontal scroll works
- [ ] Empty state shows message
- [ ] Storybook stories complete
- [ ] E2E tests passing

---

## Dependencies

- **Depends On**: DynamicRenderer support
- **Blocks**: Full component demo

---

## Notes

Table is essential for displaying structured data. Focus on getting sorting and pagination working as these are the most requested features.
