"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatorTool = void 0;
exports.calculatorTool = {
    name: 'calculator',
    description: 'Perform mathematical calculations',
    parameters: [
        { name: 'expression', type: 'string', description: 'Math expression', required: true }
    ],
    execute: async ({ expression }) => {
        try {
            // Warning: This is a simple implementation. In production, use a safe parser like 'mathjs'
            // Sanitize input to only allow numbers and basic operators
            const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
            if (sanitized !== expression) {
                throw new Error('Invalid characters in expression');
            }
            const result = new Function(`return ${sanitized}`)();
            return {
                success: true,
                data: { expression, result },
                executionTime: 0
            };
        }
        catch (error) {
            throw new Error(`Calculation failed: ${error.message}`);
        }
    }
};
//# sourceMappingURL=calculator.tool.js.map