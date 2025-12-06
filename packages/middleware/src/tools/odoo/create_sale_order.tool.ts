
import { ToolDefinition } from '../../services/interfaces';

export const createSaleOrderTool: ToolDefinition = {
    name: 'create_sale_order',
    description: 'Create a new quotation/sale order in Odoo',
    parameters: {
        type: 'object',
        properties: {
            partner_id: {
                type: 'number',
                description: 'Customer ID',
            },
            order_lines: {
                type: 'array',
                description: 'List of products and quantities',
                items: {
                    type: 'object',
                    properties: {
                        product_id: { type: 'number' },
                        product_uom_qty: { type: 'number' },
                    },
                    required: ['product_id', 'product_uom_qty'],
                },
            },
        },
        required: ['partner_id', 'order_lines'],
    },
    execute: async (args) => {
        // Mock implementation
        const orderId = Math.floor(Math.random() * 1000) + 1;
        const name = `SO${2025000 + orderId}`;
        return {
            success: true,
            order_id: orderId,
            name: name,
            amount_total: 1500.0, // Mock amount
            state: 'draft',
            message: `Quotation ${name} created successfully`,
        };
    },
    cacheable: false, // Creating data should not be cached
};
