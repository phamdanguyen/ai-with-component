/**
 * Crayon Adapters - Bridge between Odoo AI Chat and Crayon UI SDK
 *
 * This module provides adapters to integrate Crayon UI components
 * with the existing Odoo AI Chat backend.
 *
 * @version 1.0.0
 * @since 2025-12-03
 */

// Core adapter functions
export {
  transformOdooToCrayon,
  transformCrayonActionToOdoo,
  shouldUseCrayon,
  detectResponseFormat,
  COMPONENT_TYPE_MAP,
} from './CrayonAdapter';

// Response templates for CrayonChat
export {
  responseTemplates,
  getTemplateByName,
  hasTemplate,
  registerTemplate,
} from './ResponseTemplates';

// Action handler
export {
  createActionHandler,
  createDefaultActionHandler,
  ACTION_TYPES,
} from './ActionHandler';

// Default export
import CrayonAdapter from './CrayonAdapter';
import responseTemplates from './ResponseTemplates';
import ActionHandler from './ActionHandler';

export default {
  CrayonAdapter,
  responseTemplates,
  ActionHandler,
};
