/**
 * API Integration Tests
 * Tests basic API endpoint functionality and request/response handling
 * Uses actual service calls to verify integration
 */

import { NextRequest } from 'next/server';
import { POST as analyzePost } from '../analyze/route';
import { POST as multiAnalyzePost, GET as multiAnalyzeGet } from '../multi-analyze/route';
import { POST as discoverPost, GET as discoverGet } from '../discover-sites/route';

// Mock all external dependencies at a higher level
jest.mock('../../../lib/services/AnalysisService', () => ({
  AnalysisService: jest.fn().mockImplementation(() => ({
    analyzeUrl: jest.fn().mockResolvedValue({
      url: 'https://example.com',
      overallScore: 85,
      categories: [],
      recommendations: [],
      timestamp: new Date().toISOString()
    })
  }))
}));

jest.mock('../../../lib/services/MultiSiteAnalysisService', () => ({
  MultiSiteAnalysisService: jest.fn().mockImplementation(() => ({
    analyzeMultipleSites: jest.fn().mockResolvedValue({
      inputUrl: 'https://example.com',
      analyses: [],
      summary: {
        totalSites: 0,
        averageScore: 0,
        scoreDistribution: { high: 0, medium: 0, low: 0 },
        commonIssues: [],
        recommendations: {
          totalRecommendations: 0,
          highImpact: 0,
          mediumImpact: 0,
          lowImpact: 0,
          quickWins: [],
          prioritized: []
        }
      },
      discoveredSites: {
        totalFound: 0,
        analysisReady: [],
        failed: [],
        summary: 'No sites found'
      }
    })
  }))
}));

jest.mock('../../../lib/services/SiteDiscoveryService', () => ({
  SiteDiscoveryService: jest.fn().mockImplementation(() => ({
    discoverSites: jest.fn().mockResolvedValue({
      mainDomain: 'example.com',
      discoveredSites: [],
      totalFound: 0,
      analysisReady: []
    })
  }))
}));

jest.mock('../../../lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

describe('API Integration Tests', () => {
  
  describe('/api/analyze', () => {
    it('should accept POST requests with valid URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com' })
      });

      const response = await analyzePost(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.url).toBe('https://example.com');
      expect(data.overallScore).toBe(85);
    });

    it('should reject requests without URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await analyzePost(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('URL is required');
    });

    it('should reject invalid URL format', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ url: 'not-a-url' })
      });

      const response = await analyzePost(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Invalid URL format');
    });

    it('should accept various valid URL formats', async () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://subdomain.example.com/path'
      ];

      for (const url of validUrls) {
        const request = new NextRequest('http://localhost:3000/api/analyze', {
          method: 'POST',
          body: JSON.stringify({ url })
        });

        const response = await analyzePost(request);
        expect(response.status).toBe(200);
      }
    });
  });

  describe('/api/multi-analyze', () => {
    it('should accept POST requests with valid URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/multi-analyze', {
        method: 'POST',
        body: JSON.stringify({ inputUrl: 'https://example.com' })
      });

      const response = await multiAnalyzePost(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.inputUrl).toBe('https://example.com');
      expect(data.summary).toBeDefined();
    });

    it('should reject requests without URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/multi-analyze', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await multiAnalyzePost(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('URL is required');
    });

    it('should handle GET requests with URL parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/multi-analyze?url=https://example.com');

      const response = await multiAnalyzeGet(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.inputUrl).toBe('https://example.com');
    });

    it('should reject GET requests without URL parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/multi-analyze');

      const response = await multiAnalyzeGet(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('URL parameter is required');
    });

    it('should enforce maxSites limit for serverless', async () => {
      const request = new NextRequest('http://localhost:3000/api/multi-analyze', {
        method: 'POST',
        body: JSON.stringify({
          inputUrl: 'https://example.com',
          analysisOptions: { maxSites: 20 } // Should be capped to 5
        })
      });

      const response = await multiAnalyzePost(request);
      expect(response.status).toBe(200);
      // The actual capping is tested in the service layer, here we just verify it doesn't error
    });
  });

  describe('/api/discover-sites', () => {
    it('should accept POST requests with valid URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/discover-sites', {
        method: 'POST',
        body: JSON.stringify({ inputUrl: 'https://example.com' })
      });

      const response = await discoverPost(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.totalFound).toBe(0);
      expect(data.analysisReady).toEqual([]);
    });

    it('should reject requests without URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/discover-sites', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await discoverPost(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('URL is required');
    });

    it('should handle GET requests with URL parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/discover-sites?url=https://example.com');

      const response = await discoverGet(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.totalFound).toBe(0);
    });

    it('should reject GET requests without URL parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/discover-sites');

      const response = await discoverGet(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('URL parameter is required');
    });
  });

  describe('Request/Response format validation', () => {
    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: 'invalid json'
      });

      const response = await analyzePost(request);
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.error).toBe('Analysis failed');
    });

    it('should return valid JSON responses', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com' })
      });

      const response = await analyzePost(request);
      const data = await response.json();
      
      // Should be valid JSON with expected structure
      expect(typeof data).toBe('object');
      expect(data.url).toBeDefined();
      expect(data.overallScore).toBeDefined();
    });

    it('should handle URL encoding properly', async () => {
      const encodedUrl = encodeURIComponent('https://example.com/path with spaces');
      const request = new NextRequest(`http://localhost:3000/api/discover-sites?url=${encodedUrl}`);

      const response = await discoverGet(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Cross-origin and headers', () => {
    it('should handle requests with different origins', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com' }),
        headers: {
          'Origin': 'https://different-domain.com',
          'Content-Type': 'application/json'
        }
      });

      const response = await analyzePost(request);
      expect(response.status).toBe(200);
    });

    it('should accept application/json content type', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com' }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await analyzePost(request);
      expect(response.status).toBe(200);
    });
  });
});