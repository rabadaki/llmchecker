/**
 * Site Discovery Service for Multi-Site Analysis
 * Automatically discovers related pages using subdomain and path patterns
 */

import { HttpService } from './HttpService';
import { logger } from '../utils/logger';

export interface DiscoveredSite {
  url: string;
  type: 'main' | 'subdomain' | 'path';
  category: 'homepage' | 'docs' | 'blog' | 'api' | 'support' | 'shop' | 'unknown';
  discovered: boolean;
  accessible: boolean;
  isRedirect?: boolean;
  finalUrl?: string;
}

export interface DiscoveryResult {
  originalUrl: string;
  finalUrl: string;
  accessible: boolean;
  isRedirect: boolean;
  statusCode: number;
}

export type SiteType = 'developer-platform' | 'ecommerce' | 'saas' | 'content-site' | 'corporate' | 'unknown';

export interface SiteDiscoveryResult {
  mainDomain: string;
  discoveredSites: DiscoveredSite[];
  totalFound: number;
  analysisReady: DiscoveredSite[];
}

export class SiteDiscoveryService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  /**
   * Smart discovery of related sites with intelligence and deduplication
   */
  async discoverSites(inputUrl: string): Promise<SiteDiscoveryResult> {
    const startTime = Date.now();
    logger.info(`Starting smart site discovery for: ${inputUrl}`);

    try {
      const mainDomain = this.extractMainDomain(inputUrl);
      const normalizedUrl = this.normalizeUrl(inputUrl);

      // Phase 1: Analyze main site for intelligence
      logger.info(`Phase 1: Analyzing main site structure for ${normalizedUrl}`);
      let mainSiteContent = '';
      let siteType: DiscoveredSite['category'] = 'unknown';
      let discoveryHints: string[] = [];
      
      try {
        mainSiteContent = await this.fetchMainSiteContent(normalizedUrl);
        siteType = await this.detectSiteType(normalizedUrl, mainSiteContent);
        discoveryHints = this.extractDiscoveryHints(mainSiteContent);
        logger.info(`Detected site type: ${siteType}, found ${discoveryHints.length} hints`);
      } catch (error) {
        logger.warn(`Failed to analyze main site content, using fallback approach:`, error);
        siteType = 'homepage';
        discoveryHints = [];
      }

      // Phase 2: Generate smart candidates
      logger.info(`Phase 2: Generating contextual candidates`);
      const mappedSiteType = this.mapCategoryToSiteType(siteType);
      const candidates = this.generateSmartCandidates(normalizedUrl, mainDomain, mappedSiteType, discoveryHints);
      
      logger.info(`Generated ${candidates?.length || 0} smart candidates`);

      // Phase 3: Test candidates with redirect following
      logger.info(`Phase 3: Testing candidates with redirect awareness`);
      const results = await this.testCandidatesWithRedirects(candidates || []);

      // Phase 4: Intelligent deduplication
      logger.info(`Phase 4: Deduplicating results`);
      const uniqueResults = this.deduplicateResults(results);

      // Phase 5: Convert to DiscoveredSite format
      const discoveredSites = uniqueResults.map(result => this.convertToDiscoveredSite(result, mainDomain));
      const analysisReady = discoveredSites.filter(site => site.accessible);

      const result: SiteDiscoveryResult = {
        mainDomain,
        discoveredSites,
        totalFound: discoveredSites.length,
        analysisReady
      };

      const duration = Date.now() - startTime;
      logger.info(`Smart discovery completed for ${mainDomain} in ${duration}ms - Found ${result.totalFound} unique sites, ${analysisReady.length} ready for analysis`);

      return result;
    } catch (error) {
      logger.error(`Smart site discovery failed for ${inputUrl}:`, error);
      throw error;
    }
  }


  /**
   * Check if a site is accessible
   */
  async checkSiteAccessibility(url: string): Promise<boolean> {
    try {
      const response = await this.httpService.get(url);
      const isAccessible = response.status >= 200 && response.status < 400;
      
      if (!isAccessible) {
        logger.debug(`Site not accessible: ${url} - Status: ${response.status}`);
      }
      
      return isAccessible;
    } catch (error) {
      logger.debug(`Site not accessible: ${url} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Extract main domain from URL
   */
  private extractMainDomain(url: string): string {
    try {
      // Add protocol if missing
      let normalizedUrl = url;
      if (!normalizedUrl.startsWith('http')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      
      const urlObj = new URL(normalizedUrl);
      let hostname = urlObj.hostname;
      
      // Remove www prefix if present
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }
      
      return hostname;
    } catch (error) {
      throw new Error(`Invalid URL: ${url}`);
    }
  }

  /**
   * Normalize URL format
   */
  private normalizeUrl(url: string): string {
    try {
      // Add protocol if missing
      let normalizedUrl = url;
      if (!normalizedUrl.startsWith('http')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      
      const urlObj = new URL(normalizedUrl);
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
    } catch (error) {
      throw new Error(`Invalid URL: ${url}`);
    }
  }


  /**
   * Fetch and analyze main site content
   */
  private async fetchMainSiteContent(url: string): Promise<string> {
    try {
      const response = await this.httpService.get(url);
      return response.data || '';
    } catch (error) {
      logger.debug(`Failed to fetch main site content for ${url}:`, error);
      return '';
    }
  }


  /**
   * Extract discovery hints from HTML content
   */
  private extractDiscoveryHints(htmlContent: string): string[] {
    if (!htmlContent) {
      return [];
    }
    
    const hints: string[] = [];
    
    try {
      // Extract from navigation links
      const navMatches = htmlContent.match(/<nav[^>]*>.*?<\/nav>/gi);
      if (navMatches && navMatches.length > 0) {
        for (const nav of navMatches) {
          const hrefMatches = nav.match(/href=["']([^"']+)["']/gi);
          if (hrefMatches && hrefMatches.length > 0) {
            for (const href of hrefMatches) {
              const url = href.match(/href=["']([^"']+)["']/i)?.[1];
              if (url && this.isValidDiscoveryHint(url)) {
                hints.push(this.normalizeDiscoveryUrl(url));
              }
            }
          }
        }
      }
      
      // Extract from link tags
      const linkMatches = htmlContent.match(/<link[^>]+>/gi);
      if (linkMatches && linkMatches.length > 0) {
        for (const link of linkMatches) {
          if (link.includes('rel="help"') || link.includes('rel="alternate"')) {
            const url = link.match(/href=["']([^"']+)["']/i)?.[1];
            if (url && this.isValidDiscoveryHint(url)) {
              hints.push(this.normalizeDiscoveryUrl(url));
            }
          }
        }
      }
      
      // Extract from common footer links
      const footerMatches = htmlContent.match(/<footer[^>]*>.*?<\/footer>/gi);
      if (footerMatches && footerMatches.length > 0) {
        for (const footer of footerMatches) {
          const hrefMatches = footer.match(/href=["']([^"']+)["']/gi);
          if (hrefMatches && hrefMatches.length > 0) {
            for (const href of hrefMatches) {
              const url = href.match(/href=["']([^"']+)["']/i)?.[1];
              if (url && this.isValidDiscoveryHint(url)) {
                hints.push(this.normalizeDiscoveryUrl(url));
              }
            }
          }
        }
      }
      
    } catch (error) {
      logger.debug('Error extracting discovery hints:', error);
    }
    
    return [...new Set(hints)]; // Remove duplicates
  }

  /**
   * Check if a URL is a valid discovery hint
   */
  private isValidDiscoveryHint(url: string): boolean {
    if (!url || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      return false;
    }
    
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.includes('/docs') ||
      lowerUrl.includes('/documentation') ||
      lowerUrl.includes('/api') ||
      lowerUrl.includes('/support') ||
      lowerUrl.includes('/help') ||
      lowerUrl.includes('/blog') ||
      lowerUrl.includes('/dashboard') ||
      lowerUrl.includes('docs.') ||
      lowerUrl.includes('api.') ||
      lowerUrl.includes('support.') ||
      lowerUrl.includes('help.') ||
      lowerUrl.includes('blog.') ||
      lowerUrl.includes('dashboard.')
    );
  }

  /**
   * Normalize discovery URL to full format
   */
  private normalizeDiscoveryUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    if (url.startsWith('/')) {
      // Relative URL - we'll handle this in the candidate generation
      return url;
    }
    return `https://${url}`;
  }

  /**
   * Generate smart candidates based on site type and hints
   */
  private generateSmartCandidates(baseUrl: string, domain: string, siteType: SiteType, hints: string[]): string[] {
    if (!baseUrl || !domain) {
      logger.warn('Invalid parameters for generateSmartCandidates');
      return [];
    }
    
    const candidates = new Set<string>();
    
    // Always include the main site
    candidates.add(baseUrl);
    
    // Add discovered hints
    if (hints && hints.length > 0) {
      for (const hint of hints) {
        if (hint && typeof hint === 'string') {
          if (hint.startsWith('/')) {
            // Relative URL - convert to absolute
            candidates.add(`https://${domain}${hint}`);
          } else if (hint.includes(domain)) {
            // Full URL that includes our domain
            candidates.add(hint);
          }
        }
      }
    }
    
    // Add contextual patterns based on site type
    const contextualPatterns = this.getContextualPatterns(siteType);
    if (contextualPatterns && contextualPatterns.length > 0) {
      for (const pattern of contextualPatterns) {
        if (pattern && typeof pattern === 'string') {
          // Try subdomain
          candidates.add(`https://${pattern}.${domain}`);
          // Try path
          candidates.add(`https://${domain}/${pattern}`);
        }
      }
    }
    
    return Array.from(candidates);
  }

  /**
   * Get patterns relevant to the detected site type
   */
  private getContextualPatterns(siteType: SiteType): string[] {
    switch (siteType) {
      case 'developer-platform':
        return ['docs', 'api', 'developers', 'dashboard', 'support', 'status'];
      case 'ecommerce':
        return ['shop', 'store', 'support', 'help', 'blog', 'account'];
      case 'saas':
        return ['app', 'dashboard', 'docs', 'support', 'blog', 'status'];
      case 'content-site':
        return ['blog', 'articles', 'archive', 'about'];
      case 'corporate':
        return ['about', 'contact', 'careers', 'news', 'investors'];
      default:
        return ['docs', 'support', 'blog', 'about']; // Safe defaults
    }
  }

  /**
   * Test candidates with redirect following
   */
  private async testCandidatesWithRedirects(candidates: string[]): Promise<DiscoveryResult[]> {
    if (!candidates || candidates.length === 0) {
      logger.debug('No candidates to test');
      return [];
    }
    
    logger.debug(`Testing ${candidates.length} candidates for accessibility`);
    
    const testPromises = candidates.map(async (url) => {
      try {
        logger.debug(`Testing candidate: ${url}`);
        
        // Check if the new method exists, fallback to old method if not
        if (typeof this.httpService.getWithRedirectInfo === 'function') {
          const { response, finalUrl, isRedirect } = await this.httpService.getWithRedirectInfo(url);
          
          const result = {
            originalUrl: url,
            finalUrl: finalUrl,
            accessible: response.status >= 200 && response.status < 400,
            isRedirect: isRedirect,
            statusCode: response.status
          };
          
          logger.debug(`Result for ${url}: ${result.accessible ? 'accessible' : 'not accessible'} (${result.statusCode}), final: ${finalUrl}`);
          return result;
        } else {
          // Fallback to old method
          logger.debug(`Using fallback method for ${url}`);
          const response = await this.httpService.get(url);
          
          return {
            originalUrl: url,
            finalUrl: url, // Can't detect redirects with old method
            accessible: response.status >= 200 && response.status < 400,
            isRedirect: false, // Can't detect redirects with old method
            statusCode: response.status
          };
        }
      } catch (error) {
        logger.debug(`Error testing ${url}:`, error);
        return {
          originalUrl: url,
          finalUrl: url,
          accessible: false,
          isRedirect: false,
          statusCode: 0
        };
      }
    });
    
    const testResults = await Promise.all(testPromises);
    logger.debug(`Completed testing ${testResults.length} candidates`);
    return testResults;
  }

  /**
   * Remove duplicates based on final URL
   */
  private deduplicateResults(results: DiscoveryResult[]): DiscoveryResult[] {
    const finalUrlMap = new Map<string, DiscoveryResult>();
    
    for (const result of results) {
      if (!result.accessible) continue;
      
      const finalUrl = result.finalUrl;
      
      // If we haven't seen this final URL before, or if this is the canonical version (not a redirect)
      if (!finalUrlMap.has(finalUrl) || !result.isRedirect) {
        finalUrlMap.set(finalUrl, result);
      }
    }
    
    return Array.from(finalUrlMap.values());
  }

  /**
   * Convert DiscoveryResult to DiscoveredSite
   */
  private convertToDiscoveredSite(result: DiscoveryResult, mainDomain: string): DiscoveredSite {
    const url = result.finalUrl;
    let isSubdomain = false;
    
    try {
      const urlObj = new URL(url);
      isSubdomain = urlObj.hostname !== mainDomain && urlObj.hostname.endsWith(`.${mainDomain}`);
    } catch (error) {
      logger.debug(`Invalid URL in convertToDiscoveredSite: ${url}`, error);
      // If URL is invalid, treat as unknown type
    }
    
    const category = this.detectSiteCategory(url);
    
    return {
      url: url,
      type: url === result.originalUrl ? 'main' : (isSubdomain ? 'subdomain' : 'path'),
      category: category,
      discovered: true,
      accessible: result.accessible,
      isRedirect: result.isRedirect,
      finalUrl: result.finalUrl
    };
  }

  /**
   * Detect site category from URL
   */
  private detectSiteCategory(url: string): DiscoveredSite['category'] {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('/docs') || urlLower.includes('docs.') || urlLower.includes('/documentation')) {
      return 'docs';
    }
    if (urlLower.includes('/api') || urlLower.includes('api.') || urlLower.includes('/developer')) {
      return 'api';
    }
    if (urlLower.includes('/blog') || urlLower.includes('blog.') || urlLower.includes('/news')) {
      return 'blog';
    }
    if (urlLower.includes('/support') || urlLower.includes('support.') || urlLower.includes('/help')) {
      return 'support';
    }
    if (urlLower.includes('/shop') || urlLower.includes('shop.') || urlLower.includes('/store')) {
      return 'shop';
    }
    
    // Check if it's the main domain
    try {
      const urlObj = new URL(url);
      if (urlObj.pathname === '/' || urlObj.pathname === '') {
        return 'homepage';
      }
    } catch {
      // Invalid URL
    }
    
    return 'unknown';
  }

  /**
   * Categorize site by pattern
   */
  private categorizeByPattern(pattern: string): DiscoveredSite['category'] {
    const lowerPattern = pattern.toLowerCase();
    
    if (['docs', 'documentation', 'help', 'support'].includes(lowerPattern)) {
      return 'docs';
    }
    if (['blog', 'news', 'articles'].includes(lowerPattern)) {
      return 'blog';
    }
    if (['api', 'developer', 'dev'].includes(lowerPattern)) {
      return 'api';
    }
    if (['shop', 'store', 'ecommerce', 'products'].includes(lowerPattern)) {
      return 'shop';
    }
    if (['community', 'forum'].includes(lowerPattern)) {
      return 'support';
    }
    
    return 'unknown';
  }

  /**
   * Detect site type from content analysis
   */
  async detectSiteType(url: string, htmlContent?: string): Promise<DiscoveredSite['category']> {
    try {
      if (!htmlContent) {
        const response = await this.httpService.get(url);
        htmlContent = response.data;
      }

      const content = htmlContent?.toLowerCase() || '';
      const urlLower = url.toLowerCase();

      // URL-based detection
      if (urlLower.includes('/docs') || urlLower.includes('docs.')) return 'docs';
      if (urlLower.includes('/blog') || urlLower.includes('blog.')) return 'blog';
      if (urlLower.includes('/api') || urlLower.includes('api.')) return 'api';
      if (urlLower.includes('/shop') || urlLower.includes('shop.')) return 'shop';

      // Content-based detection
      if (content.includes('documentation') || content.includes('getting started') || 
          content.includes('api reference')) return 'docs';
      if (content.includes('blog') || content.includes('articles') || 
          content.includes('latest posts')) return 'blog';
      if (content.includes('products') || content.includes('buy now') || 
          content.includes('add to cart')) return 'shop';

      return 'homepage';
    } catch (error) {
      logger.warn(`Site type detection failed for ${url}:`, error);
      return 'unknown';
    }
  }

  private mapCategoryToSiteType(category: DiscoveredSite['category']): SiteType {
    switch (category) {
      case 'docs':
      case 'api':
      case 'blog':
        return 'developer-platform';
      case 'shop':
        return 'ecommerce';
      case 'support':
        return 'saas';
      default:
        return 'content-site';
    }
  }
} 