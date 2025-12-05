/**
 * FileSessionStore
 *
 * Persist sessions to a JSON file
 * Simple file-based CLI storage for Phase 2 (Optimization & Memory)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ISessionStore, Session } from '../interfaces';

export class FileSessionStore implements ISessionStore {
    private sessions: Map<string, Session> = new Map();
    private filePath: string;
    private isInitialized: boolean = false;

    constructor(dataDir: string = '.data', fileName: string = 'sessions.json') {
        this.filePath = path.join(process.cwd(), dataDir, fileName);
    }

    private async ensureInitialized(): Promise<void> {
        if (this.isInitialized) return;

        try {
            const dir = path.dirname(this.filePath);
            await fs.mkdir(dir, { recursive: true });

            try {
                const data = await fs.readFile(this.filePath, 'utf-8');
                const plainSessions = JSON.parse(data);

                this.sessions.clear();
                for (const [id, session] of Object.entries(plainSessions)) {
                    const s = session as Session;
                    s.createdAt = new Date(s.createdAt);
                    if (s.updatedAt) s.updatedAt = new Date(s.updatedAt);
                    s.lastAccessedAt = new Date(s.lastAccessedAt);
                    this.sessions.set(id, s);
                }
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                    console.error('Error reading sessions file:', error);
                }
            }

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize FileSessionStore:', error);
            throw error;
        }
    }

    private async saveToFile(): Promise<void> {
        try {
            const plainObj = Object.fromEntries(this.sessions);
            await fs.writeFile(this.filePath, JSON.stringify(plainObj, null, 2), 'utf-8');
        } catch (error) {
            console.error('Failed to save sessions to file:', error);
        }
    }

    async createSession(id: string, metadata?: Record<string, unknown>): Promise<Session> {
        await this.ensureInitialized();

        const now = new Date();
        const session: Session = {
            id,
            createdAt: now,
            updatedAt: now,
            lastAccessedAt: now,
            messages: [],
            metadata,
        };

        this.sessions.set(id, session);
        await this.saveToFile();
        return session;
    }

    async getSession(id: string): Promise<Session | null> {
        await this.ensureInitialized();
        const session = this.sessions.get(id);
        if (session) {
            session.lastAccessedAt = new Date();
            this.sessions.set(id, session);
            // Debounce save in production
            this.saveToFile();
        }
        return session || null;
    }

    async updateSession(id: string, updates: Partial<Session>): Promise<Session> {
        await this.ensureInitialized();
        const session = this.sessions.get(id);
        if (!session) {
            throw new Error(`Session not found: ${id}`);
        }

        const updatedSession = {
            ...session,
            ...updates,
            updatedAt: new Date(),
            lastAccessedAt: new Date()
        };
        this.sessions.set(id, updatedSession);
        await this.saveToFile();
        return updatedSession;
    }

    async deleteSession(id: string): Promise<void> {
        await this.ensureInitialized();
        if (this.sessions.delete(id)) {
            await this.saveToFile();
        }
    }

    async listSessions(): Promise<Session[]> {
        await this.ensureInitialized();
        return Array.from(this.sessions.values());
    }

    async sessionExists(id: string): Promise<boolean> {
        await this.ensureInitialized();
        return this.sessions.has(id);
    }

    async touch(id: string): Promise<void> {
        await this.ensureInitialized();
        const session = this.sessions.get(id);
        if (session) {
            session.lastAccessedAt = new Date();
            this.sessions.set(id, session);
            await this.saveToFile();
        }
    }
}
