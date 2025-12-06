/**
 * CrayonRenderer v3.0 - Full Crayon SDK Integration
 *
 * Renders ALL GenUI components using Crayon SDK:
 * - Display: Card, CardHeader, ImageGallery, Carousel
 * - Data: Table, ListBlock, ListItem
 * - Charts: LineChart, BarChart, PieChart, AreaChart, RadarChart
 * - Forms: Input, Select, CheckBoxGroup, RadioGroup, Slider, DatePicker
 * - Layout: Accordion, Tabs, Steps, Separator
 * - Text: TextContent, Callout, MarkDownRenderer, CodeBlock
 * - Actions: Button, FollowUpBlock, FollowUpItem
 *
 * Falls back to legacy components ONLY for custom types (QR payment, etc.)
 *
 * @version 3.0.0 - Full Crayon migration
 * @since 2025-12-03
 */

import React, { useCallback } from 'react';

// Crayon UI components - Display
import {
  Card,
  CardHeader,
  ImageGallery,
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@crayonai/react-ui';

// Crayon UI components - Data
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  ListBlock,
  ListItem,
} from '@crayonai/react-ui';

// Crayon UI components - Charts
import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  RadarChart,
} from '@crayonai/react-ui';

// Crayon UI components - Layout
import {
  Accordion,
  Tabs,
  Steps,
  Separator,
} from '@crayonai/react-ui';

// Crayon UI components - Text
import {
  TextContent,
  Callout,
  CodeBlock,
  MarkDownRenderer,
} from '@crayonai/react-ui';

// Crayon UI components - Actions
import {
  Button,
  FollowUpBlock,
  FollowUpItem,
} from '@crayonai/react-ui';

// Crayon UI components - Forms
import {
  Input,
  Select,
  CheckBoxGroup,
  CheckBoxItem,
  RadioGroup,
  RadioItem,
  Slider,
  DatePicker,
  TextArea,
  Label,
  FormControl,
} from '@crayonai/react-ui';

// Existing GenUI components (fallback for custom types)
import ComponentRouter from './ComponentRouter';
import QRPaymentComponent from './QRPaymentComponent';

// Adapters
import {
  shouldUseCrayon,
  detectResponseFormat,
} from '../../adapters/CrayonAdapter';

/**
 * Custom component registry
 */
const CUSTOM_COMPONENTS = {
  qr_payment: QRPaymentComponent,
  insurance_quote: null, // TODO: Add InsuranceQuoteComponent
};

/**
 * Component type mapping: Odoo -> Crayon renderer function
 */
const COMPONENT_RENDERERS = {
  // Display
  'gallery': 'renderGallery',
  'card_grid': 'renderCardGrid',
  'card_list': 'renderCardList',
  'card': 'renderCard',
  'rich_card': 'renderCard',
  'detail_card': 'renderCard',
  'carousel': 'renderCarousel',
  'product_carousel': 'renderCarousel',
  'image_gallery': 'renderImageGallery',

  // Data
  'list': 'renderList',
  'table': 'renderTable',
  'data_table': 'renderTable',

  // Charts
  'chart': 'renderChart',
  'line_chart': 'renderLineChart',
  'bar_chart': 'renderBarChart',
  'pie_chart': 'renderPieChart',
  'area_chart': 'renderAreaChart',
  'radar_chart': 'renderRadarChart',

  // Layout
  'accordion': 'renderAccordion',
  'tabs': 'renderTabs',
  'steps': 'renderSteps',

  // Text
  'text': 'renderText',
  'callout': 'renderCallout',
  'code': 'renderCode',
  'markdown': 'renderMarkdown',

  // Actions
  'button': 'renderButton',
  'buttons': 'renderButtons',
  'suggestions': 'renderFollowUp',
  'follow_up': 'renderFollowUp',

  // Forms
  'form': 'renderForm',
  'inline_form': 'renderForm',
};

/**
 * CrayonRenderer component
 */
function CrayonRenderer({
  response,
  onAction,
  onSendMessage,
  context = {},
  fallbackRenderer,
}) {
  // Handle action (CTA click, item click, etc.)
  const handleAction = useCallback((action, item) => {
    console.log('[CrayonRenderer] Action:', action, 'Item:', item);

    if (onAction) {
      onAction(action, item);
    }

    // If action has chat message, send it
    if (action?.chat_message_template && onSendMessage) {
      let message = action.chat_message_template;
      if (item) {
        message = message.replace('{id}', item.id || '');
        message = message.replace('{name}', item.title || item.name || '');
        message = message.replace('{title}', item.title || '');
      }
      onSendMessage(message);
    }

    // Handle follow-up action
    if (action?.type === 'follow_up' && action.message && onSendMessage) {
      onSendMessage(action.message);
    }
  }, [onAction, onSendMessage]);

  // No response or empty
  if (!response) {
    return null;
  }

  // Normalize response format
  const format = detectResponseFormat(response);
  let componentType, props;

  if (format === 'v9') {
    componentType = response.component_type;
    props = response.props || {};
  } else if (format === 'v9-text') {
    return null;
  } else {
    componentType = response.render?.component;
    props = response.data || {};
  }

  if (!componentType) {
    return null;
  }

  // Check if this is a custom component
  const CustomComponent = CUSTOM_COMPONENTS[componentType];
  if (CustomComponent) {
    return <CustomComponent data={props} onAction={handleAction} />;
  }

  // Get renderer function name
  const rendererName = COMPONENT_RENDERERS[componentType];

  if (!rendererName) {
    // Unknown type - use fallback
    if (fallbackRenderer) {
      return fallbackRenderer(response);
    }
    return (
      <ComponentRouter
        response={response}
        onAction={handleAction}
        onSendMessage={onSendMessage}
      />
    );
  }

  // Render using Crayon component
  try {
    return (
      <div className="crayon-renderer">
        {renderComponent(rendererName, props, handleAction)}
      </div>
    );
  } catch (error) {
    console.error('[CrayonRenderer] Render error:', error);
    if (fallbackRenderer) {
      return fallbackRenderer(response);
    }
    return (
      <ComponentRouter
        response={response}
        onAction={handleAction}
        onSendMessage={onSendMessage}
      />
    );
  }
}

/**
 * Render component based on type
 */
function renderComponent(rendererName, props, handleAction) {
  const renderers = {
    // Display
    renderGallery: () => renderGallery(props, handleAction),
    renderCardGrid: () => renderCardGrid(props, handleAction),
    renderCardList: () => renderCardList(props, handleAction),
    renderCard: () => renderCard(props, handleAction),
    renderCarousel: () => renderCarousel(props, handleAction),
    renderImageGallery: () => renderImageGallery(props),

    // Data
    renderList: () => renderList(props, handleAction),
    renderTable: () => renderTable(props, handleAction),

    // Charts
    renderChart: () => renderLineChart(props),
    renderLineChart: () => renderLineChart(props),
    renderBarChart: () => renderBarChart(props),
    renderPieChart: () => renderPieChart(props),
    renderAreaChart: () => renderAreaChart(props),
    renderRadarChart: () => renderRadarChart(props),

    // Layout
    renderAccordion: () => renderAccordion(props),
    renderTabs: () => renderTabs(props),
    renderSteps: () => renderSteps(props),

    // Text
    renderText: () => renderText(props),
    renderCallout: () => renderCallout(props),
    renderCode: () => renderCode(props),
    renderMarkdown: () => renderMarkdown(props),

    // Actions
    renderButton: () => renderButton(props, handleAction),
    renderButtons: () => renderButtons(props, handleAction),
    renderFollowUp: () => renderFollowUp(props, handleAction),

    // Forms
    renderForm: () => renderForm(props, handleAction),
  };

  const renderer = renderers[rendererName];
  return renderer ? renderer() : null;
}

// =============================================================================
// DISPLAY COMPONENTS
// =============================================================================

function renderGallery(props, handleAction) {
  const items = props.items || [];
  const title = props.title;

  return (
    <div className="crayon-gallery">
      {title && <CardHeader title={title} />}
      <Carousel showButtons variant="card">
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={item.id || index}>
              <Card variant="card" className="h-full">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title || ''}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-3">
                  <h4 className="font-semibold text-sm">{item.title || item.name}</h4>
                  {item.subtitle && (
                    <p className="text-xs text-gray-500">{item.subtitle}</p>
                  )}
                  {item.price && (
                    <p className="text-sm font-bold text-primary-600 mt-1">
                      {formatPrice(item.price)}
                    </p>
                  )}
                  {item.ctas && item.ctas.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {item.ctas.map((cta, ctaIdx) => (
                        <Button
                          key={ctaIdx}
                          size="sm"
                          variant={cta.variant || 'secondary'}
                          onClick={() => handleAction(cta, item)}
                        >
                          {cta.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

function renderCardGrid(props, handleAction) {
  const items = props.items || [];
  const columns = props.columns || 2;
  const title = props.title;

  return (
    <div className="crayon-card-grid">
      {title && <CardHeader title={title} />}
      <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {items.map((item, index) => (
          <Card
            key={item.id || index}
            variant="card"
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleAction({ type: 'select' }, item)}
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.title || ''}
                className="w-full h-24 object-cover rounded-t-lg"
              />
            )}
            <div className="p-3">
              <h4 className="font-semibold text-sm">{item.title || item.name}</h4>
              {item.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function renderCardList(props, handleAction) {
  const items = props.items || [];
  const title = props.title;

  return (
    <div className="crayon-card-list">
      {title && <CardHeader title={title} />}
      <ListBlock>
        {items.map((item, index) => (
          <ListItem
            key={item.id || index}
            title={item.title || item.name}
            subtitle={item.subtitle || item.description}
            onClick={() => handleAction({ type: 'select' }, item)}
          />
        ))}
      </ListBlock>
    </div>
  );
}

function renderCard(props, handleAction) {
  const item = props.item || props;

  return (
    <Card variant="card">
      {item.image && (
        <img
          src={item.image}
          alt={item.title || ''}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      )}
      <div className="p-4">
        {item.title && <h3 className="font-bold text-lg">{item.title}</h3>}
        {item.subtitle && <p className="text-sm text-gray-500">{item.subtitle}</p>}
        {item.description && (
          <p className="text-sm text-gray-700 mt-2">{item.description}</p>
        )}
        {item.content && (
          <div className="text-sm text-gray-700 mt-2">{item.content}</div>
        )}
        {item.price && (
          <p className="text-lg font-bold text-primary-600 mt-2">
            {formatPrice(item.price)}
          </p>
        )}
        {item.ctas && item.ctas.length > 0 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {item.ctas.map((cta, index) => (
              <Button
                key={index}
                variant={cta.variant || 'primary'}
                onClick={() => handleAction(cta, item)}
              >
                {cta.label}
              </Button>
            ))}
          </div>
        )}
        {item.actions && item.actions.length > 0 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {item.actions.map((action, index) => (
              <Button
                key={index}
                variant={action.primary ? 'primary' : 'secondary'}
                onClick={() => handleAction(action, item)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function renderCarousel(props, handleAction) {
  const items = props.items || [];
  const title = props.title;

  return (
    <div className="crayon-carousel">
      {title && <CardHeader title={title} />}
      <Carousel showButtons variant="sunk">
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={item.id || index}>
              <Card
                variant="card"
                className="cursor-pointer"
                onClick={() => handleAction({ type: 'select' }, item)}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title || ''}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-3">
                  <h4 className="font-semibold">{item.title || item.name}</h4>
                  {item.price && (
                    <p className="text-primary-600 font-bold">
                      {formatPrice(item.price)}
                    </p>
                  )}
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

function renderImageGallery(props) {
  const images = (props.items || props.images || []).map(item => ({
    src: item.image || item.src || item.url,
    alt: item.title || item.alt || '',
    details: item.description || item.details || '',
  }));

  return <ImageGallery images={images} />;
}

// =============================================================================
// DATA COMPONENTS
// =============================================================================

function renderList(props, handleAction) {
  const items = props.items || [];
  const title = props.title;

  return (
    <div className="crayon-list">
      {title && <CardHeader title={title} />}
      <ListBlock>
        {items.map((item, index) => (
          <ListItem
            key={item.id || index}
            title={item.title || item.name || item.primary}
            subtitle={item.subtitle || item.secondary}
            decorativeIcon={item.icon}
            onClick={() => handleAction({ type: 'select' }, item)}
          />
        ))}
      </ListBlock>
    </div>
  );
}

function renderTable(props, handleAction) {
  const columns = props.columns || [];
  const rows = props.rows || props.items || [];
  const title = props.title;

  const effectiveColumns = columns.length > 0 ? columns :
    (rows.length > 0 ? Object.keys(rows[0]).filter(k => k !== 'id').map(k => ({
      key: k,
      label: k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' ')
    })) : []);

  return (
    <div className="crayon-table">
      {title && <CardHeader title={title} />}
      <Table>
        <TableHeader>
          <TableRow>
            {effectiveColumns.map((col, index) => (
              <TableHead key={col.key || index}>
                {col.label || col.key}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow
              key={row.id || rowIndex}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleAction({ type: 'select' }, row)}
            >
              {effectiveColumns.map((col, colIndex) => (
                <TableCell key={colIndex}>
                  {formatCellValue(row[col.key], col.type)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// =============================================================================
// CHART COMPONENTS
// =============================================================================

function renderLineChart(props) {
  const data = props.data || props.items || [];
  const title = props.title;

  return (
    <div className="crayon-chart">
      {title && <CardHeader title={title} />}
      <LineChart
        data={data}
        xAxisDataKey={props.xAxisKey || 'name'}
        series={props.series || [{ dataKey: props.yAxisKey || 'value', name: 'Value' }]}
      />
    </div>
  );
}

function renderBarChart(props) {
  const data = props.data || props.items || [];
  const title = props.title;

  return (
    <div className="crayon-chart">
      {title && <CardHeader title={title} />}
      <BarChart
        data={data}
        xAxisDataKey={props.xAxisKey || 'name'}
        series={props.series || [{ dataKey: props.yAxisKey || 'value', name: 'Value' }]}
      />
    </div>
  );
}

function renderPieChart(props) {
  const data = props.data || props.items || [];
  const title = props.title;

  return (
    <div className="crayon-chart">
      {title && <CardHeader title={title} />}
      <PieChart
        data={data}
        dataKey={props.dataKey || 'value'}
        nameKey={props.nameKey || 'name'}
      />
    </div>
  );
}

function renderAreaChart(props) {
  const data = props.data || props.items || [];
  const title = props.title;

  return (
    <div className="crayon-chart">
      {title && <CardHeader title={title} />}
      <AreaChart
        data={data}
        xAxisDataKey={props.xAxisKey || 'name'}
        series={props.series || [{ dataKey: props.yAxisKey || 'value', name: 'Value' }]}
      />
    </div>
  );
}

function renderRadarChart(props) {
  const data = props.data || props.items || [];
  const title = props.title;

  return (
    <div className="crayon-chart">
      {title && <CardHeader title={title} />}
      <RadarChart
        data={data}
        dataKey={props.dataKey || 'value'}
      />
    </div>
  );
}

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================

function renderAccordion(props) {
  const sections = props.sections || props.items || [];
  const title = props.title;

  return (
    <div className="crayon-accordion">
      {title && <CardHeader title={title} />}
      <Accordion type="multiple">
        {sections.map((section, index) => (
          <Accordion.Item key={index} value={`item-${index}`}>
            <Accordion.Trigger>{section.title}</Accordion.Trigger>
            <Accordion.Content>{section.content}</Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
}

function renderTabs(props) {
  const tabs = props.tabs || props.items || [];
  const title = props.title;

  return (
    <div className="crayon-tabs">
      {title && <CardHeader title={title} />}
      <Tabs defaultValue={tabs[0]?.id || 'tab-0'}>
        <Tabs.List>
          {tabs.map((tab, index) => (
            <Tabs.Trigger key={index} value={tab.id || `tab-${index}`}>
              {tab.label || tab.title}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {tabs.map((tab, index) => (
          <Tabs.Content key={index} value={tab.id || `tab-${index}`}>
            {tab.content}
          </Tabs.Content>
        ))}
      </Tabs>
    </div>
  );
}

function renderSteps(props) {
  const steps = props.steps || props.items || [];
  const title = props.title;
  const currentStep = props.currentStep || 0;

  return (
    <div className="crayon-steps">
      {title && <CardHeader title={title} />}
      <Steps current={currentStep}>
        {steps.map((step, index) => (
          <Steps.Item
            key={index}
            title={step.title || step.name}
            description={step.description}
            status={step.status}
          />
        ))}
      </Steps>
    </div>
  );
}

// =============================================================================
// TEXT COMPONENTS
// =============================================================================

function renderText(props) {
  const content = props.content || props.text || '';
  const variant = props.variant || 'clear';

  return <TextContent variant={variant}>{content}</TextContent>;
}

function renderCallout(props) {
  const variant = props.variant || 'info';
  const title = props.title;
  const description = props.description || props.content;

  return (
    <Callout variant={variant}>
      {title && <strong>{title}</strong>}
      {description && <p>{description}</p>}
    </Callout>
  );
}

function renderCode(props) {
  const code = props.code || props.content || '';
  const language = props.language || 'javascript';

  return <CodeBlock language={language}>{code}</CodeBlock>;
}

function renderMarkdown(props) {
  const content = props.content || props.text || '';

  return <MarkDownRenderer>{content}</MarkDownRenderer>;
}

// =============================================================================
// ACTION COMPONENTS
// =============================================================================

function renderButton(props, handleAction) {
  return (
    <Button
      variant={props.variant || 'primary'}
      size={props.size || 'md'}
      onClick={() => handleAction(props, null)}
    >
      {props.label || props.text}
    </Button>
  );
}

function renderButtons(props, handleAction) {
  const buttons = props.buttons || props.items || [];

  return (
    <div className="crayon-buttons flex gap-2 flex-wrap">
      {buttons.map((btn, index) => (
        <Button
          key={index}
          variant={btn.variant || 'secondary'}
          size={btn.size || 'md'}
          onClick={() => handleAction(btn, null)}
        >
          {btn.label || btn.text}
        </Button>
      ))}
    </div>
  );
}

function renderFollowUp(props, handleAction) {
  const suggestions = props.suggestions || props.items || [];

  if (suggestions.length === 0) return null;

  return (
    <FollowUpBlock>
      {suggestions.map((suggestion, index) => (
        <FollowUpItem
          key={index}
          onClick={() => handleAction({
            type: 'follow_up',
            message: suggestion.message || suggestion.text || suggestion
          }, null)}
        >
          {suggestion.label || suggestion.text || suggestion}
        </FollowUpItem>
      ))}
    </FollowUpBlock>
  );
}

// =============================================================================
// FORM COMPONENTS
// =============================================================================

function renderForm(props, handleAction) {
  const fields = props.fields || [];
  const title = props.title;
  const submitLabel = props.submitLabel || 'Submit';

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    handleAction({
      type: 'form_submit',
      data,
      humanFriendlyMessage: `Form submitted: ${JSON.stringify(data)}`,
      llmFriendlyMessage: JSON.stringify(data),
    }, null);
  };

  return (
    <form className="crayon-form" onSubmit={handleSubmit}>
      {title && <CardHeader title={title} />}
      <div className="space-y-4 p-4">
        {fields.map((field, index) => (
          <FormControl key={index}>
            <Label htmlFor={field.name}>{field.label}</Label>
            {renderFormField(field)}
          </FormControl>
        ))}
        <Button type="submit" variant="primary">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function renderFormField(field) {
  const { name, type, placeholder, options, required, defaultValue } = field;

  switch (type) {
    case 'textarea':
    case 'text':
      return type === 'textarea' ? (
        <TextArea
          name={name}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
        />
      ) : (
        <Input
          name={name}
          type="text"
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
        />
      );

    case 'number':
      return (
        <Input
          name={name}
          type="number"
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
        />
      );

    case 'email':
      return (
        <Input
          name={name}
          type="email"
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
        />
      );

    case 'select':
    case 'selection':
      return (
        <Select name={name} required={required} defaultValue={defaultValue}>
          {(options || []).map((opt, idx) => (
            <Select.Item key={idx} value={opt.value || opt}>
              {opt.label || opt}
            </Select.Item>
          ))}
        </Select>
      );

    case 'checkbox':
      return (
        <CheckBoxGroup>
          {(options || [{ label: field.label, value: 'true' }]).map((opt, idx) => (
            <CheckBoxItem
              key={idx}
              name={name}
              value={opt.value || opt}
              label={opt.label || opt}
            />
          ))}
        </CheckBoxGroup>
      );

    case 'radio':
      return (
        <RadioGroup name={name} defaultValue={defaultValue}>
          {(options || []).map((opt, idx) => (
            <RadioItem
              key={idx}
              value={opt.value || opt}
              label={opt.label || opt}
            />
          ))}
        </RadioGroup>
      );

    case 'slider':
    case 'range':
      return (
        <Slider
          name={name}
          min={field.min || 0}
          max={field.max || 100}
          step={field.step || 1}
          defaultValue={[defaultValue || field.min || 0]}
        />
      );

    case 'date':
      return (
        <DatePicker
          name={name}
          required={required}
        />
      );

    default:
      return (
        <Input
          name={name}
          type={type || 'text'}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
        />
      );
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatPrice(price) {
  if (!price) return '';
  if (typeof price === 'object') {
    const amount = price.current || price.amount || 0;
    const currency = price.currency || 'VND';
    return `${amount.toLocaleString('vi-VN')} ${currency}`;
  }
  return `${price.toLocaleString('vi-VN')} VND`;
}

function formatCellValue(value, type) {
  if (value === null || value === undefined) return '-';

  switch (type) {
    case 'currency':
      return formatPrice(value);
    case 'date':
      return new Date(value).toLocaleDateString('vi-VN');
    case 'datetime':
      return new Date(value).toLocaleString('vi-VN');
    case 'boolean':
      return value ? 'Co' : 'Khong';
    default:
      return String(value);
  }
}

/**
 * Wrapper hook for using Crayon in chat context
 */
export function useCrayonChat(options = {}) {
  const { onSendMessage, context } = options;

  const renderGenUI = useCallback((response, additionalProps = {}) => {
    return (
      <CrayonRenderer
        response={response}
        onSendMessage={onSendMessage}
        context={context}
        {...additionalProps}
      />
    );
  }, [onSendMessage, context]);

  return {
    renderGenUI,
    shouldUseCrayon,
  };
}

export default CrayonRenderer;
