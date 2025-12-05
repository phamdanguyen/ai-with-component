
import { Tool } from '../types';
import { ToolRegistry } from '../tool-registry';

// Mock Vector DB interface
interface VectorDB {
    search(query: string, limit: number): Promise<string[]>; // returns tool names
}

// Simple keyword mock
const mockVectorDB: VectorDB = {
    async search(query: string, limit: number) {
        const registry = ToolRegistry.getInstance();
        const allTools = registry.list();

        // Simple relevance score based on keyword overlap in description
        const scoredTools = allTools.map(tool => {
            // Filter out short words to avoid noise (e.g. "a", "in")
            const keywords = query.toLowerCase().split(' ')
                .map(k => k.trim())
                .filter(k => k.length > 2);

            let score = 0;
            keywords.forEach(kw => {
                if (tool.name.toLowerCase().includes(kw)) score += 5; // Higher weight for name match
                if (tool.description.toLowerCase().includes(kw)) score += 1;
            });

            // Debug log
            if (score > 0) {
                console.log(`[Compass] Match: ${tool.name} (Score: ${score}) for keywords: ${keywords.join(', ')}`);
            }

            return { tool, score };
        });

        return scoredTools
            .filter(t => t.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(t => t.tool.name);
    }
};

export const compassTool: Tool = {
    name: 'compass',
    description: 'Navigate the tool system. Ask me to find tools for a specific task.',
    parameters: [
        { name: 'intent', type: 'string', description: 'What do you want to do?', required: true }
    ],
    execute: async ({ intent }) => {
        // 1. Search for relevant tools
        const relevantToolNames = await mockVectorDB.search(intent, 3);

        const registry = ToolRegistry.getInstance();
        const suggestions = relevantToolNames.map(name => {
            const tool = registry.get(name);
            return tool ? { name: tool.name, description: tool.description } : null;
        }).filter(Boolean);

        if (suggestions.length === 0) {
            return {
                success: true,
                data: { message: "No specific tools found. Try rephrasing." },
                executionTime: 0
            };
        }

        return {
            success: true,
            data: {
                message: `Found ${suggestions.length} relevant tools for "${intent}"`,
                suggestions
            },
            executionTime: 0
        };
    }
};
