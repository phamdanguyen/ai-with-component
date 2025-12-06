import { ToolExecutionService } from './services/tool-execution.service';
import { ODOO_TOOLS } from './tools/odoo';

async function verifyOdooTools() {
    console.log('Starting Odoo Tools Verification...');
    const toolExecutor = new ToolExecutionService();

    // 1. Register Tools
    console.log('Registering tools...');
    ODOO_TOOLS.forEach(tool => toolExecutor.registerTool(tool));
    console.log(`Registered ${ODOO_TOOLS.length} tools.`);

    // 2. Verify Search Product
    console.log('\n--- Verifying search_product ---');
    try {
        const result = await toolExecutor.executeTool('search_product', { query: 'desk', limit: 1 });
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Failed:', err);
    }

    // 3. Verify Search Customer
    console.log('\n--- Verifying search_customer ---');
    try {
        const result = await toolExecutor.executeTool('search_customer', { query: 'Azure' });
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Failed:', err);
    }

    // 4. Verify Check Inventory
    console.log('\n--- Verifying check_inventory ---');
    try {
        const result = await toolExecutor.executeTool('check_inventory', { product_id: 1 });
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Failed:', err);
    }

    console.log('\nVerification Complete.');
}

verifyOdooTools().catch(console.error);
