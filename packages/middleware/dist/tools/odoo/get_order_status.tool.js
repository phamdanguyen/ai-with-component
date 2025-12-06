"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderStatusTool = void 0;
exports.getOrderStatusTool = {
    name: 'get_order_status',
    description: 'Get the status of a specific sale order',
    parameters: {
        type: 'object',
        properties: {
            order_name: {
                type: 'string',
                description: 'Order reference (e.g., SO001)',
            },
            order_id: {
                type: 'number',
                description: 'Order ID (optional if name is provided)',
            },
        },
        required: [],
    },
    execute: async (args) => {
        // Mock implementation
        const name = args.order_name || 'SO001';
        return {
            order_name: name,
            state: 'sale', // draft, sent, sale, done, cancel
            delivery_status: 'partially_delivered',
            invoice_status: 'to_invoice',
            date_order: '2025-12-01',
            expected_delivery: '2025-12-10'
        };
    },
    cacheable: true,
    cacheTTL: 60000,
};
//# sourceMappingURL=get_order_status.tool.js.map