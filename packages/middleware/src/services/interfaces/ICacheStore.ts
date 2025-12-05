/**
 * Interface for cache storage implementations
 */
export interface ICacheStore {
    /**
     * Retrieve a value from the cache
     * @param key The cache key
     * @returns The cached value or null if not found/expired
     */
    get<T>(key: string): Promise<T | null>;

    /**
     * Set a value in the cache
     * @param key The cache key
     * @param value The value to store
     * @param ttlSeconds Time to live in seconds (optional)
     */
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

    /**
     * Remove a value from the cache
     * @param key The cache key
     */
    delete(key: string): Promise<void>;

    /**
     * Clear all values from the cache
     */
    clear(): Promise<void>;
}
