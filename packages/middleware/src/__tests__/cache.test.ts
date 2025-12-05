import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryCacheStore } from '../services/storage/InMemoryCacheStore';
import { ResponseCacheService } from '../services/ResponseCacheService';

describe('Caching System', () => {
    describe('InMemoryCacheStore', () => {
        let store: InMemoryCacheStore;

        beforeEach(() => {
            store = new InMemoryCacheStore();
        });

        it('should store and retrieve values', async () => {
            await store.set('key1', 'value1');
            const val = await store.get('key1');
            expect(val).toBe('value1');
        });

        it('should return null for missing keys', async () => {
            const val = await store.get('missing');
            expect(val).toBeNull();
        });

        it('should respect TTL', async () => {
            // Set with 0.1s TTL
            await store.set('short', 'lived', 0.1);

            const valImmediate = await store.get('short');
            expect(valImmediate).toBe('lived');

            // Wait 150ms
            await new Promise(r => setTimeout(r, 150));

            const valExpired = await store.get('short');
            expect(valExpired).toBeNull();
        });

        it('should delete keys', async () => {
            await store.set('key1', 'val1');
            await store.delete('key1');
            const val = await store.get('key1');
            expect(val).toBeNull();
        });
    });

    describe('ResponseCacheService', () => {
        let service: ResponseCacheService;

        beforeEach(() => {
            service = new ResponseCacheService();
        });

        it('should generate consistent keys', () => {
            const key1 = service.generateKey('hello', [{ role: 'user', content: 'hi' }]);
            const key2 = service.generateKey('hello', [{ role: 'user', content: 'hi' }]);
            const key3 = service.generateKey('hello', [{ role: 'user', content: 'bye' }]);

            expect(key1).toBe(key2);
            expect(key1).not.toBe(key3);
        });

        it('should cache and retrieve responses', async () => {
            const key = service.generateKey('test');
            const response = { text: 'response' };

            await service.cacheResponse(key, response);
            const cached = await service.getResponse(key);

            expect(cached).toEqual(response);
        });
    });
});
