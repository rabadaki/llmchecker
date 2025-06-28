/**
 * Simple in-memory cache for API responses
 * Helps reduce analysis time for recently analyzed URLs
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Generate cache key for URL analysis
  static generateUrlKey(url: string, options?: any): string {
    const normalizedUrl = url.toLowerCase().replace(/\/$/, '');
    const optionsHash = options ? JSON.stringify(options) : '';
    return `analysis:${normalizedUrl}:${optionsHash}`;
  }
}

// Global cache instance
export const analysisCache = new SimpleCache();

// Clean up expired entries every 10 minutes
if (typeof window === 'undefined') { // Only on server
  setInterval(() => {
    analysisCache.cleanup();
  }, 10 * 60 * 1000);
}