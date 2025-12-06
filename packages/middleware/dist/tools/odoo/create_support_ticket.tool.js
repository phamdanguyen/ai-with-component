"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupportTicketTool = void 0;
exports.createSupportTicketTool = {
    name: 'create_support_ticket',
    description: 'Create a helpdesk ticket in Odoo',
    parameters: {
        type: 'object',
        properties: {
            subject: {
                type: 'string',
                description: 'Ticket title/subject',
            },
            description: {
                type: 'string',
                description: 'Detailed description of the issue',
            },
            partner_id: {
                type: 'number',
                description: 'Customer ID (optional)',
            },
            priority: {
                type: 'string',
                enum: ['0', '1', '2', '3'],
                description: 'Priority (0=Low, 1=Medium, 2=High, 3=Urgent)',
                default: '1'
            }
        },
        required: ['subject', 'description'],
    },
    execute: async (args) => {
        // Mock implementation
        const ticketId = Math.floor(Math.random() * 1000) + 1;
        return {
            success: true,
            ticket_id: ticketId,
            name: `#${ticketId}`,
            stage: 'New',
            message: 'Support ticket created successfully. Our team will contact you shortly.'
        };
    },
    cacheable: false,
};
//# sourceMappingURL=create_support_ticket.tool.js.map