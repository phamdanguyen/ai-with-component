# MUI Material Design Integration Guide

## Overview

This document describes the MUI (Material Design) integration for the Odoo AI Chat module.

**Version:** 9.0.0
**MUI Version:** ^6.x (latest stable)
**Migration from:** MDC Web (archived January 2025)

## Architecture

```
+------------------------------------------+
|           Odoo + MUI Material            |
+------------------------------------------+
|  React (SuperChat)    |  OWL/Vanilla JS  |
|  |                    |  |               |
|  v                    |  v               |
|  MUI Components       |  CSS Variables   |
|  (@mui/material)      |  + Utility CSS   |
|  |                    |  |               |
|  v                    |  v               |
|  ThemeProvider        |  Material Tokens |
|  (Emotion CSS-in-JS)  |  (CSS Custom     |
|                       |   Properties)    |
+------------------------------------------+
```

## Installation

MUI packages are already installed in the superchat frontend:

```bash
cd odoo19-dev/addons/odoo_ai_chat/static/superchat
npm install  # Dependencies already in package.json
```

### Installed Packages

- `@mui/material` - Core MUI components
- `@mui/icons-material` - Material icons
- `@mui/lab` - Lab components (LoadingButton, etc.)
- `@emotion/react` - CSS-in-JS runtime
- `@emotion/styled` - Styled components

## React Components (SuperChat)

### Theme Configuration

Theme is defined in `src/theme/muiTheme.js`:

```jsx
import { lightTheme } from './theme/muiTheme'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// Wrap app with ThemeProvider
<ThemeProvider theme={lightTheme}>
  <CssBaseline />
  <App />
</ThemeProvider>
```

### Migrated Components

| Component | MUI Components Used |
|-----------|-------------------|
| `ButtonComponent` | `Button`, `LoadingButton`, `Alert` |
| `FormComponent` | `TextField`, `Select`, `Checkbox`, `Radio`, `Paper` |
| `CardComponent` | `Card`, `CardMedia`, `CardContent`, `CardActions` |
| `ListComponent` | `List`, `ListItem`, `ListItemButton`, `Paper` |
| `Header` | `AppBar`, `Toolbar`, `Tabs`, `Menu`, `Avatar` |

### Usage Example

```jsx
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Card from '@mui/material/Card'

function MyComponent() {
  return (
    <Card>
      <TextField label="Name" fullWidth />
      <Button variant="contained" color="primary">
        Submit
      </Button>
    </Card>
  )
}
```

## OWL/Vanilla JS Widgets

### CSS Variables

Import the Material Design CSS in your Odoo module:

```python
# __manifest__.py
'assets': {
    'web.assets_backend': [
        'odoo_ai_chat/static/src/css/material-design.css',
    ],
}
```

### Available CSS Variables

```css
/* Colors */
var(--mdc-primary)           /* #1976d2 */
var(--mdc-secondary)         /* #9c27b0 */
var(--mdc-success)           /* #2e7d32 */
var(--mdc-error)             /* #d32f2f */
var(--mdc-warning)           /* #ed6c02 */

/* Surface */
var(--mdc-surface)           /* #ffffff */
var(--mdc-background)        /* #fafafa */
var(--mdc-on-surface)        /* rgba(0,0,0,0.87) */

/* Shape */
var(--mdc-shape-sm)          /* 8px */
var(--mdc-shape-md)          /* 12px */
var(--mdc-shape-lg)          /* 16px */

/* Elevation */
var(--mdc-elevation-1)       /* light shadow */
var(--mdc-elevation-2)       /* medium shadow */
var(--mdc-elevation-3)       /* strong shadow */
```

### Utility Classes

#### Buttons

```html
<button class="mdc-btn mdc-btn--contained">Primary Button</button>
<button class="mdc-btn mdc-btn--outlined">Outlined Button</button>
<button class="mdc-btn mdc-btn--text">Text Button</button>
<button class="mdc-btn mdc-btn--contained mdc-btn--success">Success</button>
<button class="mdc-btn mdc-btn--contained mdc-btn--lg mdc-btn--full">Full Width Large</button>
```

#### Inputs

```html
<div class="mdc-input-wrapper">
  <input type="text" class="mdc-input" placeholder=" " />
  <label class="mdc-input-label">Email</label>
  <span class="mdc-input-helper">Enter your email address</span>
</div>
```

#### Cards

```html
<div class="mdc-card">
  <img src="image.jpg" class="mdc-card__media" alt="..." />
  <div class="mdc-card__content">
    <h3 class="mdc-card__title">Card Title</h3>
    <p class="mdc-card__subtitle">Card subtitle</p>
  </div>
  <div class="mdc-card__actions">
    <button class="mdc-btn mdc-btn--text">Action</button>
  </div>
</div>
```

#### Chips

```html
<span class="mdc-chip">Default Chip</span>
<span class="mdc-chip mdc-chip--primary">Primary</span>
<span class="mdc-chip mdc-chip--success">Success</span>
<span class="mdc-chip mdc-chip--error">Error</span>
```

#### Avatar

```html
<div class="mdc-avatar">JD</div>
<div class="mdc-avatar mdc-avatar--sm">J</div>
<div class="mdc-avatar mdc-avatar--lg">
  <img src="avatar.jpg" alt="User" />
</div>
```

### Utility Classes

```html
<!-- Spacing -->
<div class="mdc-m-3 mdc-p-2">Margin 16px, Padding 8px</div>

<!-- Typography -->
<p class="mdc-text-primary">Primary color text</p>
<p class="mdc-text-secondary">Secondary text</p>

<!-- Flexbox -->
<div class="mdc-flex mdc-items-center mdc-gap-2">
  <span>Item 1</span>
  <span>Item 2</span>
</div>

<!-- Elevation -->
<div class="mdc-card mdc-elevation-2">Elevated card</div>
```

## Dark Mode Support

The CSS variables automatically adjust for dark mode:

```css
/* Add to body or container */
<body class="dark-mode">
  <!-- Dark theme applied -->
</body>

/* Or use Odoo's dark mode class */
<body class="o_dark_mode">
  <!-- Dark theme applied -->
</body>
```

## Migration Notes

### From MDC Web

MDC Web was archived in January 2025. Key differences with MUI:

| Aspect | MDC Web | MUI |
|--------|---------|-----|
| Status | Archived | Active |
| Architecture | Foundation + Adapter | React-first |
| CSS | Sass/CSS | CSS-in-JS (Emotion) |
| Bundle Size | ~100KB | ~150KB (tree-shakeable) |
| TypeScript | Limited | Full support |

### Breaking Changes

1. **Import paths changed**:
   - Before: `@material/button`
   - After: `@mui/material/Button`

2. **CSS classes changed**:
   - Before: `.mdc-button`
   - After: `.MuiButton-root` or custom `.mdc-btn`

3. **Theming approach**:
   - Before: Sass variables
   - After: ThemeProvider + createTheme

## File Structure

```
static/
├── superchat/
│   └── src/
│       ├── theme/
│       │   └── muiTheme.js      # MUI theme configuration
│       ├── components/
│       │   ├── genui/
│       │   │   ├── ButtonComponent.jsx   # MUI Button
│       │   │   ├── FormComponent.jsx     # MUI Forms
│       │   │   ├── CardComponent.jsx     # MUI Card
│       │   │   └── ListComponent.jsx     # MUI List
│       │   └── layout/
│       │       └── Header.jsx            # MUI AppBar
│       └── main.jsx             # ThemeProvider setup
│
└── src/
    └── css/
        └── material-design.css  # CSS utilities for OWL/Vanilla JS
```

## Resources

- [MUI Documentation](https://mui.com/)
- [Material Design Guidelines](https://m3.material.io/)
- [Emotion (CSS-in-JS)](https://emotion.sh/)

## Version History

- **v9.0.0** (2024-12): MUI integration, MDC Web migration
- **v8.0.0**: MDC Web foundation (archived)
