
import { searchProductTool } from './search_product.tool';
import { createSaleOrderTool } from './create_sale_order.tool';
import { checkInventoryTool } from './check_inventory.tool';
import { searchCustomerTool } from './search_customer.tool';
import { getOrderStatusTool } from './get_order_status.tool';
import { createSupportTicketTool } from './create_support_ticket.tool';
import { lookupContractTool } from './lookup_contract.tool';

export const ODOO_TOOLS = [
    searchProductTool,
    createSaleOrderTool,
    checkInventoryTool,
    searchCustomerTool,
    getOrderStatusTool,
    createSupportTicketTool,
    lookupContractTool
];

export * from './search_product.tool';
export * from './create_sale_order.tool';
export * from './check_inventory.tool';
export * from './search_customer.tool';
export * from './get_order_status.tool';
export * from './create_support_ticket.tool';
export * from './lookup_contract.tool';
