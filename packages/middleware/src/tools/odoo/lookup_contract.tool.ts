
import { ToolDefinition } from '../../services/interfaces';

export const lookupContractTool: ToolDefinition = {
    name: 'lookup_contract',
    description: 'Find an insurance or service contract',
    parameters: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'Contract number, License Plate, or Customer Name',
            },
            type: {
                type: 'string',
                enum: ['insurance', 'service', 'subscription'],
                description: 'Type of contract to search',
                default: 'insurance'
            }
        },
        required: ['query'],
    },
    execute: async (args) => {
        // Mock implementation
        return {
            contracts: [
                {
                    id: 55,
                    name: 'INS/2025/001',
                    type: 'Bike Insurance',
                    start_date: '2025-01-01',
                    end_date: '2026-01-01',
                    state: 'running',
                    insured_value: '30,000,000 VND',
                    vehicle: 'Vision 2023 - 29A-123.45'
                }
            ],
            count: 1
        };
    },
    cacheable: true,
    cacheTTL: 60000,
};
