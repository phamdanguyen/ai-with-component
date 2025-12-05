"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weatherTool = void 0;
exports.weatherTool = {
    name: 'weather',
    description: 'Get current weather for a location',
    parameters: [
        { name: 'location', type: 'string', description: 'City name', required: true }
    ],
    execute: async ({ location }) => {
        // Mock weather API
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate latency
        // Simple mock data
        const mockData = {
            'Tokyo': { temperature: 22, condition: 'sunny' },
            'London': { temperature: 15, condition: 'rainy' },
            'New York': { temperature: 18, condition: 'cloudy' },
            'Hanoi': { temperature: 30, condition: 'humid' }
        };
        const data = mockData[location] || { temperature: 20, condition: 'unknown' };
        return {
            success: true,
            data: { location, ...data },
            executionTime: 0 // Will be overwritten by executor
        };
    }
};
//# sourceMappingURL=weather.tool.js.map