"use strict";
/**
 * FileSessionStore
 *
 * Persist sessions to a JSON file
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
exports.FileSessionStore = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class FileSessionStore {
    constructor(dataDir = '.data', fileName = 'sessions.json') {
        this.sessions = new Map();
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
                const plainSessions = JSON.parse(data);
                this.sessions.clear();
                for (const [id, session] of Object.entries(plainSessions)) {
                    const s = session;
                    s.createdAt = new Date(s.createdAt);
                    if (s.updatedAt)
                        s.updatedAt = new Date(s.updatedAt);
                    s.lastAccessedAt = new Date(s.lastAccessedAt);
                    this.sessions.set(id, s);
                }
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    console.error('Error reading sessions file:', error);
                }
            }
            this.isInitialized = true;
        }
        catch (error) {
            console.error('Failed to initialize FileSessionStore:', error);
            throw error;
        }
    }
    async saveToFile() {
        try {
            const plainObj = Object.fromEntries(this.sessions);
            await fs.writeFile(this.filePath, JSON.stringify(plainObj, null, 2), 'utf-8');
        }
        catch (error) {
            console.error('Failed to save sessions to file:', error);
        }
    }
    async createSession(id, metadata) {
        await this.ensureInitialized();
        const now = new Date();
        const session = {
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
    async getSession(id) {
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
    async updateSession(id, updates) {
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
    async deleteSession(id) {
        await this.ensureInitialized();
        if (this.sessions.delete(id)) {
            await this.saveToFile();
        }
    }
    async listSessions() {
        await this.ensureInitialized();
        return Array.from(this.sessions.values());
    }
    async sessionExists(id) {
        await this.ensureInitialized();
        return this.sessions.has(id);
    }
    async touch(id) {
        await this.ensureInitialized();
        const session = this.sessions.get(id);
        if (session) {
            session.lastAccessedAt = new Date();
            this.sessions.set(id, session);
            await this.saveToFile();
        }
    }
}
exports.FileSessionStore = FileSessionStore;
//# sourceMappingURL=FileSessionStore.js.map