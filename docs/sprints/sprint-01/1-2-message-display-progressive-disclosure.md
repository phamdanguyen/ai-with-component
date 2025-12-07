# Story 1-2: Message Display & Progressive Disclosure

## Story Info
- **Epic**: E1 - Core Chat Experience
- **Story ID**: 1-2
- **Title**: Message Display & Progressive Disclosure
- **Priority**: P0 Critical
- **Points**: 5
- **Status**: in-progress

---

## User Story

**As a** user
**I want to** see message text immediately, with optional component in expandable section
**So that** I can read quickly or dive into details

---

## Acceptance Criteria

- [ ] User message displays in right-aligned bubble
- [ ] Assistant message displays in left-aligned bubble
- [ ] Text summary visible by default
- [ ] "Xem chi tiết" button appears if component available
- [ ] Clicking button expands component below text
- [ ] Component can collapse back (hide)
- [ ] Multiple messages with components don't lag
- [ ] Hover message shows "copy" and "delete" options (future)

---

## Technical Details

### Files to Modify/Create
```
apps/web/components/chat/MessageWithComponent.tsx
apps/web/components/chat/ChatInterface.tsx
apps/web/components/generative/DynamicRenderer.tsx
```

### Component Props
```typescript
interface MessageWithComponentProps {
  role: 'user' | 'assistant';
  content: string;
  componentSpec?: ComponentSpec;
  timestamp?: Date;
}
```

### ComponentSpec Format
```typescript
interface ComponentSpec {
  type: 'Chart' | 'Table' | 'Card' | 'Form' | 'List' | 'Slides' | 'Report';
  props: Record<string, any>;
}
```

---

## Current Issues (Blockers)

### BLOCKER-002: Components Not Rendering
- **Problem**: Components not appearing in chat conversation
- **Impact**: Cannot demo F3 (7 Components) - CORE FEATURE
- **Root Cause**: Unknown - need debugging

### Investigation Needed
1. Is `componentSpec` being received from API?
2. Is `DynamicRenderer` being called with correct props?
3. Are there console errors during render?
4. Is the expand/collapse state working?

---

## Tasks

### Task 1: Debug Component Flow
- [ ] Add console.log to trace componentSpec from API to render
- [ ] Check browser console for errors
- [ ] Verify DynamicRenderer is mounting
- [ ] Check if componentSpec format is correct

### Task 2: Fix MessageWithComponent
- [ ] Ensure componentSpec is passed correctly
- [ ] Implement expand/collapse state
- [ ] Add "Xem chi tiết" button
- [ ] Style expand animation

### Task 3: Implement Progressive Disclosure
- [ ] Component hidden by default (collapsed)
- [ ] Button to expand/show component
- [ ] Button to collapse/hide component
- [ ] Smooth animation (fade-in)

### Task 4: Test Integration
- [ ] Test with Chart component
- [ ] Test with Table component
- [ ] Test multiple messages with components
- [ ] Test performance with 10+ messages

---

## UI Design

### Message Bubble (Assistant with Component)
```
┌─────────────────────────────────────┐
│ [Avatar] Assistant                  │
│                                     │
│ Here's the sales data you asked for.│
│ Revenue increased 15% this quarter. │
│                                     │
│ [Xem chi tiết ▼]                   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │        [Chart Component]        │ │  ← Expanded
│ │         (if expanded)           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Collapsed State
```
┌─────────────────────────────────────┐
│ [Avatar] Assistant                  │
│                                     │
│ Here's the sales data you asked for.│
│                                     │
│ [Xem chi tiết ▼]                   │  ← Clickable
└─────────────────────────────────────┘
```

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Components render correctly in chat
- [ ] Expand/collapse works smoothly
- [ ] No console errors
- [ ] Performance acceptable (no lag with 10+ messages)
- [ ] E2E tests passing

---

## Dependencies

- **Depends On**: E1.S1 (Chat UI), E3 (Components available)
- **Blocks**: Full component integration demo

---

## Notes

This story is **CRITICAL** for the sprint goal. The component rendering pipeline must work end-to-end:
1. API returns componentSpec
2. ChatInterface receives it
3. MessageWithComponent displays it
4. DynamicRenderer renders correct component
5. User can expand/collapse
