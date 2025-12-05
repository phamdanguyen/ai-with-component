"use strict";
/**
 * MockLLMService
 *
 * Mock LLM service for development and testing
 * Implements both ITextGenerator and IStructuredGenerator interfaces
 * Returns realistic demo responses without requiring API keys
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockLLMService = void 0;
class MockLLMService {
    constructor(apiKey = 'mock', model = 'mock-model') {
        // Store but don't validate (mock doesn't need real API key)
    }
    async generateText(prompt, options) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300));
        // Return contextual mock response based on prompt
        if (prompt.toLowerCase().includes('date') || prompt.toLowerCase().includes('today')) {
            return `Today's date is December 4, 2025. It's a Wednesday, marking the start of an exciting week ahead.`;
        }
        if (prompt.toLowerCase().includes('weather')) {
            return `The weather is currently pleasant with partly cloudy skies. Temperature is around 22°C (72°F) with moderate humidity. Light breeze from the west.`;
        }
        if (prompt.toLowerCase().includes('calculate') || prompt.toLowerCase().includes('math')) {
            return `The mathematical calculation has been completed successfully. For complex operations, I recommend using the dedicated calculator tool.`;
        }
        // Generic response
        return `This is a mock response for development testing. In production, this would be replaced with a real response from Gemini API. Your question was: "${prompt.substring(0, 100)}..."`;
    }
    async *streamText(prompt, options) {
        const text = await this.generateText(prompt, options);
        const chunks = text.split(' ');
        for (const chunk of chunks) {
            await new Promise((resolve) => setTimeout(resolve, 50));
            yield chunk + ' ';
        }
    }
    async generateStructured(prompt, schema, options) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Return mock component spec based on the request
        const mockResponse = this.generateMockComponentSpec(prompt);
        return mockResponse;
    }
    validateOutput(data, schema) {
        // Simple validation - just check that data is an object
        return typeof data === 'object' && data !== null;
    }
    generateMockComponentSpec(prompt) {
        // Extract user request part to avoid matching system instructions
        // Prompt structure: ## User Request:\n{query}\n\n## ...
        const userRequestPart = prompt.split('## User Request:')[1]?.split('##')[0] || prompt;
        const searchTarget = userRequestPart.toLowerCase();
        // Return different components based on prompt keywords
        if (searchTarget.includes('table')) {
            return {
                type: 'table',
                id: 'mock-table-001',
                props: {
                    title: 'Sample Data Table',
                    columns: [
                        { key: 'id', label: 'ID', sortable: true },
                        { key: 'name', label: 'Name', sortable: true },
                        { key: 'status', label: 'Status', sortable: true },
                    ],
                    data: [
                        { id: 1, name: 'John Doe', status: 'Active' },
                        { id: 2, name: 'Jane Smith', status: 'Inactive' },
                        { id: 3, name: 'Bob Johnson', status: 'Active' },
                    ],
                },
            };
        }
        if (searchTarget.includes('form')) {
            return {
                type: 'form',
                id: 'mock-form-001',
                props: {
                    title: 'Sample Contact Form',
                    fields: [
                        { type: 'text', name: 'name', label: 'Full Name', required: true },
                        { type: 'email', name: 'email', label: 'Email Address', required: true },
                        { type: 'textarea', name: 'message', label: 'Message', required: false },
                    ],
                },
            };
        }
        if (searchTarget.includes('list')) {
            return {
                type: 'list',
                id: 'mock-list-001',
                props: {
                    title: 'Feature Highlights',
                    items: [
                        { label: 'Fast Processing', icon: 'lightning' },
                        { label: 'Secure Storage', icon: 'shield' },
                        { label: 'Easy Integration', icon: 'plug' },
                        { label: ' 24/7 Support', icon: 'support' },
                    ],
                },
            };
        }
        if (searchTarget.includes('chart')) {
            return {
                type: 'chart',
                id: 'mock-chart-001',
                props: {
                    chartType: 'bar',
                    title: 'Monthly Revenue',
                    data: [
                        { month: 'Jan', revenue: 5000 },
                        { month: 'Feb', revenue: 7000 },
                        { month: 'Mar', revenue: 12000 },
                    ],
                    xAxis: { key: 'month' },
                    yAxis: { key: 'revenue' }
                }
            };
        }
        if (searchTarget.includes('report')) {
            return {
                type: 'report',
                id: 'mock-report-001',
                props: {
                    title: 'Performance Report - Q4 2025',
                    sections: [
                        {
                            title: 'Executive Summary',
                            metrics: [
                                { label: 'Revenue', value: '$1.2M', status: 'positive' },
                                { label: 'Growth', value: '23%', status: 'positive' },
                                { label: 'Churn', value: '2.1%', status: 'negative' },
                            ],
                        },
                    ],
                },
            };
        }
        // Default response - card component
        return {
            type: 'card',
            id: 'mock-card-001',
            props: {
                title: 'Mock Component',
                description: 'This is a mock component generated for testing purposes',
                content: `Response to: ${searchTarget.substring(0, 50)}...`,
            },
        };
    }
}
exports.MockLLMService = MockLLMService;
//# sourceMappingURL=MockLLMService.js.map