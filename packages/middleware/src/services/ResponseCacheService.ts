import { ICacheStore } from './interfaces/ICacheStore';
import { InMemoryCacheStore } from './storage/InMemoryCacheStore';
import * as crypto from 'crypto';

export class ResponseCacheService {
    private store: ICacheStore;
    private readonly defaultTTL: number = 3600; // 1 hour

    constructor(store?: ICacheStore) {
        this.store = store || new InMemoryCacheStore();
    }

    /**
     * generate a cache key based on the prompt and optional context
     */
    generateKey(prompt: string, context: any[] = []): string {
        const data = JSON.stringify({ prompt, context });
        return crypto.createHash('md5').update(data).digest('hex');
    }

    async getResponse<T>(key: string): Promise<T | null> {
        return this.store.get<T>(key);
    }

    async cacheResponse<T>(key: string, response: T, ttl?: number): Promise<void> {
        await this.store.set(key, response, ttl || this.defaultTTL);
    }

    async clearCache(): Promise<void> {
        await this.store.clear();
    }
}
