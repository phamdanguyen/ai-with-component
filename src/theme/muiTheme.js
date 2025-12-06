/**
 * MUI Theme Configuration for Odoo AI Chat
 * Material Design 3 inspired theme
 */
import { createTheme, alpha } from '@mui/material/styles';

// Brand colors - Insurance/Finance focused
const brandColors = {
  primary: {
    main: '#1976d2',      // Primary blue
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9c27b0',      // Purple accent
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
};

// Typography scale
const typography = {
  fontFamily: [
    'Roboto',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 500,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 500,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  button: {
    textTransform: 'none', // No uppercase for buttons
    fontWeight: 500,
  },
};

// Shape and spacing
const shape = {
  borderRadius: 8,
};

// Component overrides
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '8px 16px',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        },
      },
      outlined: {
        borderWidth: 1.5,
        '&:hover': {
          borderWidth: 1.5,
        },
      },
    },
    defaultProps: {
      disableElevation: true,
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
    defaultProps: {
      variant: 'outlined',
      size: 'medium',
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      },
    },
    defaultProps: {
      elevation: 0,
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRadius: '0 16px 16px 0',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
    },
  },
};

// Create light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    ...brandColors,
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography,
  shape,
  components,
});

// Create dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#ce93d8',
      light: '#f3e5f5',
      dark: '#ab47bc',
    },
    success: {
      main: '#66bb6a',
    },
    warning: {
      main: '#ffa726',
    },
    error: {
      main: '#f44336',
    },
    info: {
      main: '#29b6f6',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography,
  shape,
  components: {
    ...components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          backgroundColor: '#1e1e1e',
        },
      },
    },
  },
});

// Default export - light theme
export default lightTheme;

// CSS Custom Properties export (for OWL/Vanilla JS integration)
export const cssVariables = `
:root {
  /* Primary colors */
  --mdc-primary: ${brandColors.primary.main};
  --mdc-primary-light: ${brandColors.primary.light};
  --mdc-primary-dark: ${brandColors.primary.dark};
  --mdc-on-primary: ${brandColors.primary.contrastText};

  /* Secondary colors */
  --mdc-secondary: ${brandColors.secondary.main};
  --mdc-secondary-light: ${brandColors.secondary.light};
  --mdc-secondary-dark: ${brandColors.secondary.dark};
  --mdc-on-secondary: ${brandColors.secondary.contrastText};

  /* Semantic colors */
  --mdc-success: ${brandColors.success.main};
  --mdc-warning: ${brandColors.warning.main};
  --mdc-error: ${brandColors.error.main};
  --mdc-info: ${brandColors.info.main};

  /* Surface colors */
  --mdc-surface: #ffffff;
  --mdc-background: #f5f5f5;
  --mdc-on-surface: rgba(0, 0, 0, 0.87);
  --mdc-on-surface-secondary: rgba(0, 0, 0, 0.6);

  /* Shape */
  --mdc-shape-small: 4px;
  --mdc-shape-medium: 8px;
  --mdc-shape-large: 16px;

  /* Elevation shadows */
  --mdc-elevation-1: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  --mdc-elevation-2: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
  --mdc-elevation-3: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
  --mdc-elevation-4: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);

  /* Typography */
  --mdc-font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;

  /* Transitions */
  --mdc-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --mdc-transition-medium: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --mdc-transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark mode variables */
[data-theme="dark"], .dark-mode {
  --mdc-primary: #90caf9;
  --mdc-primary-light: #e3f2fd;
  --mdc-primary-dark: #42a5f5;
  --mdc-secondary: #ce93d8;
  --mdc-surface: #1e1e1e;
  --mdc-background: #121212;
  --mdc-on-surface: #ffffff;
  --mdc-on-surface-secondary: rgba(255, 255, 255, 0.7);
}
`;
