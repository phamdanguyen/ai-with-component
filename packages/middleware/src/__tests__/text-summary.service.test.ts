import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TextSummaryService } from '../services/text-summary.service';
import { ITextGenerator } from '../services/interfaces';
import { ChatMessage } from '../types/core.types';

describe('TextSummaryService', () => {
    let service: TextSummaryService;
    let mockTextGenerator: ITextGenerator;

    beforeEach(() => {
        mockTextGenerator = {
            generateText: vi.fn().mockResolvedValue('Summary'),
            streamText: vi.fn(),
        };
        service = new TextSummaryService(mockTextGenerator);
        vi.clearAllMocks();
    });

    describe('Context Formatting', () => {
        it('should format context with roles correctly', async () => {
            const context: ChatMessage[] = [
                { role: 'user', content: 'Hello' },
                { role: 'assistant', content: 'Hi there' },
            ];

            await service.generateSummary('How are you?', [], context);

            const generateCall = vi.mocked(mockTextGenerator.generateText).mock.calls[0];
            const prompt = generateCall[0];

            expect(prompt).toContain('User: Hello');
            expect(prompt).toContain('Assistant: Hi there');
        });

        it('should use sliding window (last 5 messages)', async () => {
            const context: ChatMessage[] = [
                { role: 'user', content: '1' },
                { role: 'assistant', content: '2' },
                { role: 'user', content: '3' },
                { role: 'assistant', content: '4' },
                { role: 'user', content: '5' },
                { role: 'assistant', content: '6' },
            ];

            await service.generateSummary('Next', [], context);

            const generateCall = vi.mocked(mockTextGenerator.generateText).mock.calls[0];
            const prompt = generateCall[0];

            // Should contain 2, 3, 4, 5, 6
            expect(prompt).toContain('Assistant: 2');
            expect(prompt).toContain('User: 3');
            expect(prompt).toContain('Assistant: 6');

            // Should NOT contain 1
            expect(prompt).not.toContain('User: 1\n');
        });
    });
});
