/**
 * HTTP Service for making web requests with proper error handling and caching
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import NodeCache from 'node-cache';
import { logger } from '../utils/logger';

// Interface for cacheable response data
interface CacheableResponse {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, any>;
  url?: string;
}

export class HttpService {
  private client: AxiosInstance;
  private cache: NodeCache;

  constructor() {
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'LLM-Discoverability-Checker/1.0 (+https://llm-checker.com/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      maxRedirects: 5,
      validateStatus: () => true // Accept all status codes
    });

    // Cache responses for 5 minutes
    this.cache = new NodeCache({ stdTTL: 300 });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('HTTP Request Error:', error.message);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`HTTP Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.code === 'ECONNABORTED') {
          logger.warn(`HTTP Timeout: ${error.config?.url}`);
        } else {
          logger.error(`HTTP Error: ${error.message} - ${error.config?.url}`);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Convert Axios response to cacheable format
   */
  private toCacheableResponse(response: AxiosResponse): CacheableResponse {
    return {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: { ...response.headers }, // Spread to avoid circular references
      url: response.config.url
    };
  }

  /**
   * Convert cached response back to Axios response format
   */
  private fromCacheableResponse(cached: CacheableResponse): AxiosResponse {
    return {
      status: cached.status,
      statusText: cached.statusText,
      data: cached.data,
      headers: cached.headers,
      config: { url: cached.url } as any,
    } as AxiosResponse;
  }

  async get(url: string, useCache = true): Promise<AxiosResponse> {
    if (useCache) {
      const cached = this.cache.get<CacheableResponse>(url);
      if (cached) {
        logger.debug(`Cache hit for ${url}`);
        return this.fromCacheableResponse(cached);
      }
    }

    try {
      const response = await this.client.get(url);
      
      if (useCache && response.status === 200) {
        // Cache only the serializable parts of the response
        const cacheableResponse = this.toCacheableResponse(response);
        this.cache.set(url, cacheableResponse);
      }

      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Return error response for analysis
        return {
          status: error.response?.status || 0,
          statusText: error.message,
          data: '',
          headers: {},
          config: error.config || {},
        } as AxiosResponse;
      }
      throw error;
    }
  }

  async head(url: string): Promise<AxiosResponse> {
    try {
      return await this.client.head(url);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          status: error.response?.status || 0,
          statusText: error.message,
          data: '',
          headers: error.response?.headers || {},
          config: error.config || {},
        } as AxiosResponse;
      }
      throw error;
    }
  }

  async measureResponseTime(url: string): Promise<{ response: AxiosResponse; responseTime: number }> {
    const startTime = Date.now();
    const response = await this.get(url, false); // Don't cache timing requests
    const responseTime = Date.now() - startTime;

    return { response, responseTime };
  }

  async getWithRedirectInfo(url: string): Promise<{ response: AxiosResponse; finalUrl: string; isRedirect: boolean }> {
    try {
      const response = await this.client.get(url);
      
      // Check if we were redirected by comparing request URL with response URL
      const finalUrl = response.request?.responseURL || response.config?.url || url;
      const isRedirect = finalUrl !== url;
      
      return {
        response,
        finalUrl,
        isRedirect
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const finalUrl = error.response?.request?.responseURL || error.config?.url || url;
        const isRedirect = finalUrl !== url;
        
        return {
          response: {
            status: error.response?.status || 0,
            statusText: error.message,
            data: '',
            headers: error.response?.headers || {},
            config: error.config || {},
          } as AxiosResponse,
          finalUrl,
          isRedirect
        };
      }
      throw error;
    }
  }

  clearCache(): void {
    this.cache.flushAll();
    logger.info('HTTP cache cleared');
  }

  getCacheStats(): { keys: number; hits: number; misses: number } {
    return this.cache.getStats();
  }
}