# Architecture - Frontend (Web)

## Executive Summary

The **web frontend** is a Next.js 16 application that provides the user interface for the All-in-One Chat platform. It implements a progressive disclosure UI pattern where text responses are always visible while generative UI components are collapsible.

- **Type**: Web Frontend Application
- **Framework**: Next.js 16.0.6 with React 19.2.0
- **Architecture Pattern**: Server-Side Rendered (SSR) + Static Generation
- **Rendering**: React component-based
- **Styling**: TailwindCSS 4 with utility-first approach
- **Deployment**: Node.js runtime (can be deployed to Vercel, AWS, etc.)

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Meta-Framework** | Next.js | 16.0.6 | React framework for SSR/SSG |
| **UI Library** | React | 19.2.0 | Component rendering engine |
| **Language** | TypeScript | 5.x | Type-safe development |
| **Styling** | TailwindCSS | 4 | Utility-first CSS framework |
| **Icons** | Lucide React | 0.555.0 | Icon component library |
| **Charts** | Recharts | 3.5.1 | React charting library |
| **Component System** | Radix UI | Latest | Headless UI components |
| **Code Quality** | ESLint | 9 | Linting and code standards |

## Architecture Pattern

### Pattern Type: Component-Based with SSR

```
User Request
    ↓
Next.js Server
    ↓
Page/Route Handler
    ↓
React Component Rendering
    ↓
HTML + JSON (SSR) or Static (SSG)
    ↓
Browser
    ↓
Client-Side Hydration
    ↓
Interactive UI
```

### Rendering Strategy

1. **Server-Side Rendered (SSR)**: Pages with dynamic data
   - Used for chat pages that depend on LLM responses
   - Data fetched server-side, then rendered to HTML
   - Sent to client for hydration

2. **Static Site Generation (SSG)**: Static pages
   - Used for documentation, about, settings pages
   - Built at build time, served from CDN cache
   - Extremely fast (pure static HTML)

3. **Client-Side Rendering (CSR)**: Interactive features
   - Used for real-time chat interactions, component state
   - React handles client-side state and re-renders
   - API calls to backend middleware for AI responses

## Component Structure

### Page Components (`src/pages/` or `src/app/`)
```
pages/
├── index.tsx               # Home page
├── chat/
│   └── [id].tsx           # Chat session page (dynamic)
├── settings.tsx           # Settings page
└── api/
    ├── revalidate.ts      # ISR revalidation endpoint
    └── webhooks.ts        # Backend webhooks
```

### UI Components (`src/components/`)
```
components/
├── Chat/
│   ├── ChatInput.tsx      # Text input for user queries
│   ├── ChatMessage.tsx    # Individual message (text + component)
│   └── ChatHistory.tsx    # Message history list
├── GenUI/
│   ├── ComponentRenderer.tsx    # Renders dynamic GenUI components
│   ├── ChartRenderer.tsx        # Chart component rendering
│   ├── TableRenderer.tsx        # Table component rendering
│   └── FormRenderer.tsx         # Form component rendering
├── Layout/
│   ├── Header.tsx         # Top navigation
│   ├── Sidebar.tsx        # Left sidebar
│   └── Footer.tsx         # Footer
└── shared/
    ├── Button.tsx         # Reusable button
    ├── Input.tsx          # Reusable input field
    └── Card.tsx           # Card container
```

### API Client Layer (`src/api/`)
```
api/
├── client.ts              # Axios/fetch wrapper
├── chatAPI.ts             # Chat endpoints
├── componentAPI.ts        # Component generation endpoints
└── hooks/
    ├── useChat.ts         # Chat hook
    └── useGenUI.ts        # GenUI rendering hook
```

## Data Architecture

### Data Flow

```
1. User Input
   ↓
2. Client sends to Backend via HTTP POST
   ↓
3. Backend processes with Gemini API
   ↓
4. Backend returns: { text_response, ui_component_spec }
   ↓
5. Frontend renders both:
   - Text in message bubble
   - GenUI component collapsed/expandable
   ↓
6. State management keeps history
```

### State Management

- **Framework**: React Context API or Zustand (if used)
- **Chat State**: Message history, current input, loading states
- **UI State**: Expanded/collapsed components, theme, layout
- **User State**: Authentication, preferences, settings

### API Response Schema

```typescript
// Chat Response from Backend
{
  text_response: string,
  ui_component: {
    type: "chart" | "table" | "card" | "form" | "list" | "slides" | "report",
    spec: {
      // Component-specific configuration
      title?: string,
      data?: any,
      config?: any
    }
  }
}
```

## Styling Architecture

### TailwindCSS Setup

- **Version**: 4 with PostCSS
- **Approach**: Utility-first CSS classes
- **Configuration**: `tailwind.config.js` at root

### Component Styling Pattern

```tsx
// Example component with TailwindCSS
export const ChatMessage = ({ message }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <p className="text-gray-900 text-sm">{message.text}</p>
      {message.component && (
        <div className="mt-4 border-t pt-4">
          <ComponentRenderer spec={message.component} />
        </div>
      )}
    </div>
  )
}
```

## Integration Points

### Backend Integration

**Endpoint**: `http://localhost:3000/api/chat` (or production URL)

```typescript
// Frontend calls backend
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: userInput,
    sessionId: currentSession.id,
    context: conversationHistory
  })
})

const data = await response.json()
// data = { text_response, ui_component }
```

### Shared Component SDK

- Imports from `@all-in-one-chat/react-sdk`
- Uses components: Chart, Table, Card, Form, List, Slides, Report
- Type-safe props via `@all-in-one-chat/types`

## Deployment Architecture

### Development
- **Command**: `npm run dev` → Next.js dev server on port 3000
- **Hot reload**: Enabled for instant feedback
- **API calls**: Point to local backend (`http://localhost:3000`)

### Production
- **Build**: `npm run build` → Optimized Next.js build
- **Start**: `npm run start` → Production server
- **Environment**:
  - `NEXT_PUBLIC_API_URL` - Backend API URL
  - Optional: CDN, cache headers, compression

## Performance Considerations

1. **Image Optimization**: Next.js Image component with lazy loading
2. **Code Splitting**: Route-based code splitting by default
3. **CSS**: TailwindCSS JIT mode for minimal CSS
4. **Caching**: ISR for semi-dynamic pages, static export for static pages
5. **Hydration**: Minimal JS on initial page load

## Testing Strategy

- **Framework**: Vitest (if configured) or Jest
- **Component Testing**: React Testing Library
- **E2E Testing**: Cypress or Playwright
- **Types**: TypeScript for compile-time safety

## Development Workflow

### Local Development
```bash
pnpm install
pnpm dev
# Starts Next.js dev server on http://localhost:3000
```

### Building
```bash
pnpm build
# Creates optimized production build in .next/
```

### Deployment
```bash
# Option 1: Deploy to Vercel
vercel deploy

# Option 2: Build and run on your infrastructure
npm run build
npm run start
```

## Key Features

- **Progressive Disclosure UI**: Text always visible, components collapsible
- **Real-time Chat**: Streaming responses from backend
- **Component Library Integration**: Uses 7 GenUI component types
- **Type Safety**: Full TypeScript support
- **SEO Ready**: Server-side rendering for better SEO
- **Responsive Design**: Mobile-first with TailwindCSS

## Configuration Files

- **`next.config.js`** - Next.js configuration (rewrites, redirects, etc.)
- **`tsconfig.json`** - TypeScript compiler options
- **`.env.local`** - Local environment variables (Git ignored)
- **`package.json`** - Dependencies and scripts

---

**Part**: Frontend
**Generated**: 2025-12-04 by BMad Document Project Workflow
**Scan Level**: Quick
