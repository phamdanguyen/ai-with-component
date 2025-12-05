"use strict";
/**
 * FileConversationStore
 *
 * Persist conversations (messages) to a JSON file
 * Simple file-based CLI storage for Phase 2 (Optimization & Memory)
 */
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileConversationStore = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class FileConversationStore {
    constructor(dataDir = '.data', fileName = 'conversations.json') {
        this.conversations = new Map();
        this.isInitialized = false;
        this.filePath = path.join(process.cwd(), dataDir, fileName);
    }
    async ensureInitialized() {
        if (this.isInitialized)
            return;
        try {
            const dir = path.dirname(this.filePath);
            await fs.mkdir(dir, { recursive: true });
            try {
                const data = await fs.readFile(this.filePath, 'utf-8');
                const plainConversations = JSON.parse(data);
                this.conversations.clear();
                for (const [sessionId, messages] of Object.entries(plainConversations)) {
                    this.conversations.set(sessionId, messages);
                }
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    console.error('Error reading conversations file:', error);
                }
            }
            this.isInitialized = true;
        }
        catch (error) {
            console.error('Failed to initialize FileConversationStore:', error);
            throw error;
        }
    }
    async saveToFile() {
        try {
            const plainObj = Object.fromEntries(this.conversations);
            await fs.writeFile(this.filePath, JSON.stringify(plainObj, null, 2), 'utf-8');
        }
        catch (error) {
            console.error('Failed to save conversations to file:', error);
        }
    }
    async addMessage(sessionId, message) {
        await this.ensureInitialized();
        const storedMessage = {
            ...message,
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            sessionId,
        };
        const messages = this.conversations.get(sessionId) || [];
        messages.push(storedMessage);
        this.conversations.set(sessionId, messages);
        await this.saveToFile();
        return storedMessage;
    }
    async getMessages(sessionId, limit) {
        await this.ensureInitialized();
        const messages = this.conversations.get(sessionId) || [];
        if (limit && limit > 0) {
            return messages.slice(-limit);
        }
        return messages;
    }
    async getLastNMessages(sessionId, n) {
        await this.ensureInitialized();
        const messages = this.conversations.get(sessionId) || [];
        return messages.slice(-n);
    }
    async getConversationLength(sessionId) {
        await this.ensureInitialized();
        const messages = this.conversations.get(sessionId);
        return messages ? messages.length : 0;
    }
    async deleteMessage(sessionId, messageId) {
        await this.ensureInitialized();
        const messages = this.conversations.get(sessionId);
        if (!messages)
            return;
        const index = messages.findIndex(m => m.id === messageId);
        if (index === -1)
            return;
        messages.splice(index, 1);
        this.conversations.set(sessionId, messages);
        await this.saveToFile();
    }
    async searchMessages(query) {
        await this.ensureInitialized();
        const results = [];
        const lowerQuery = query.toLowerCase();
        for (const messages of this.conversations.values()) {
            for (const msg of messages) {
                if (msg.content.toLowerCase().includes(lowerQuery)) {
                    results.push(msg);
                }
            }
        }
        return results;
    }
    async clearConversation(sessionId) {
        await this.ensureInitialized();
        if (this.conversations.delete(sessionId)) {
            await this.saveToFile();
        }
    }
}
exports.FileConversationStore = FileConversationStore;
//# sourceMappingURL=FileConversationStore.js.map