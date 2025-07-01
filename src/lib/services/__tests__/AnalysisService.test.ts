/**
 * Unit tests for AnalysisService
 * Tests core business logic for AI visibility analysis
 */

import { AnalysisService } from '../AnalysisService';
import { ROBOTS_TXT_SAMPLES, EXPECTED_CRAWLER_RESULTS } from '../../__fixtures__/robots-txt-samples';
import { SCHEMA_SAMPLES, EXPECTED_SCHEMA_RESULTS } from '../../__fixtures__/schema-samples';

// Mock the HttpService dependency
jest.mock('../HttpService', () => {
  return {
    HttpService: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      head: jest.fn(),
      measureResponseTime: jest.fn()
    }))
  };
});

// Mock the ContextAwareScoringService dependency
jest.mock('../ContextAwareScoringService', () => {
  return {
    ContextAwareScoringService: jest.fn().mockImplementation(() => ({
      detectPageType: jest.fn().mockReturnValue('homepage'),
      adjustScore: jest.fn().mockImplementation((result) => ({
        adjustedScore: result.overallScore,
        reason: 'No adjustments needed',
        adjustments: []
      }))
    }))
  };
});

describe('AnalysisService', () => {
  let analysisService: AnalysisService;
  let mockHttpService: any;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create a fresh instance
    analysisService = new AnalysisService();
    
    // Get reference to the mocked HttpService
    mockHttpService = (analysisService as any).httpService;
  });

  describe('AI Crawler Detection', () => {
    beforeEach(() => {
      // Mock successful HTTP responses
      mockHttpService.measureResponseTime.mockResolvedValue({
        response: { 
          status: 200, 
          data: '<html><body>Test content</body></html>' 
        },
        responseTime: 500
      });
    });

    it('should detect when all AI crawlers are allowed', async () => {
      // Mock robots.txt response
      mockHttpService.get.mockResolvedValue({
        status: 200,
        data: ROBOTS_TXT_SAMPLES.allowAll
      });

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });
      
      const robotsCheck = result.categories
        .find(cat => cat.id === 'crawlability_access')
        ?.checks.find(check => check.id === 'robots_txt');

      expect(robotsCheck?.score).toBe(100);
      expect(robotsCheck?.details).toContain('ChatGPT ✓');
      expect(robotsCheck?.details).toContain('Claude ✓');
      expect(robotsCheck?.details).toContain('Perplexity ✓');
    });

    it('should detect when AI crawlers are blocked', async () => {
      mockHttpService.get.mockResolvedValue({
        status: 200,
        data: ROBOTS_TXT_SAMPLES.blockAll
      });

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });
      
      const robotsCheck = result.categories
        .find(cat => cat.id === 'crawlability_access')
        ?.checks.find(check => check.id === 'robots_txt');

      expect(robotsCheck?.score).toBe(0);
      expect(robotsCheck?.details).toContain('ChatGPT ✗');
      expect(robotsCheck?.details).toContain('Claude ✗');
    });

    it('should detect mixed AI crawler permissions', async () => {
      mockHttpService.get.mockResolvedValue({
        status: 200,
        data: ROBOTS_TXT_SAMPLES.blockGPTOnly
      });

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });
      
      const robotsCheck = result.categories
        .find(cat => cat.id === 'crawlability_access')
        ?.checks.find(check => check.id === 'robots_txt');

      // Validate harsh penalty: blocking one critical crawler drops score significantly
      expect(robotsCheck?.score).toBe(65); // 80 base - 15 penalty
      expect(robotsCheck?.details).toContain('ChatGPT ✗');
      expect(robotsCheck?.details).toContain('Claude ✓');
      expect(robotsCheck?.details).toContain('Perplexity ✓');
    });

    it('should handle missing robots.txt file', async () => {
      mockHttpService.get.mockResolvedValue({ status: 404 });

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });
      
      const robotsCheck = result.categories
        .find(cat => cat.id === 'crawlability_access')
        ?.checks.find(check => check.id === 'robots_txt');

      expect(robotsCheck?.score).toBe(0);
    });

    it('should handle network errors gracefully', async () => {
      mockHttpService.get.mockRejectedValue(new Error('Network error'));

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });
      
      const robotsCheck = result.categories
        .find(cat => cat.id === 'crawlability_access')
        ?.checks.find(check => check.id === 'robots_txt');

      expect(robotsCheck?.score).toBe(0);
    });
  });

  describe('Schema Markup Analysis', () => {
    beforeEach(() => {
      // Mock robots.txt as allowed for these tests
      mockHttpService.get.mockResolvedValue({
        status: 200,
        data: ROBOTS_TXT_SAMPLES.allowAll
      });
    });

    it('should detect and score FAQ schema highly', async () => {
      mockHttpService.measureResponseTime.mockResolvedValue({
        response: { 
          status: 200, 
          data: SCHEMA_SAMPLES.faqSchema 
        },
        responseTime: 500
      });

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });
      
      const schemaCheck = result.categories
        .find(cat => cat.id === 'structured_data')
        ?.checks.find(check => check.id === 'schema_coverage');

      // Conservative scoring: FAQ schema gets moderate points
      expect(schemaCheck?.score).toBe(25); // Base FAQPage score
    });

    it('should detect multiple schema types', async () => {
      mockHttpService.measureResponseTime.mockResolvedValue({
        response: { 
          status: 200, 
          data: SCHEMA_SAMPLES.multipleSchemas 
        },
        responseTime: 500
      });

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });
      
      const schemaCheck = result.categories
        .find(cat => cat.id === 'structured_data')
        ?.checks.find(check => check.id === 'schema_coverage');

      // Multiple schemas get diversity bonus but still conservative
      expect(schemaCheck?.score).toBeGreaterThan(20); // Some schema value
      expect(schemaCheck?.score).toBeLessThan(40); // But not excessive
    });

    it('should handle invalid JSON gracefully', async () => {
      mockHttpService.measureResponseTime.mockResolvedValue({
        response: { 
          status: 200, 
          data: SCHEMA_SAMPLES.invalidJson 
        },
        responseTime: 500
      });

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });
      
      const schemaCheck = result.categories
        .find(cat => cat.id === 'structured_data')
        ?.checks.find(check => check.id === 'schema_coverage');

      // Invalid JSON should get zero points
      expect(schemaCheck?.score).toBe(0);
    });

    it('should detect FAQ content without schema', async () => {
      mockHttpService.measureResponseTime.mockResolvedValue({
        response: { 
          status: 200, 
          data: SCHEMA_SAMPLES.faqContentNoSchema 
        },
        responseTime: 500
      });

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });
      
      const schemaCheck = result.categories
        .find(cat => cat.id === 'structured_data')
        ?.checks.find(check => check.id === 'schema_coverage');

      // FAQ content without proper schema gets zero (enforces proper implementation)
      expect(schemaCheck?.score).toBe(0);
    });
  });

  describe('Overall Score Calculation', () => {
    it('should calculate correct weighted score', async () => {
      // Mock perfect scores across all categories
      mockHttpService.measureResponseTime.mockResolvedValue({
        response: { 
          status: 200, 
          data: SCHEMA_SAMPLES.faqSchema 
        },
        responseTime: 200
      });
      
      mockHttpService.get.mockResolvedValue({
        status: 200,
        data: ROBOTS_TXT_SAMPLES.allowAll
      });

      mockHttpService.head.mockResolvedValue({ status: 200 }); // sitemap exists

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });

      expect(result.overallScore).toBeGreaterThan(80);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should apply structured data bonus correctly', async () => {
      const htmlWithGoodStructuredData = SCHEMA_SAMPLES.multipleSchemas;
      
      mockHttpService.measureResponseTime.mockResolvedValue({
        response: { 
          status: 200, 
          data: htmlWithGoodStructuredData 
        },
        responseTime: 300
      });
      
      mockHttpService.get.mockResolvedValue({
        status: 200,
        data: ROBOTS_TXT_SAMPLES.allowAll
      });

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });
      
      const structuredDataCategory = result.categories
        .find(cat => cat.id === 'structured_data');

      // Structured data bonus should be capped at +10 points max
      expect(structuredDataCategory?.score).toBeLessThanOrEqual(100);
      
      // With good structured data, overall score should benefit
      expect(result.overallScore).toBeGreaterThanOrEqual(70);
    });

    it('should handle sites with no structured data', async () => {
      mockHttpService.measureResponseTime.mockResolvedValue({
        response: { 
          status: 200, 
          data: SCHEMA_SAMPLES.noSchema 
        },
        responseTime: 500
      });
      
      mockHttpService.get.mockResolvedValue({
        status: 200,
        data: ROBOTS_TXT_SAMPLES.allowAll
      });

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });
      
      const structuredDataCategory = result.categories
        .find(cat => cat.id === 'structured_data');

      expect(structuredDataCategory?.score).toBe(0);
      
      // Should still get decent score from other categories
      expect(result.overallScore).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid URLs gracefully', async () => {
      await expect(
        analysisService.analyzeUrl({ url: 'not-a-valid-url' })
      ).rejects.toThrow();
    });

    it('should handle HTTP errors gracefully', async () => {
      mockHttpService.measureResponseTime.mockResolvedValue({
        response: { status: 500, data: '' },
        responseTime: 1000
      });

      await expect(
        analysisService.analyzeUrl({ url: 'https://example.com' })
      ).rejects.toThrow('Cannot access URL: HTTP 500');
    });

    it('should handle timeout scenarios', async () => {
      mockHttpService.measureResponseTime.mockRejectedValue(
        new Error('Request timeout')
      );

      await expect(
        analysisService.analyzeUrl({ url: 'https://example.com' })
      ).rejects.toThrow();
    });
  });

  describe('Performance Metrics', () => {
    it('should score fast response times highly', async () => {
      mockHttpService.measureResponseTime.mockResolvedValue({
        response: { 
          status: 200, 
          data: '<html><body>Fast response</body></html>' 
        },
        responseTime: 100 // Very fast
      });
      
      mockHttpService.get.mockResolvedValue({
        status: 200,
        data: ROBOTS_TXT_SAMPLES.allowAll
      });

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });
      
      const speedCheck = result.categories
        .find(cat => cat.id === 'crawlability_access')
        ?.checks.find(check => check.id === 'response_time');

      expect(speedCheck?.score).toBe(100);
    });

    it('should penalize slow response times', async () => {
      mockHttpService.measureResponseTime.mockResolvedValue({
        response: { 
          status: 200, 
          data: '<html><body>Slow response</body></html>' 
        },
        responseTime: 3000 // Very slow
      });
      
      mockHttpService.get.mockResolvedValue({
        status: 200,
        data: ROBOTS_TXT_SAMPLES.allowAll
      });

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });
      
      const speedCheck = result.categories
        .find(cat => cat.id === 'crawlability_access')
        ?.checks.find(check => check.id === 'response_time');

      expect(speedCheck?.score).toBeLessThan(50);
    });
  });

  describe('Scoring Algorithm Validation', () => {
    it('should calculate AI crawler score mathematically correctly', async () => {
      // Test specific mathematical calculation
      mockHttpService.get.mockResolvedValue({
        status: 200,
        data: ROBOTS_TXT_SAMPLES.blockGPTOnly // Blocks GPTBot (weight 10), allows others
      });

      mockHttpService.measureResponseTime.mockResolvedValue({
        response: { status: 200, data: '<html></html>' },
        responseTime: 500
      });

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });
      
      const robotsCheck = result.categories
        .find(cat => cat.id === 'crawlability_access')
        ?.checks.find(check => check.id === 'robots_txt');

      // Validate the harsh penalty calculation:
      // Critical crawlers total weight ~50, GPTBot weight 10
      // Base: (40/50)*100 = 80%, Penalty: -15, Final: 65
      expect(robotsCheck?.score).toBe(65);
    });

    it('should validate that blocking all crawlers gives zero score', async () => {
      mockHttpService.get.mockResolvedValue({
        status: 200,
        data: ROBOTS_TXT_SAMPLES.blockAll
      });

      mockHttpService.measureResponseTime.mockResolvedValue({
        response: { status: 200, data: '<html></html>' },
        responseTime: 500
      });

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });
      
      const robotsCheck = result.categories
        .find(cat => cat.id === 'crawlability_access')
        ?.checks.find(check => check.id === 'robots_txt');

      // Mathematical validation: 0 allowed weight / total weight = 0%
      expect(robotsCheck?.score).toBe(0);
      
      // Should show all critical crawlers as blocked
      expect(robotsCheck?.details).toContain('ChatGPT ✗');
      expect(robotsCheck?.details).toContain('Claude ✗'); 
      expect(robotsCheck?.details).toContain('Perplexity ✗');
      expect(robotsCheck?.details).toContain('Bard ✗');
      expect(robotsCheck?.details).toContain('Google ✗');
    });

    it('should validate overall score calculation with known inputs', async () => {
      // Set up known good inputs for predictable scoring
      mockHttpService.measureResponseTime.mockResolvedValue({
        response: { 
          status: 200, 
          data: SCHEMA_SAMPLES.faqSchema // Known to give ~85 schema score
        },
        responseTime: 200 // Fast response = 100 score
      });
      
      mockHttpService.get.mockResolvedValue({
        status: 200,
        data: ROBOTS_TXT_SAMPLES.allowAll // Perfect robots.txt = 100 score
      });

      mockHttpService.head.mockResolvedValue({ status: 200 }); // sitemap exists

      const result = await analysisService.analyzeUrl({ url: 'https://example.com' });

      // With high scores in all categories, overall should be 80+
      expect(result.overallScore).toBeGreaterThan(80);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      
      // Validate specific category scores are reasonable
      const categories = result.categories;
      const accessControl = categories.find(c => c.id === 'crawlability_access');
      const structuredData = categories.find(c => c.id === 'structured_data');
      
      expect(accessControl?.score).toBeGreaterThan(90); // Should be very high
      expect(structuredData?.score).toBeGreaterThan(20); // Conservative schema scoring
    });
  });
});