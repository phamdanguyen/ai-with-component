"use strict";
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
exports.ResponseCacheService = void 0;
const InMemoryCacheStore_1 = require("./storage/InMemoryCacheStore");
const crypto = __importStar(require("crypto"));
class ResponseCacheService {
    constructor(store) {
        this.defaultTTL = 3600; // 1 hour
        this.store = store || new InMemoryCacheStore_1.InMemoryCacheStore();
    }
    /**
     * generate a cache key based on the prompt and optional context
     */
    generateKey(prompt, context = []) {
        const data = JSON.stringify({ prompt, context });
        return crypto.createHash('md5').update(data).digest('hex');
    }
    async getResponse(key) {
        return this.store.get(key);
    }
    async cacheResponse(key, response, ttl) {
        await this.store.set(key, response, ttl || this.defaultTTL);
    }
    async clearCache() {
        await this.store.clear();
    }
}
exports.ResponseCacheService = ResponseCacheService;
//# sourceMappingURL=ResponseCacheService.js.map