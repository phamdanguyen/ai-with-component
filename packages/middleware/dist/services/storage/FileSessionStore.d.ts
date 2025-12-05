/**
 * FileSessionStore
 *
 * Persist sessions to a JSON file
 * Simple file-based CLI storage for Phase 2 (Optimization & Memory)
 */
import { ISessionStore, Session } from '../interfaces';
export declare class FileSessionStore implements ISessionStore {
    private sessions;
    private filePath;
    private isInitialized;
    constructor(dataDir?: string, fileName?: string);
    private ensureInitialized;
    private saveToFile;
    createSession(id: string, metadata?: Record<string, unknown>): Promise<Session>;
    getSession(id: string): Promise<Session | null>;
    updateSession(id: string, updates: Partial<Session>): Promise<Session>;
    deleteSession(id: string): Promise<void>;
    listSessions(): Promise<Session[]>;
    sessionExists(id: string): Promise<boolean>;
    touch(id: string): Promise<void>;
}
//# sourceMappingURL=FileSessionStore.d.ts.map