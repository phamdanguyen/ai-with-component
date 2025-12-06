"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODOO_TOOLS = void 0;
const search_product_tool_1 = require("./search_product.tool");
const create_sale_order_tool_1 = require("./create_sale_order.tool");
const check_inventory_tool_1 = require("./check_inventory.tool");
const search_customer_tool_1 = require("./search_customer.tool");
const get_order_status_tool_1 = require("./get_order_status.tool");
const create_support_ticket_tool_1 = require("./create_support_ticket.tool");
const lookup_contract_tool_1 = require("./lookup_contract.tool");
exports.ODOO_TOOLS = [
    search_product_tool_1.searchProductTool,
    create_sale_order_tool_1.createSaleOrderTool,
    check_inventory_tool_1.checkInventoryTool,
    search_customer_tool_1.searchCustomerTool,
    get_order_status_tool_1.getOrderStatusTool,
    create_support_ticket_tool_1.createSupportTicketTool,
    lookup_contract_tool_1.lookupContractTool
];
__exportStar(require("./search_product.tool"), exports);
__exportStar(require("./create_sale_order.tool"), exports);
__exportStar(require("./check_inventory.tool"), exports);
__exportStar(require("./search_customer.tool"), exports);
__exportStar(require("./get_order_status.tool"), exports);
__exportStar(require("./create_support_ticket.tool"), exports);
__exportStar(require("./lookup_contract.tool"), exports);
//# sourceMappingURL=index.js.map