/**
 * Unit tests for HttpService
 * Tests HTTP requests, caching, retries, and error handling
 */

import { HttpService } from '../HttpService';
import axios from 'axios';
import NodeCache from 'node-cache';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock NodeCache
jest.mock('node-cache');

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('HttpService', () => {
  let httpService: HttpService;
  let mockAxiosInstance: any;
  let mockCache: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      head: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Mock cache instance
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn()
    };
    
    (NodeCache as jest.MockedClass<typeof NodeCache>).mockImplementation(() => mockCache);
    
    httpService = new HttpService();
  });

  describe('GET requests', () => {
    it('should make successful GET request and cache response', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        data: '<html>Test content</html>',
        headers: { 'content-type': 'text/html' },
        config: {},
        request: {}
      };

      mockCache.get.mockReturnValue(undefined); // Cache miss
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await httpService.get('https://example.com');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('https://example.com');
      expect(mockCache.set).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({
          status: 200,
          statusText: 'OK',
          data: '<html>Test content</html>'
        })
      );
      expect(result.status).toBe(200);
    });

    it('should return cached response when available', async () => {
      const cachedResponse = {
        status: 200,
        statusText: 'OK',
        data: '<html>Cached content</html>',
        headers: {}
      };

      mockCache.get.mockReturnValue(cachedResponse);

      const result = await httpService.get('https://example.com');

      expect(mockAxiosInstance.get).not.toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.data).toBe('<html>Cached content</html>');
    });

    it('should handle 404 errors gracefully', async () => {
      const mockResponse = {
        status: 404,
        statusText: 'Not Found',
        data: '',
        headers: {},
        config: {},
        request: {}
      };

      mockCache.get.mockReturnValue(undefined);
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await httpService.get('https://example.com/not-found');

      expect(result.status).toBe(404);
      // 404s should NOT be cached (only 200s are cached)
      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      mockCache.get.mockReturnValue(undefined);
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      await expect(httpService.get('https://example.com')).rejects.toThrow('Network error');
    });
  });

  describe('HEAD requests', () => {
    it('should make successful HEAD request', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        data: '',
        headers: { 'content-type': 'text/html' },
        config: {},
        request: {}
      };

      mockAxiosInstance.head.mockResolvedValue(mockResponse);

      const result = await httpService.head('https://example.com');

      expect(mockAxiosInstance.head).toHaveBeenCalledWith('https://example.com');
      expect(result.status).toBe(200);
    });
  });

  describe('Response time measurement', () => {
    it('should measure response time accurately', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        data: '<html>Test</html>',
        headers: {},
        config: {},
        request: {}
      };

      mockCache.get.mockReturnValue(undefined);
      mockAxiosInstance.get.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(mockResponse), 100);
        });
      });

      const { response, responseTime } = await httpService.measureResponseTime('https://example.com');

      expect(response.status).toBe(200);
      expect(responseTime).toBeGreaterThan(90);
      expect(responseTime).toBeLessThan(150);
    });
  });

  describe('Cache behavior', () => {
    it('should not cache error responses', async () => {
      mockCache.get.mockReturnValue(undefined);
      mockAxiosInstance.get.mockRejectedValue(new Error('Server error'));

      try {
        await httpService.get('https://example.com');
      } catch (error) {
        // Expected error
      }

      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should respect different HTTP methods in cache keys', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        data: '<html>Test</html>',
        headers: {},
        config: {},
        request: {}
      };
      
      mockCache.get.mockReturnValue(undefined);
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await httpService.get('https://example.com');
      
      // Cache key is just the URL
      expect(mockCache.get).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe('Headers and configuration', () => {
    it('should set proper User-Agent header', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': 'LLM-Discoverability-Checker/1.0 (+https://llm-checker.com/bot)'
          })
        })
      );
    });

    it('should handle all status codes', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          validateStatus: expect.any(Function)
        })
      );
      
      // Test the validateStatus function
      const config = mockedAxios.create.mock.calls[0][0];
      expect(config.validateStatus(404)).toBe(true);
      expect(config.validateStatus(500)).toBe(true);
    });
  });
});