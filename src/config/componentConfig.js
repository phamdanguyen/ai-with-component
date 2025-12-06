/**
 * Component Configuration (Sprint B - Story B4.4)
 * Single source of truth for component type mappings
 *
 * This centralizes all component type definitions to avoid scattered
 * hardcoded arrays throughout the codebase.
 */

/**
 * Component configuration registry
 * Each entry defines how a component type should be rendered
 */
export const COMPONENT_CONFIG = {
  // ============================================
  // Custom components (specialized rendering)
  // ============================================
  qr_payment: {
    renderer: 'custom',
    customComponent: 'QRPaymentComponent',
    description: 'QR code payment display',
  },
  insurance_quote: {
    renderer: 'custom',
    customComponent: 'InsuranceQuoteComponent',
    description: 'Insurance quote calculator/display',
  },
  slides: {
    renderer: 'custom',
    customComponent: 'SlidesComponent',
    description: 'Image slideshow/carousel',
  },

  // ============================================
  // Standard components (legacy MUI-based)
  // ============================================
  gallery: {
    renderer: 'legacy',
    legacyComponent: 'GalleryComponent',
    description: 'Product/image gallery grid',
    defaultProps: {
      layout: 'grid',
      columns: 2,
      showPrice: true,
      showCTA: true,
    },
  },
  table: {
    renderer: 'legacy',
    legacyComponent: 'TableComponent',
    description: 'Data table with sorting/search',
    defaultProps: {
      sortable: true,
      searchable: true,
    },
  },
  list: {
    renderer: 'legacy',
    legacyComponent: 'ListComponent',
    description: 'Simple list display',
    defaultProps: {
      ordered: false,
    },
  },
  card: {
    renderer: 'legacy',
    legacyComponent: 'CardComponent',
    description: 'Single card with content',
  },
  chart: {
    renderer: 'legacy',
    legacyComponent: 'ChartComponent',
    description: 'Data visualization chart',
    defaultProps: {
      chartType: 'bar',
    },
  },
  form: {
    renderer: 'legacy',
    legacyComponent: 'FormComponent',
    description: 'Input form with fields',
    defaultProps: {
      submitAction: 'custom',
    },
  },
  button: {
    renderer: 'legacy',
    legacyComponent: 'ButtonComponent',
    description: 'Action button',
    defaultProps: {
      variant: 'contained',
      size: 'medium',
    },
  },
  suggestions: {
    renderer: 'legacy',
    legacyComponent: 'SuggestionChips',
    description: 'Suggestion button chips',
  },
  report: {
    renderer: 'legacy',
    legacyComponent: 'ReportComponent',
    description: 'Multi-section report display',
  },
};

/**
 * Get renderer type for a component type
 * @param {string} componentType - Component type identifier
 * @returns {'legacy' | 'custom' | null} Renderer type
 */
export const getRenderer = (componentType) => {
  return COMPONENT_CONFIG[componentType]?.renderer || 'legacy';
};

/**
 * Check if component type uses custom renderer
 * @param {string} type - Component type identifier
 * @returns {boolean}
 */
export const isCustomComponent = (type) => {
  return COMPONENT_CONFIG[type]?.renderer === 'custom';
};

/**
 * Check if component type uses legacy renderer
 * @param {string} type - Component type identifier
 * @returns {boolean}
 */
export const isLegacyComponent = (type) => {
  const config = COMPONENT_CONFIG[type];
  return !config || config.renderer === 'legacy';
};

/**
 * Get component name for a type
 * @param {string} type - Component type identifier
 * @returns {string | null} Component name
 */
export const getComponentName = (type) => {
  const config = COMPONENT_CONFIG[type];
  if (!config) return null;
  return config.customComponent || config.legacyComponent;
};

/**
 * Get default props for a component type
 * @param {string} type - Component type identifier
 * @returns {Object} Default props
 */
export const getDefaultProps = (type) => {
  return COMPONENT_CONFIG[type]?.defaultProps || {};
};

/**
 * Get all component types
 * @returns {string[]} Array of component type identifiers
 */
export const getAllComponentTypes = () => {
  return Object.keys(COMPONENT_CONFIG);
};

/**
 * Get all legacy component types
 * @returns {string[]} Array of legacy component type identifiers
 */
export const getLegacyComponentTypes = () => {
  return Object.entries(COMPONENT_CONFIG)
    .filter(([, config]) => config.renderer === 'legacy')
    .map(([type]) => type);
};

/**
 * Get all custom component types
 * @returns {string[]} Array of custom component type identifiers
 */
export const getCustomComponentTypes = () => {
  return Object.entries(COMPONENT_CONFIG)
    .filter(([, config]) => config.renderer === 'custom')
    .map(([type]) => type);
};

/**
 * Validate if a component type is known
 * @param {string} type - Component type identifier
 * @returns {boolean}
 */
export const isKnownComponentType = (type) => {
  return type in COMPONENT_CONFIG;
};

/**
 * Merge default props with provided props
 * @param {string} type - Component type identifier
 * @param {Object} props - Provided props
 * @returns {Object} Merged props
 */
export const mergeWithDefaults = (type, props = {}) => {
  const defaults = getDefaultProps(type);
  return { ...defaults, ...props };
};

// Export component type constants for easy reference
export const COMPONENT_TYPES = {
  // Custom
  QR_PAYMENT: 'qr_payment',
  INSURANCE_QUOTE: 'insurance_quote',
  SLIDES: 'slides',
  // Legacy
  GALLERY: 'gallery',
  TABLE: 'table',
  LIST: 'list',
  CARD: 'card',
  CHART: 'chart',
  FORM: 'form',
  BUTTON: 'button',
  SUGGESTIONS: 'suggestions',
  REPORT: 'report',
};

export default COMPONENT_CONFIG;
