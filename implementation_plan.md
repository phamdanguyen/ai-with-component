# Implementation Plan - Sprint 6: Caching & Smart Context

## Goal Description
Implement a Response Caching system to improve response times for repetitive queries and a Smart Context Management strategy to handle conversation history efficiently, preventing token limit issues and optimizing API costs.

## User Review Required
> [!IMPORTANT]
> **Context Window Truncation**: Older messages will be removed from the context window sent to the LLM when the limit is reached. The System Prompt will ALWAYS be preserved. This might affect the bot's ability to recall very old details in a long conversation.

## Proposed Changes

### Packages / Middleware

#### [NEW] Caching Infrastructure
- `packages/middleware/src/services/interfaces/ICacheStore.ts`: Interface definitions for cache stores.
- `packages/middleware/src/services/storage/InMemoryCacheStore.ts`: In-memory implementation of ICacheStore with TTL support.
- `packages/middleware/src/services/ResponseCacheService.ts`: Service to manage caching logic (get, set, key generation).

#### [MODIFY] Chat Service Integration
- `packages/middleware/src/services/ChatService.ts`: 
    - Inject `ResponseCacheService`.
    - Check cache before sending request to LLM.
    - Save successful LLM responses to cache.

#### [MODIFY] Context Management
- `packages/middleware/src/services/PromptService.ts` (or `LLMProvider` depending on current arch):
    - Implement `truncateContext(messages: Message[], limit: number)` function.
    - Ensure `system` messages are never truncated.
    - Use a sliding window approach for `user` and `assistant` messages.

## Verification Plan

### Automated Tests
- **Unit Tests**:
    - `InMemoryCacheStore`: Verify `set`, `get`, and TTL expiration.
    - `ResponseCacheService`: Verify key generation and interaction with store.
    - `PromptService`: Verify context truncation logic (preserving system prompt, removing old messages).

### Manual Verification
1. **Cache Test**:
    - Send message "Hello". Note the time.
    - Send message "Hello" again immediately.
    - **Expectation**: Second response is near instantaneous (<500ms).
2. **Context Limit Test**:
    - Configure a small context window (e.g., 5 messages).
    - Send 10 messages in a conversation.
    - **Expectation**: No "Token Limit Exceeded" error. Bot should respond to the latest context but might forget the 1st message details.
