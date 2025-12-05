/**
 * FileConversationStore
 *
 * Persist conversations (messages) to a JSON file
 * Simple file-based CLI storage for Phase 2 (Optimization & Memory)
 */
import { IConversationStore, StoredMessage } from '../interfaces';
export declare class FileConversationStore implements IConversationStore {
    private conversations;
    private filePath;
    private isInitialized;
    constructor(dataDir?: string, fileName?: string);
    private ensureInitialized;
    private saveToFile;
    addMessage(sessionId: string, message: Omit<StoredMessage, 'id' | 'sessionId'>): Promise<StoredMessage>;
    getMessages(sessionId: string, limit?: number): Promise<StoredMessage[]>;
    getLastNMessages(sessionId: string, n: number): Promise<StoredMessage[]>;
    getConversationLength(sessionId: string): Promise<number>;
    deleteMessage(sessionId: string, messageId: string): Promise<void>;
    searchMessages(query: string): Promise<StoredMessage[]>;
    clearConversation(sessionId: string): Promise<void>;
}
//# sourceMappingURL=FileConversationStore.d.ts.map