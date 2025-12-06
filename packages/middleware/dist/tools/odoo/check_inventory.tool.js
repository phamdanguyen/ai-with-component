"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkInventoryTool = void 0;
exports.checkInventoryTool = {
    name: 'check_inventory',
    description: 'Check stock availability for a product in a specific warehouse',
    parameters: {
        type: 'object',
        properties: {
            product_id: {
                type: 'number',
                description: 'Product ID to check',
            },
            warehouse_id: {
                type: 'number',
                description: 'Optional Warehouse ID',
            },
        },
        required: ['product_id'],
    },
    execute: async (args) => {
        const productId = args.product_id;
        // Mock implementation
        return {
            product_id: productId,
            qty_available: 25.0,
            virtual_available: 20.0, // Forecasted
            incoming_qty: 5.0,
            outgoing_qty: 10.0,
            location: 'WH/Stock',
        };
    },
    cacheable: true,
    cacheTTL: 30000, // 30 seconds
};
//# sourceMappingURL=check_inventory.tool.js.map