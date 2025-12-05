/**
 * QueryClassifierService Tests
 *
 * Tests for query classification and keyword matching
 * Week 3: Prompt Engineering & Optimization
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClassifierService, getQueryClassifier } from '../services/query-classifier.service';

describe('QueryClassifierService', () => {
  let classifier: QueryClassifierService;

  beforeEach(() => {
    // Reset singleton for fresh state
    classifier = getQueryClassifier();
    classifier.clearCache();
  });

  describe('heuristic classification', () => {
    it('should classify data analysis queries correctly', async () => {
      const result = await classifier.classify('Show me sales by region');
      expect(result.type).toBe('data-analysis');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should classify code explanation queries correctly', async () => {
      const result = await classifier.classify('Explain how this function works');
      expect(result.type).toBe('code-explanation');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should classify instruction queries correctly', async () => {
      const result = await classifier.classify('How to set up a database');
      expect(result.type).toBe('instruction');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should classify visualization queries correctly', async () => {
      const result = await classifier.classify('visualize diagram chart');
      expect(result.type).toBe('visualization');
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    it('should classify question queries correctly', async () => {
      const result = await classifier.classify('what is this tell me describe it');
      expect(result.type).toBe('question');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should classify chat queries correctly', async () => {
      const result = await classifier.classify('Hello, how are you?');
      expect(result.type).toBe('chat');
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    it('should fallback to chat for unknown queries', async () => {
      const result = await classifier.classify('xyz abc 123');
      expect(['chat', 'unknown']).toContain(result.type);
    });
  });

  describe('confidence scoring', () => {
    it('should have higher confidence with more matching keywords', async () => {
      const singleKeyword = await classifier.classify('Show data');
      const multipleKeywords = await classifier.classify('Show sales by region trends');

      expect(multipleKeywords.confidence).toBeGreaterThanOrEqual(singleKeyword.confidence);
    });

    it('should boost confidence with multiple matching keywords', async () => {
      const result = await classifier.classify('Analyze and show sales data metrics');
      expect(result.keywords.length).toBeGreaterThan(2);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should have confidence between 0 and 1', async () => {
      const queries = [
        'data analysis',
        'code explanation',
        'hello',
        'xyz',
      ];

      for (const query of queries) {
        const result = await classifier.classify(query);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('suggested components', () => {
    it('should suggest chart for data analysis queries', async () => {
      const result = await classifier.classify('Show sales by region');
      expect(result.suggestedComponent).toBe('chart');
    });

    it('should suggest card for code explanation queries', async () => {
      const result = await classifier.classify('Explain this function');
      expect(result.suggestedComponent).toBe('card');
    });

    it('should suggest chart for visualization queries', async () => {
      const result = await classifier.classify('Create a chart');
      expect(result.suggestedComponent).toBe('chart');
    });
  });

  describe('caching', () => {
    it('should cache classification results', async () => {
      const query = 'Show me sales data';

      const result1 = await classifier.classify(query);
      const result2 = await classifier.classify(query);

      expect(result1).toEqual(result2);
    });

    it('should maintain cache stats', async () => {
      await classifier.classify('Query 1');
      await classifier.classify('Query 2');
      await classifier.classify('Query 1');

      const stats = classifier.getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBeGreaterThan(0);
    });

    it('should clear cache on demand', async () => {
      await classifier.classify('Query 1');
      const statsBefore = classifier.getCacheStats();
      expect(statsBefore.size).toBeGreaterThan(0);

      classifier.clearCache();
      const statsAfter = classifier.getCacheStats();
      expect(statsAfter.size).toBe(0);
    });

    it('should not exceed cache size limit', async () => {
      // Generate many queries
      for (let i = 0; i < 1100; i++) {
        await classifier.classify(`Query ${i}`);
      }

      const stats = classifier.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
    });
  });

  describe('classifyAll method', () => {
    it('should return scores for all query types', async () => {
      const scores = classifier.classifyAll('Show me a chart of sales data');

      expect(scores['data-analysis']).toBeDefined();
      expect(scores['code-explanation']).toBeDefined();
      expect(scores['instruction']).toBeDefined();
      expect(scores['visualization']).toBeDefined();
      expect(scores['question']).toBeDefined();
      expect(scores['chat']).toBeDefined();
      expect(scores['unknown']).toBeDefined();
    });

    it('should have highest score for most relevant type', async () => {
      const scores = classifier.classifyAll('Show sales by region');
      const maxType = Object.entries(scores).reduce(([maxKey, maxVal], [key, val]) =>
        val > maxVal ? [key, val] : [maxKey, maxVal]
      )[0];

      expect(maxType).toBe('data-analysis');
    });
  });

  describe('analyzeClassification method', () => {
    it('should return detailed classification analysis', async () => {
      const analysis = classifier.analyzeClassification('Show me sales data');

      expect(analysis.message).toBe('Show me sales data');
      expect(analysis.length).toBe('Show me sales data'.length);
      expect(analysis.keywords).toBeDefined();
      expect(Array.isArray(analysis.keywords)).toBe(true);
      expect(analysis.scores).toBeDefined();
      expect(analysis.topTypes).toBeDefined();
      expect(analysis.topTypes.length).toBeGreaterThan(0);
    });

    it('should return top 3 types in analysis', async () => {
      const analysis = classifier.analyzeClassification('What is this code');
      expect(analysis.topTypes.length).toBeLessThanOrEqual(3);
    });
  });

  describe('method property', () => {
    it('should return heuristic or fallback method', async () => {
      const result = await classifier.classify('Show me sales by region');
      expect(['heuristic', 'fallback']).toContain(result.method);
    });
  });

  describe('keyword extraction', () => {
    it('should extract relevant keywords', async () => {
      const result = await classifier.classify('Show sales revenue by region');
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.keywords).toContain('show');
    });

    it('should remove duplicate keywords', async () => {
      const result = await classifier.classify('Show show show sales sales');
      const uniqueKeywords = new Set(result.keywords);
      expect(uniqueKeywords.size).toBe(result.keywords.length);
    });
  });

  describe('case insensitivity', () => {
    it('should classify regardless of case', async () => {
      const lower = await classifier.classify('show me sales data');
      const upper = await classifier.classify('SHOW ME SALES DATA');

      expect(lower.type).toBe(upper.type);
    });
  });
});
