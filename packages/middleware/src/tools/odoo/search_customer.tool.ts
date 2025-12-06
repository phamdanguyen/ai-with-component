
import { ToolDefinition } from '../../services/interfaces';

export const searchCustomerTool: ToolDefinition = {
    name: 'search_customer',
    description: 'Search for a customer/partner in Odoo',
    parameters: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'Name, email, or phone number to search',
            },
        },
        required: ['query'],
    },
    execute: async (args) => {
        const query = args.query as string;

        // Mock implementation
        return {
            results: [
                {
                    id: 10,
                    name: 'Azure Interior',
                    email: 'azure@example.com',
                    phone: '(555) 123-4567'
                },
                {
                    id: 12,
                    name: 'Gemini Furniture',
                    email: 'gemini@example.com',
                    phone: '(555) 987-6543'
                }
            ].filter(p => p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.email?.includes(query) ||
                p.phone?.includes(query)),
            count: 2
        };
    },
    cacheable: true,
    cacheTTL: 60000,
};
