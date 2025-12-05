"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolRegistry = void 0;
const tool_executor_1 = require("./tool-executor");
class ToolRegistry {
    constructor() {
        this.tools = new Map();
        this.executor = new tool_executor_1.ToolExecutor();
    }
    static getInstance() {
        if (!ToolRegistry.instance) {
            ToolRegistry.instance = new ToolRegistry();
        }
        return ToolRegistry.instance;
    }
    register(tool) {
        if (this.tools.has(tool.name)) {
            console.warn(`[ToolRegistry] Tool ${tool.name} is already registered. Overwriting.`);
        }
        this.tools.set(tool.name, tool);
    }
    unregister(name) {
        if (this.tools.has(name)) {
            this.tools.delete(name);
        }
    }
    get(name) {
        return this.tools.get(name);
    }
    list() {
        return Array.from(this.tools.values());
    }
    async execute(name, params) {
        const tool = this.get(name);
        if (!tool) {
            return {
                success: false,
                error: `Tool ${name} not found`,
                executionTime: 0
            };
        }
        return this.executor.execute(tool, params);
    }
}
exports.ToolRegistry = ToolRegistry;
//# sourceMappingURL=tool-registry.js.map