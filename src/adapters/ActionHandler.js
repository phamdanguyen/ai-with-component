/**
 * ActionHandler - Bridge Crayon actions to Odoo API
 *
 * Handles user interactions from Crayon UI components
 * and routes them to appropriate Odoo API endpoints.
 *
 * @version 1.0.0
 * @since 2025-12-03
 */

/**
 * Action types supported by the handler
 */
export const ACTION_TYPES = {
  // Chat actions
  CHAT: 'chat',
  SEND_MESSAGE: 'send_message',

  // Form actions
  FORM_SUBMIT: 'form_submit',
  FORM_VALIDATE: 'form_validate',

  // Item actions
  VIEW_DETAIL: 'view_detail',
  SELECT: 'select',
  ADD_TO_CART: 'add_to_cart',
  REMOVE: 'remove',

  // Bulk actions
  BULK_SELECT: 'bulk_select',
  BULK_DELETE: 'bulk_delete',
  BULK_EXPORT: 'bulk_export',

  // Navigation
  NAVIGATE: 'navigate',
  OPEN_URL: 'open_url',

  // Custom
  CUSTOM: 'custom',
  INSTANT: 'instant',
  CONFIRM: 'confirm',
};

/**
 * Create an action handler instance
 *
 * @param {Object} options - Handler options
 * @param {Function} options.sendMessage - Function to send chat message
 * @param {Function} options.callApi - Function to call Odoo API
 * @param {Function} options.navigate - Function to navigate
 * @param {Object} options.context - Additional context (session, agent, etc.)
 * @returns {Object} Action handler instance
 */
export function createActionHandler(options) {
  const {
    sendMessage,
    callApi,
    navigate,
    context = {},
  } = options;

  /**
   * Handle Crayon action
   *
   * @param {Object} action - Action object from Crayon
   * @returns {Promise<Object>} Action result
   */
  async function handleAction(action) {
    const { type, data, item, humanFriendlyMessage, llmFriendlyMessage } = action;

    // Log action for debugging
    console.log('[ActionHandler] Handling action:', { type, data, item });

    try {
      switch (type) {
        case ACTION_TYPES.CHAT:
        case ACTION_TYPES.SEND_MESSAGE:
          return await handleChatAction(action);

        case ACTION_TYPES.FORM_SUBMIT:
          return await handleFormSubmit(action);

        case ACTION_TYPES.VIEW_DETAIL:
        case ACTION_TYPES.SELECT:
          return await handleItemAction(action);

        case ACTION_TYPES.ADD_TO_CART:
          return await handleAddToCart(action);

        case ACTION_TYPES.NAVIGATE:
          return handleNavigate(action);

        case ACTION_TYPES.OPEN_URL:
          return handleOpenUrl(action);

        case ACTION_TYPES.CONFIRM:
          return await handleConfirmAction(action);

        case ACTION_TYPES.INSTANT:
        case ACTION_TYPES.CUSTOM:
        default:
          return await handleCustomAction(action);
      }
    } catch (error) {
      console.error('[ActionHandler] Error handling action:', error);
      throw error;
    }
  }

  /**
   * Handle chat/message actions
   */
  async function handleChatAction(action) {
    const { humanFriendlyMessage, llmFriendlyMessage, data } = action;

    // Use llmFriendlyMessage for backend, humanFriendlyMessage for display
    const message = llmFriendlyMessage || humanFriendlyMessage || data?.message;

    if (sendMessage && message) {
      await sendMessage(message, {
        displayMessage: humanFriendlyMessage,
        isFromAction: true,
        actionData: data,
      });
    }

    return { success: true, type: 'chat' };
  }

  /**
   * Handle form submission
   */
  async function handleFormSubmit(action) {
    const { data, formId } = action;

    if (callApi) {
      const result = await callApi('/superchat/api/form/submit', {
        method: 'POST',
        body: JSON.stringify({
          form_id: formId,
          data: data,
          context: context,
        }),
      });

      return { success: true, type: 'form_submit', result };
    }

    // Fallback: Send form data as chat message
    if (sendMessage) {
      const formDataStr = Object.entries(data)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');

      await sendMessage(`Form submitted: ${formDataStr}`, {
        isFormSubmission: true,
        formData: data,
      });
    }

    return { success: true, type: 'form_submit' };
  }

  /**
   * Handle item view/select actions
   */
  async function handleItemAction(action) {
    const { type, item, data } = action;
    const itemData = item || data;

    if (callApi) {
      const result = await callApi('/superchat/api/item/action', {
        method: 'POST',
        body: JSON.stringify({
          action_type: type,
          item_id: itemData?.id,
          item_data: itemData,
          context: context,
        }),
      });

      return { success: true, type, result };
    }

    // Fallback: Send as chat message
    if (sendMessage) {
      await sendMessage(`Selected: ${itemData?.name || itemData?.title || itemData?.id}`, {
        isItemAction: true,
        item: itemData,
      });
    }

    return { success: true, type };
  }

  /**
   * Handle add to cart
   */
  async function handleAddToCart(action) {
    const { item, data, quantity = 1 } = action;
    const product = item || data;

    if (callApi) {
      const result = await callApi('/superchat/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          product_id: product?.id,
          quantity: quantity,
          product_data: product,
          context: context,
        }),
      });

      return { success: true, type: 'add_to_cart', result };
    }

    return { success: true, type: 'add_to_cart', product, quantity };
  }

  /**
   * Handle navigation
   */
  function handleNavigate(action) {
    const { url, path, target = '_self' } = action.data || action;

    if (navigate) {
      navigate(path || url);
    } else if (path) {
      window.location.href = path;
    }

    return { success: true, type: 'navigate' };
  }

  /**
   * Handle open URL
   */
  function handleOpenUrl(action) {
    const { url, target = '_blank' } = action.data || action;

    if (url) {
      window.open(url, target);
    }

    return { success: true, type: 'open_url' };
  }

  /**
   * Handle confirm action (with confirmation dialog)
   */
  async function handleConfirmAction(action) {
    const { confirmMessage, data, item } = action;

    const confirmed = window.confirm(confirmMessage || 'Are you sure?');

    if (!confirmed) {
      return { success: false, type: 'confirm', cancelled: true };
    }

    // Execute the underlying action
    return await handleCustomAction({
      ...action,
      type: action.confirmedAction || ACTION_TYPES.INSTANT,
    });
  }

  /**
   * Handle custom/instant actions
   */
  async function handleCustomAction(action) {
    const { actionId, data, item, llmFriendlyMessage } = action;

    if (callApi) {
      const result = await callApi('/superchat/api/action/execute', {
        method: 'POST',
        body: JSON.stringify({
          action_id: actionId || action.id,
          action_type: action.type,
          data: data,
          item: item,
          llm_message: llmFriendlyMessage,
          context: context,
        }),
      });

      return { success: true, type: 'custom', result };
    }

    // Fallback: Send llmFriendlyMessage to chat
    if (sendMessage && llmFriendlyMessage) {
      await sendMessage(llmFriendlyMessage, {
        isActionMessage: true,
        actionData: action,
      });
    }

    return { success: true, type: 'custom' };
  }

  return {
    handleAction,
    handleChatAction,
    handleFormSubmit,
    handleItemAction,
    handleAddToCart,
    handleNavigate,
    handleOpenUrl,
    handleConfirmAction,
    handleCustomAction,
  };
}

/**
 * Default action handler (uses window.fetch for API calls)
 */
export function createDefaultActionHandler(options = {}) {
  const defaultCallApi = async (url, fetchOptions) => {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions?.headers,
      },
    });
    return response.json();
  };

  return createActionHandler({
    callApi: defaultCallApi,
    ...options,
  });
}

export default {
  createActionHandler,
  createDefaultActionHandler,
  ACTION_TYPES,
};
