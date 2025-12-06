# Crayon UI SDK Integration

SuperChat integrates with [Crayon](https://crayonai.org/) - Thesys's Generative UI SDK for building AI agent interfaces.

## Overview

Crayon provides 27+ pre-built components optimized for AI chat applications:
- **Data Visualization**: LineChart, BarChart, PieChart, AreaChart, RadarChart, RadialChart
- **Display**: TextContent, Callout, Images, Tags, Lists, Tables, Accordions, Steps, CodeBlocks, Tabs
- **Forms**: Input, Select, RadioGroup, CheckboxGroup, Slider, DatePicker
- **Triggers**: Button, FollowUp, SwitchGroup, ToggleGroup

## Architecture

```
SuperChat
    |
    +-- Layout Layer (MUI)
    |   +-- Header, Layout, Footer (kept as-is)
    |
    +-- Chat Layer (CRAYON) <-- NEW
    |   +-- CrayonRenderer v2.0
    |   |   +-- Uses individual Crayon components (Card, Table, Carousel, etc.)
    |   |   +-- Falls back to legacy components for custom types (QR Payment, etc.)
    |   |
    |   +-- Adapters
    |       +-- CrayonAdapter: Odoo v9.x format detection + normalization
    |       +-- ActionHandler: Bridge actions to Odoo API
    |
    +-- Business Components (kept as-is)
        +-- QRPaymentComponent
        +-- InsuranceCheckoutForm
        +-- ProductCarousel
```

## Important Note (v2.0.0)

The Crayon SDK v0.9.4 does NOT include `C1Component`. The documentation and examples
may reference it, but it's not available in the package. Instead, we use individual
Crayon components directly:

- `Card`, `CardHeader`
- `Carousel`, `CarouselContent`, `CarouselItem`
- `ListBlock`, `ListItem`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- `Button`, `FollowUpBlock`, `FollowUpItem`
- `ImageGallery`, `TextContent`, `Callout`

## Installation

Packages installed:
```bash
# Core Crayon
@crayonai/react-core@^0.7.6
@crayonai/react-ui@^0.9.4
@crayonai/stream@^0.6.4

# Peer dependencies
zustand@^4.5.5
eventsource-parser@^3.0.0
tailwind-merge@^2.5.4
tailwindcss-animate@^1.0.7
tiny-invariant@^1.3.3
```

## Usage

### Basic Usage

```jsx
import { CrayonRenderer } from '@components/genui';

function ChatMessage({ response }) {
  return (
    <CrayonRenderer
      response={response}
      onAction={handleAction}
      onSendMessage={sendMessage}
    />
  );
}
```

### With useCrayonChat Hook

```jsx
import { useCrayonChat } from '@components/genui';

function ChatContainer() {
  const { renderGenUI, shouldUseCrayon } = useCrayonChat({
    onSendMessage: sendMessage,
    context: { sessionId, agentId },
  });

  return (
    <div>
      {messages.map(msg => (
        msg.component && shouldUseCrayon(msg.component)
          ? renderGenUI(msg.component)
          : <TextMessage content={msg.content} />
      ))}
    </div>
  );
}
```

## Component Mapping

| Odoo Component | Crayon Component | Notes |
|----------------|------------------|-------|
| `table`, `data_table` | `Table` | Full table with sorting/selection |
| `chart` | `LineChart` | Default chart type |
| `line_chart` | `LineChart` | - |
| `bar_chart` | `BarChart` | - |
| `pie_chart` | `PieChart` | - |
| `card`, `detail_card` | `Card` | Rich card with image |
| `list` | `List` | Simple list |
| `form` | `Form` | Dynamic form |
| `text` | `TextContent` | Markdown support |
| `callout` | `Callout` | Info/warning/error |
| `steps` | `Steps` | Process steps |
| `tabs` | `Tabs` | Tab container |
| `accordion` | `Accordion` | Collapsible sections |
| `qr_payment` | `custom:QRPayment` | Uses SuperChat component |
| `insurance_quote` | `custom:InsuranceQuote` | Uses SuperChat component |

## Custom Components

Custom components bypass Crayon and use existing SuperChat components:

```jsx
// In ResponseTemplates.jsx
export const responseTemplates = [
  {
    name: 'qr_payment',
    component: QRPaymentTemplate,
  },
  {
    name: 'insurance_quote',
    component: InsuranceQuoteTemplate,
  },
];
```

## Action Handling

Actions from Crayon components are routed through `ActionHandler`:

```jsx
import { createActionHandler, ACTION_TYPES } from '@adapters/ActionHandler';

const handler = createActionHandler({
  sendMessage: (msg, opts) => { /* send to chat */ },
  callApi: (url, opts) => fetch(url, opts),
  context: { sessionId },
});

// Handle action from Crayon
const result = await handler.handleAction({
  type: ACTION_TYPES.FORM_SUBMIT,
  data: formData,
  humanFriendlyMessage: 'Form submitted',
  llmFriendlyMessage: JSON.stringify(formData),
});
```

## Backend Response Format

For Crayon to render correctly, Odoo backend should send:

```json
{
  "data": { ... },
  "render": {
    "component": "table",
    "title": "Search Results",
    "fields": {
      "primary": [
        { "field": "name", "label": "Name" },
        { "field": "price", "label": "Price", "type": "currency", "format": "{value} VND" }
      ],
      "secondary": [
        { "field": "description", "label": "Description" }
      ],
      "image": { "field": "image_url" }
    }
  },
  "actions": {
    "item_actions": [
      { "id": "view", "label": "View", "type": "instant" }
    ],
    "bulk_actions": []
  },
  "suggestions": [
    { "label": "Show more", "message": "Show more results" }
  ]
}
```

## Theming

Crayon uses Tailwind CSS and integrates with existing theme:

```js
// tailwind.config.js
export default {
  content: [
    "./node_modules/@crayonai/react-ui/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [
    require('tailwindcss-animate'),
  ],
};
```

## Bundle Size

Crayon adds approximately 1.8MB to the bundle (gzipped: ~540KB).

Lazy loading is implemented to minimize initial load impact:
- `CrayonC1` is loaded only when a Crayon component is needed
- Custom components load immediately (no Crayon dependency)

## Troubleshooting

### Crayon styles not applying
Ensure styles are imported in main.jsx:
```jsx
import '@crayonai/react-ui/styles/index.css'
```

### Component not rendering
Check if component type is mapped in `COMPONENT_TYPE_MAP` (CrayonAdapter.jsx).

### Actions not working
Verify `onAction` and `onSendMessage` props are passed to CrayonRenderer.

## References

- [Crayon Documentation](https://crayonai.org/docs)
- [Crayon GitHub](https://github.com/thesysdev/crayon)
- [Thesys Component Library](https://docs.thesys.dev/library/index)

---

**Version**: 2.0.0
**Date**: 2025-12-03
**Author**: Claude Code

### Changelog

**v2.0.0** (2025-12-03)
- Fixed: Removed non-existent C1Component (doesn't exist in SDK v0.9.4)
- Added: Direct usage of individual Crayon components
- Added: Proper component mapping (gallery -> Carousel, table -> Table, etc.)
- Added: Fallback to legacy renderer for unknown component types
- Added: Action handling for CTA clicks and item selection

**v1.0.0** (2025-12-03)
- Initial integration with Crayon SDK
- Added CrayonAdapter for format transformation
- Added ActionHandler for action routing
