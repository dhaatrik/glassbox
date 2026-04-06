import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeSentiment, generateInsightsReport } from '../src/services/geminiService';

// Mock the @google/genai module
vi.mock('@google/genai', () => {
  const generateContentMock = vi.fn();
  return {
    GoogleGenAI: class {
      models = {
        generateContent: generateContentMock,
      };
    },
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      ARRAY: 'ARRAY',
    },
    // Export the mock so we can access it in tests
    __generateContentMock: generateContentMock,
  };
});

import { __generateContentMock } from '@google/genai';

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeSentiment', () => {
    it('should correctly parse the JSON response and return POSITIVE', async () => {
      __generateContentMock.mockResolvedValueOnce({
        text: JSON.stringify({ sentiment: 'POSITIVE' }),
      });

      const result = await analyzeSentiment('This is great!');
      expect(result).toBe('POSITIVE');
      expect(__generateContentMock).toHaveBeenCalledTimes(1);
    });

    it('should correctly parse the JSON response and return NEGATIVE', async () => {
      __generateContentMock.mockResolvedValueOnce({
        text: JSON.stringify({ sentiment: 'NEGATIVE' }),
      });

      const result = await analyzeSentiment('This is terrible!');
      expect(result).toBe('NEGATIVE');
    });

    it('should gracefully catch a network error and return NEUTRAL', async () => {
      __generateContentMock.mockRejectedValueOnce(new Error('Network error'));

      const result = await analyzeSentiment('Some text');
      expect(result).toBe('NEUTRAL');
    });

    it('should gracefully catch a malformed API response and return NEUTRAL', async () => {
      __generateContentMock.mockResolvedValueOnce({
        text: 'invalid json',
      });

      const result = await analyzeSentiment('Some text');
      expect(result).toBe('NEUTRAL');
    });
  });

  describe('generateInsightsReport', () => {
    it('should correctly format the prompt and enforce the required JSON schema structure', async () => {
      const mockReport = {
        recurringThemes: ['Theme 1'],
        areasOfConcern: ['Concern 1'],
        areasOfPraise: ['Praise 1'],
        topTakeaways: ['Takeaway 1'],
        recommendedActions: ['Action 1'],
      };

      __generateContentMock.mockResolvedValueOnce({
        text: JSON.stringify(mockReport),
      });

      const feedbacks = [
        { sentiment: 'POSITIVE', classification: 'CULTURE', text: 'Great place to work' },
      ];

      const result = await generateInsightsReport(feedbacks);
      
      expect(result).toEqual(mockReport);
      expect(__generateContentMock).toHaveBeenCalledTimes(1);
      
      const callArgs = __generateContentMock.mock.calls[0][0];
      expect(callArgs.model).toBe('gemini-3.1-pro-preview');
      expect(callArgs.contents).toContain('[POSITIVE] CULTURE - Great place to work');
      
      // Verify schema enforcement
      const schema = callArgs.config.responseSchema;
      expect(schema.type).toBe('OBJECT');
      expect(schema.required).toEqual([
        'recurringThemes',
        'areasOfConcern',
        'areasOfPraise',
        'topTakeaways',
        'recommendedActions',
      ]);
    });
  });
});
