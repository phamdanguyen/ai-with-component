/**
 * CrayonAdapter - Bridge between Odoo AI Chat and Crayon UI SDK
 *
 * Transforms Odoo GenUI responses to Crayon-compatible format
 * and handles action callbacks between systems.
 *
 * @version 1.0.0
 * @since 2025-12-03
 */

/**
 * Component type mapping: Odoo -> Crayon
 *
 * Odoo uses custom component names, Crayon uses standard names.
 * This mapping ensures correct rendering.
 */
const COMPONENT_TYPE_MAP = {
  // Display components
  'card': 'Card',
  'detail_card': 'Card',
  'card_grid': 'CardGrid',
  'card_list': 'CardList',
  'list': 'List',
  'table': 'Table',
  'data_table': 'Table',

  // Charts (Crayon has rich chart library)
  'chart': 'LineChart',
  'line_chart': 'LineChart',
  'bar_chart': 'BarChart',
  'pie_chart': 'PieChart',
  'area_chart': 'AreaChart',
  'radar_chart': 'RadarChart',
  'radial_chart': 'RadialChart',

  // Forms
  'form': 'Form',
  'inline_form': 'InlineForm',

  // Display
  'text': 'TextContent',
  'callout': 'Callout',
  'steps': 'Steps',
  'tabs': 'Tabs',
  'accordion': 'Accordion',
  'code': 'CodeBlock',
  'image': 'Image',
  'gallery': 'Gallery',
  'rich_card': 'Card',  // v9.x rich_card maps to Card

  // Triggers
  'button': 'Button',
  'follow_up': 'FollowUp',

  // Special (keep Odoo custom components)
  'qr_payment': 'custom:QRPayment',
  'insurance_quote': 'custom:InsuranceQuote',
  'product_carousel': 'custom:ProductCarousel',
  'empty': 'Empty',
};

/**
 * Detect Odoo response format version
 *
 * Odoo v9.x format: { type: 'component', component_type: 'gallery', props: {...} }
 * New Crayon format: { data: {...}, render: { component: 'gallery' }, actions: {...} }
 *
 * @param {Object} response - Odoo response
 * @returns {string} 'v9' | 'crayon' | 'unknown'
 */
function detectResponseFormat(response) {
  if (!response) return 'unknown';

  // Odoo v9.x format: has 'type' and 'component_type' fields
  if (response.type === 'component' && response.component_type) {
    return 'v9';
  }

  // Odoo v9.x text format
  if (response.type === 'text' && response.text) {
    return 'v9-text';
  }

  // New Crayon format: has 'render' object with 'component' field
  if (response.render?.component) {
    return 'crayon';
  }

  return 'unknown';
}

/**
 * Transform Odoo v9.x response to normalized format
 *
 * Converts: { type, component_type, props, ... }
 * To: { data, render, actions, suggestions }
 *
 * @param {Object} v9Response - Odoo v9.x format response
 * @returns {Object} Normalized response
 */
function normalizeV9Response(v9Response) {
  const { component_type, props, confidence, layer_used, intent, ...rest } = v9Response;

  // Extract data from props based on component type
  let data = null;
  let render = {
    component: component_type,
    title: props?.title,
    subtitle: props?.subtitle,
  };

  switch (component_type) {
    case 'gallery':
    case 'card_grid':
    case 'card_list':
      data = { items: props?.items || [] };
      render.layout = props?.layout;
      render.columns = props?.columns;
      render.showPrice = props?.showPrice;
      render.showCTA = props?.showCTA;
      break;

    case 'table':
    case 'data_table':
      data = { items: props?.rows || props?.items || [] };
      render.columns = props?.columns;
      break;

    case 'card':
    case 'rich_card':
    case 'detail_card':
      data = props?.item || props;
      break;

    case 'list':
      data = { items: props?.items || [] };
      break;

    case 'form':
    case 'inline_form':
      data = props?.values || {};
      render.form_fields = props?.fields;
      break;

    case 'chart':
    case 'line_chart':
    case 'bar_chart':
    case 'pie_chart':
      data = { items: props?.data || [] };
      render.chart_config = {
        xAxis: props?.xAxisKey,
        yAxis: props?.yAxisKey,
        series: props?.series,
        colors: props?.colors,
      };
      break;

    default:
      // Pass through for unknown component types
      data = props;
  }

  // Extract actions from props.ctas or props.actions
  let actions = null;
  if (props?.ctas || props?.actions) {
    actions = {
      item_actions: (props.ctas || props.actions || []).map(cta => ({
        id: cta.name || cta.id,
        label: cta.label,
        icon: cta.icon,
        variant: cta.variant,
        type: cta.action_type || 'instant',
        chat_message_template: cta.chat_message_template,
      })),
    };
  }

  return {
    data,
    render,
    actions,
    suggestions: props?.suggestions || [],
    is_streaming: false,
    _metadata: {
      originalFormat: 'v9',
      confidence,
      layer_used,
      intent,
    },
  };
}

/**
 * Transform Odoo GenUI response to Crayon c1Response format
 *
 * Supports both:
 * - Odoo v9.x format: { type: 'component', component_type: '...', props: {...} }
 * - New Crayon format: { data: {...}, render: { component: '...' }, actions: {...} }
 *
 * @param {Object} odooResponse - Response from Odoo AI Chat backend
 * @returns {Object} Crayon-compatible response
 */
export function transformOdooToCrayon(odooResponse) {
  if (!odooResponse) {
    return {
      c1Response: null,
      isStreaming: false,
      useCustomComponent: false,
    };
  }

  // Detect and normalize response format
  const format = detectResponseFormat(odooResponse);
  let normalizedResponse = odooResponse;

  if (format === 'v9') {
    normalizedResponse = normalizeV9Response(odooResponse);
  } else if (format === 'v9-text') {
    // Plain text response - no component rendering needed
    return {
      c1Response: null,
      isStreaming: false,
      useCustomComponent: false,
      textContent: odooResponse.text,
      originalResponse: odooResponse,
    };
  }

  const { data, render, actions, suggestions, is_streaming } = normalizedResponse;

  // Check if this is a custom component (keep using existing SuperChat components)
  const componentType = render?.component || 'text';
  const mappedType = COMPONENT_TYPE_MAP[componentType] || componentType;

  if (mappedType.startsWith('custom:')) {
    // Use existing SuperChat component
    return {
      c1Response: null,
      isStreaming: is_streaming || false,
      useCustomComponent: true,
      customComponentName: mappedType.replace('custom:', ''),
      originalResponse: odooResponse,
    };
  }

  // Transform to Crayon format
  const crayonSpec = buildCrayonSpec({
    type: mappedType,
    data,
    render,
    actions,
    suggestions,
  });

  return {
    c1Response: JSON.stringify(crayonSpec),
    isStreaming: is_streaming || false,
    useCustomComponent: false,
    originalResponse: odooResponse,
  };
}

/**
 * Build Crayon component specification
 *
 * @param {Object} params - Transform parameters
 * @returns {Object} Crayon component spec
 */
function buildCrayonSpec({ type, data, render, actions, suggestions }) {
  const items = Array.isArray(data) ? data : data?.items || (data ? [data] : []);
  const fields = render?.fields || {};

  // Base spec
  const spec = {
    component: type,
    props: {
      title: render?.title,
      subtitle: render?.subtitle,
    },
  };

  // Add data based on component type
  switch (type) {
    case 'Gallery':
      // Special handling for gallery with CTAs (Odoo v9.x format)
      spec.props.items = items.map(item => transformGalleryItem(item, render));
      spec.props.layout = render?.layout || 'grid';
      spec.props.columns = render?.columns || 2;
      spec.props.showPrice = render?.showPrice !== false;
      spec.props.showCTA = render?.showCTA !== false;
      break;

    case 'Card':
    case 'CardGrid':
    case 'CardList':
      spec.props.items = items.map(item => transformCardItem(item, fields));
      break;

    case 'List':
      spec.props.items = items.map(item => transformListItem(item, fields));
      break;

    case 'Table':
      spec.props = {
        ...spec.props,
        ...transformTableData(items, fields),
      };
      break;

    case 'LineChart':
    case 'BarChart':
    case 'PieChart':
    case 'AreaChart':
    case 'RadarChart':
    case 'RadialChart':
      spec.props = {
        ...spec.props,
        ...transformChartData(items, render?.chart_config),
      };
      break;

    case 'Form':
    case 'InlineForm':
      spec.props.fields = transformFormFields(render?.form_fields || fields);
      break;

    case 'TextContent':
      spec.props.content = data?.content || data?.text || '';
      spec.props.variant = render?.variant || 'clear';
      break;

    case 'Callout':
      spec.props = {
        ...spec.props,
        variant: render?.variant || 'info',
        title: render?.title || data?.title,
        description: data?.description || data?.content,
      };
      break;

    case 'Steps':
      spec.props.steps = items.map((item, idx) => ({
        number: idx + 1,
        title: item.title || item.name,
        description: item.description,
        status: item.status || 'pending',
      }));
      break;

    case 'Tabs':
      spec.props.tabs = items.map(item => ({
        label: item.label || item.title,
        icon: item.icon,
        content: item.content,
      }));
      break;

    case 'Accordion':
      spec.props.sections = items.map(item => ({
        title: item.title,
        content: item.content,
        defaultOpen: item.defaultOpen || false,
      }));
      break;

    default:
      // Pass through data as-is for unknown types
      spec.props.data = data;
  }

  // Add actions
  if (actions) {
    spec.props.actions = transformActions(actions);
  }

  // Add suggestions as follow-up
  if (suggestions?.length > 0) {
    spec.props.followUp = suggestions.map(s => ({
      label: s.label || s.text || s,
      message: s.message || s.text || s,
    }));
  }

  return spec;
}

/**
 * Transform gallery item data (Odoo v9.x format)
 *
 * Gallery items from Odoo have:
 * - id, title, subtitle, description, image
 * - price: { current, currency }
 * - ctas: [{ name, label, icon, variant, action_type, chat_message_template }]
 */
function transformGalleryItem(item, render) {
  return {
    id: item.id,
    title: item.title || item.name,
    subtitle: item.subtitle || '',
    description: item.description || '',
    image: item.image || item.image_url,
    price: item.price ? {
      amount: item.price.current || item.price,
      currency: item.price.currency || 'VND',
      formatted: formatPrice(item.price.current || item.price, item.price.currency),
    } : null,
    // Transform CTAs to actions
    actions: (item.ctas || []).map(cta => ({
      id: cta.name || cta.id,
      label: cta.label,
      icon: cta.icon,
      variant: cta.variant || 'secondary',
      type: cta.action_type || 'chat',
      // For chat actions, include the message template
      chatMessage: cta.chat_message_template,
    })),
  };
}

/**
 * Format price for display
 */
function formatPrice(amount, currency = 'VND') {
  if (!amount) return '';
  const formatted = amount.toLocaleString('vi-VN');
  return `${formatted} ${currency}`;
}

/**
 * Transform card item data
 */
function transformCardItem(item, fields) {
  const primaryFields = fields?.primary || [];
  const imageField = fields?.image;

  return {
    id: item.id,
    title: getFieldValue(item, primaryFields[0]) || item.name || item.title,
    subtitle: getFieldValue(item, primaryFields[1]),
    description: getFieldValue(item, primaryFields[2]) || item.description,
    image: imageField ? item[imageField.field] : item.image,
    metadata: extractMetadata(item, fields?.secondary || []),
  };
}

/**
 * Transform list item data
 */
function transformListItem(item, fields) {
  const primaryFields = fields?.primary || [];

  return {
    id: item.id,
    primary: getFieldValue(item, primaryFields[0]) || item.name,
    secondary: getFieldValue(item, primaryFields[1]),
    icon: item.icon,
    avatar: item.avatar || item.image,
  };
}

/**
 * Transform table data
 */
function transformTableData(items, fields) {
  const allFields = [
    ...(fields?.primary || []),
    ...(fields?.secondary || []),
  ].slice(0, 8);

  const columns = allFields.map(f => ({
    key: f.field,
    label: f.label,
    type: f.type || 'text',
    format: f.format,
  }));

  const rows = items.map(item => {
    const row = { id: item.id };
    allFields.forEach(f => {
      row[f.field] = item[f.field];
    });
    return row;
  });

  return { columns, rows };
}

/**
 * Transform chart data
 */
function transformChartData(items, chartConfig) {
  return {
    data: items,
    xAxisKey: chartConfig?.xAxis || 'name',
    yAxisKey: chartConfig?.yAxis || 'value',
    series: chartConfig?.series || [{ dataKey: 'value', name: 'Value' }],
    colors: chartConfig?.colors,
  };
}

/**
 * Transform form fields
 */
function transformFormFields(formFields) {
  if (Array.isArray(formFields)) {
    return formFields.map(f => ({
      name: f.name || f.field,
      label: f.label,
      type: mapFormFieldType(f.type),
      required: f.required || false,
      placeholder: f.placeholder,
      options: f.options,
      defaultValue: f.default || f.defaultValue,
      validation: f.validation,
    }));
  }
  return [];
}

/**
 * Map Odoo field types to Crayon form types
 */
function mapFormFieldType(type) {
  const typeMap = {
    'char': 'text',
    'text': 'textarea',
    'integer': 'number',
    'float': 'number',
    'boolean': 'checkbox',
    'selection': 'select',
    'many2one': 'select',
    'date': 'date',
    'datetime': 'datetime',
  };
  return typeMap[type] || type || 'text';
}

/**
 * Transform actions
 */
function transformActions(actions) {
  const result = {};

  if (actions?.item_actions) {
    result.itemActions = actions.item_actions.map(a => ({
      id: a.id || a.action,
      label: a.label,
      icon: a.icon,
      variant: a.variant || 'secondary',
      type: a.type || 'instant',
      confirmMessage: a.confirm_message,
    }));
  }

  if (actions?.bulk_actions) {
    result.bulkActions = actions.bulk_actions.map(a => ({
      id: a.id || a.action,
      label: a.label,
      icon: a.icon,
      variant: a.variant || 'secondary',
    }));
  }

  return result;
}

/**
 * Get field value with formatting
 */
function getFieldValue(item, fieldConfig) {
  if (!fieldConfig) return null;

  const value = item[fieldConfig.field];
  if (value === undefined || value === null) return null;

  // Apply formatting
  if (fieldConfig.type === 'currency' && fieldConfig.format) {
    return fieldConfig.format.replace('{value}', value.toLocaleString());
  }
  if (fieldConfig.type === 'date') {
    return new Date(value).toLocaleDateString();
  }

  return value;
}

/**
 * Extract metadata from secondary fields
 */
function extractMetadata(item, secondaryFields) {
  return secondaryFields.reduce((acc, field) => {
    const value = getFieldValue(item, field);
    if (value !== null) {
      acc[field.label || field.field] = value;
    }
    return acc;
  }, {});
}

/**
 * Transform Crayon action to Odoo API call
 *
 * @param {Object} action - Crayon action object
 * @param {Object} item - Item the action was triggered on
 * @param {Object} context - Additional context
 * @returns {Object} Odoo-compatible action request
 */
export function transformCrayonActionToOdoo(action, item, context = {}) {
  return {
    action_id: action.id,
    action_type: action.type || 'instant',
    item_id: item?.id,
    item_data: item,
    context: {
      ...context,
      source: 'crayon_ui',
    },
  };
}

/**
 * Check if response should use Crayon or custom component
 *
 * Supports both Odoo v9.x format and new Crayon format.
 *
 * @param {Object} odooResponse - Odoo response
 * @returns {boolean} True if should use Crayon
 */
export function shouldUseCrayon(odooResponse) {
  if (!odooResponse) return false;

  // Detect format
  const format = detectResponseFormat(odooResponse);

  // Get component type based on format
  let componentType;
  if (format === 'v9') {
    componentType = odooResponse.component_type;
  } else if (format === 'crayon') {
    componentType = odooResponse.render?.component;
  } else if (format === 'v9-text') {
    return false; // Plain text, no Crayon needed
  } else {
    return false;
  }

  if (!componentType) return false;

  const mappedType = COMPONENT_TYPE_MAP[componentType];

  // Use custom component for specialized components
  if (mappedType?.startsWith('custom:')) return false;

  // Use Crayon for standard components
  return true;
}

/**
 * Export format detection for external use
 */
export { detectResponseFormat };

export default {
  transformOdooToCrayon,
  transformCrayonActionToOdoo,
  shouldUseCrayon,
  detectResponseFormat,
  COMPONENT_TYPE_MAP,
};
