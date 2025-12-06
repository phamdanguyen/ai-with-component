/**
 * ResponseTemplates - Register SuperChat custom components with Crayon
 *
 * Maps response types to React components for Crayon's CrayonChat.
 * Includes both Crayon standard components and SuperChat custom components.
 *
 * @version 1.0.0
 * @since 2025-12-03
 */

import React from 'react';

// Import existing SuperChat components (custom/specialized)
import QRPaymentComponent from '../components/genui/QRPaymentComponent';
import GalleryComponent from '../components/genui/GalleryComponent';
import { InsuranceCheckoutForm, InsuranceComparisonCard } from '../components/insurance';
import ProductCarousel from '../components/b2c/ProductCarousel';
import OrderPanel from '../components/b2c/OrderPanel';
import CalculatorPanel from '../components/b2c/CalculatorPanel';

/**
 * QR Payment Template
 * Specialized component for VietQR bank transfers
 */
const QRPaymentTemplate = ({ data, onAction }) => {
  return (
    <QRPaymentComponent
      data={data}
      onAction={onAction}
    />
  );
};

/**
 * Insurance Quote Template
 * Shows insurance comparison and checkout
 */
const InsuranceQuoteTemplate = ({ data, onAction }) => {
  const quotes = data?.quotes || data?.items || [];
  const selectedQuote = data?.selected;

  if (selectedQuote) {
    return (
      <InsuranceCheckoutForm
        quote={selectedQuote}
        onSubmit={(formData) => onAction?.({ type: 'checkout', data: formData })}
      />
    );
  }

  return (
    <div className="space-y-4">
      {quotes.map((quote, idx) => (
        <InsuranceComparisonCard
          key={quote.id || idx}
          quote={quote}
          onSelect={() => onAction?.({ type: 'select_quote', data: quote })}
        />
      ))}
    </div>
  );
};

/**
 * Product Carousel Template
 * Shows products in a horizontal carousel
 */
const ProductCarouselTemplate = ({ data, onAction }) => {
  const products = data?.products || data?.items || [];

  return (
    <ProductCarousel
      products={products}
      onProductClick={(product) => onAction?.({ type: 'view_product', data: product })}
      onAddToCart={(product) => onAction?.({ type: 'add_to_cart', data: product })}
    />
  );
};

/**
 * Order Panel Template
 * Shows order summary and checkout
 */
const OrderPanelTemplate = ({ data, onAction }) => {
  return (
    <OrderPanel
      order={data}
      onCheckout={() => onAction?.({ type: 'checkout', data })}
      onUpdateQuantity={(item, qty) => onAction?.({ type: 'update_quantity', data: { item, qty } })}
    />
  );
};

/**
 * Calculator Panel Template
 * Interactive calculator for quotes
 */
const CalculatorPanelTemplate = ({ data, onAction }) => {
  return (
    <CalculatorPanel
      config={data?.config}
      initialValues={data?.values}
      onCalculate={(values) => onAction?.({ type: 'calculate', data: values })}
    />
  );
};

/**
 * Gallery Template
 * Image gallery with lightbox
 */
const GalleryTemplate = ({ data, onAction }) => {
  const images = data?.images || data?.items || [];

  return (
    <GalleryComponent
      images={images}
      onImageClick={(image, idx) => onAction?.({ type: 'view_image', data: { image, index: idx } })}
    />
  );
};

/**
 * Response Templates for CrayonChat
 *
 * Each template maps a response name to a React component.
 * Crayon will use these templates when rendering responses.
 *
 * Usage with CrayonChat:
 * ```jsx
 * import { responseTemplates } from './adapters/ResponseTemplates';
 *
 * <CrayonChat templates={responseTemplates} />
 * ```
 */
export const responseTemplates = [
  // SuperChat Custom Components
  {
    name: 'qr_payment',
    component: QRPaymentTemplate,
  },
  {
    name: 'insurance_quote',
    component: InsuranceQuoteTemplate,
  },
  {
    name: 'product_carousel',
    component: ProductCarouselTemplate,
  },
  {
    name: 'order_panel',
    component: OrderPanelTemplate,
  },
  {
    name: 'calculator',
    component: CalculatorPanelTemplate,
  },
  {
    name: 'gallery',
    component: GalleryTemplate,
  },
];

/**
 * Get template by name
 *
 * @param {string} name - Template name
 * @returns {Object|null} Template object or null
 */
export function getTemplateByName(name) {
  return responseTemplates.find(t => t.name === name) || null;
}

/**
 * Check if a template exists
 *
 * @param {string} name - Template name
 * @returns {boolean} True if template exists
 */
export function hasTemplate(name) {
  return responseTemplates.some(t => t.name === name);
}

/**
 * Register additional template at runtime
 *
 * @param {string} name - Template name
 * @param {React.Component} component - React component
 */
export function registerTemplate(name, component) {
  if (!hasTemplate(name)) {
    responseTemplates.push({ name, component });
  }
}

export default responseTemplates;
