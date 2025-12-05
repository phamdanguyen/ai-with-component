import { ICacheStore } from './interfaces/ICacheStore';
export declare class ResponseCacheService {
    private store;
    private readonly defaultTTL;
    constructor(store?: ICacheStore);
    /**
     * generate a cache key based on the prompt and optional context
     */
    generateKey(prompt: string, context?: any[]): string;
    getResponse<T>(key: string): Promise<T | null>;
    cacheResponse<T>(key: string, response: T, ttl?: number): Promise<void>;
    clearCache(): Promise<void>;
}
//# sourceMappingURL=ResponseCacheService.d.ts.map