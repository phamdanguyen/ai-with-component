
import { ToolDefinition } from '../../services/interfaces';

export const searchProductTool: ToolDefinition = {
    name: 'search_product',
    description: 'Search for products in Odoo database by name or keyword',
    parameters: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'Search keyword (product name, reference, etc.)',
            },
            limit: {
                type: 'number',
                description: 'Maximum number of results to return',
                default: 5,
            },
        },
        required: ['query'],
    },
    execute: async (args) => {
        const query = args.query as string;
        const limit = (args.limit as number) || 5;

        // TODO: Replace with actual Odoo API call
        console.log(`[OdooTool] Searching products for: ${query}`);

        // Mock response for now
        return {
            results: [
                {
                    id: 1,
                    name: 'Office Chair Black',
                    default_code: 'FURN_7777',
                    list_price: 85.0,
                    qty_available: 15,
                },
                {
                    id: 2,
                    name: 'Corner Desk Right Sit',
                    default_code: 'FURN_8888',
                    list_price: 150.0,
                    qty_available: 3,
                },
            ].filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
            count: 2,
        };
    },
    cacheable: true,
    cacheTTL: 60000, // 1 minute
};
