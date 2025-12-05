"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCacheStore = void 0;
class InMemoryCacheStore {
    constructor() {
        this.cache = new Map();
    }
    async get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key, value, ttlSeconds) {
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
        this.cache.set(key, { value, expiresAt });
    }
    async delete(key) {
        this.cache.delete(key);
    }
    async clear() {
        this.cache.clear();
    }
}
exports.InMemoryCacheStore = InMemoryCacheStore;
//# sourceMappingURL=InMemoryCacheStore.js.map