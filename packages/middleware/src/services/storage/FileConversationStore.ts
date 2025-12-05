/**
 * FileConversationStore
 *
 * Persist conversations (messages) to a JSON file
 * Simple file-based CLI storage for Phase 2 (Optimization & Memory)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { IConversationStore, StoredMessage } from '../interfaces';

export class FileConversationStore implements IConversationStore {
    private conversations: Map<string, StoredMessage[]> = new Map();
    private filePath: string;
    private isInitialized: boolean = false;

    constructor(dataDir: string = '.data', fileName: string = 'conversations.json') {
        this.filePath = path.join(process.cwd(), dataDir, fileName);
    }

    private async ensureInitialized(): Promise<void> {
        if (this.isInitialized) return;

        try {
            const dir = path.dirname(this.filePath);
            await fs.mkdir(dir, { recursive: true });

            try {
                const data = await fs.readFile(this.filePath, 'utf-8');
                const plainConversations = JSON.parse(data);

                this.conversations.clear();
                for (const [sessionId, messages] of Object.entries(plainConversations)) {
                    this.conversations.set(sessionId, messages as StoredMessage[]);
                }
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                    console.error('Error reading conversations file:', error);
                }
            }

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize FileConversationStore:', error);
            throw error;
        }
    }

    private async saveToFile(): Promise<void> {
        try {
            const plainObj = Object.fromEntries(this.conversations);
            await fs.writeFile(this.filePath, JSON.stringify(plainObj, null, 2), 'utf-8');
        } catch (error) {
            console.error('Failed to save conversations to file:', error);
        }
    }

    async addMessage(sessionId: string, message: Omit<StoredMessage, 'id' | 'sessionId'>): Promise<StoredMessage> {
        await this.ensureInitialized();

        const storedMessage: StoredMessage = {
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

    async getMessages(sessionId: string, limit?: number): Promise<StoredMessage[]> {
        await this.ensureInitialized();
        const messages = this.conversations.get(sessionId) || [];

        if (limit && limit > 0) {
            return messages.slice(-limit);
        }
        return messages;
    }

    async getLastNMessages(sessionId: string, n: number): Promise<StoredMessage[]> {
        await this.ensureInitialized();
        const messages = this.conversations.get(sessionId) || [];
        return messages.slice(-n);
    }

    async getConversationLength(sessionId: string): Promise<number> {
        await this.ensureInitialized();
        const messages = this.conversations.get(sessionId);
        return messages ? messages.length : 0;
    }

    async deleteMessage(sessionId: string, messageId: string): Promise<void> {
        await this.ensureInitialized();
        const messages = this.conversations.get(sessionId);
        if (!messages) return;

        const index = messages.findIndex(m => m.id === messageId);
        if (index === -1) return;

        messages.splice(index, 1);
        this.conversations.set(sessionId, messages);

        await this.saveToFile();
    }

    async searchMessages(query: string): Promise<StoredMessage[]> {
        await this.ensureInitialized();
        const results: StoredMessage[] = [];
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

    async clearConversation(sessionId: string): Promise<void> {
        await this.ensureInitialized();
        if (this.conversations.delete(sessionId)) {
            await this.saveToFile();
        }
    }
}
