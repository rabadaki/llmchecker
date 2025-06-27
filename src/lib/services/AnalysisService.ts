/**
 * Main Analysis Service - Orchestrates all LLM discoverability checks
 */

import { load } from 'cheerio';
import { AnalysisRequest, AnalysisResponse, CategoryResult, CheckResult, ContentMetrics, TechnicalMetrics } from '../types/analysis';
import { HttpService } from './HttpService';
import { ContextAwareScoringService } from './ContextAwareScoringService';
import { scoringStructure } from '../config/scoring';
import { logger } from '../utils/logger';
import { URL } from 'url';

export class AnalysisService {
  private httpService: HttpService;
  private contextScoringService: ContextAwareScoringService;

  constructor() {
    this.httpService = new HttpService();
    this.contextScoringService = new ContextAwareScoringService();
  }

  async analyzeUrl(request: AnalysisRequest): Promise<AnalysisResponse> {
    const startTime = Date.now();
    const url = this.normalizeUrl(request.url);

    logger.info(`Starting analysis for: ${url}`);

    try {
      // Fetch the main page
      const { response: mainResponse, responseTime } = await this.httpService.measureResponseTime(url);
      
      if (mainResponse.status >= 400) {
        throw new Error(`Cannot access URL: HTTP ${mainResponse.status}`);
      }

      const $ = load(mainResponse.data);
      const contentMetrics = this.extractContentMetrics($);
      const technicalMetrics: TechnicalMetrics = {
        responseTime,
        hasHttps: url.startsWith('https://'),
        hasSitemap: false, // Will be determined by technical analyzer
        hasRobotsTxt: false, // Will be determined by robots analyzer
        statusCode: mainResponse.status,
        contentSize: mainResponse.data.length
      };

      // Detect page type for context-aware scoring
      const pageType = this.contextScoringService.detectPageType(url, mainResponse.data);
      logger.info(`Detected page type: ${pageType} for ${url}`);

      // Run all analyses in parallel for better performance
      const categories = await this.runAnalyses(url, $, mainResponse.data, contentMetrics, technicalMetrics);

      // Apply context-aware scoring adjustments
      const originalScore = this.calculateOverallScore(categories);
      const contextAwareResult = this.contextScoringService.adjustScore(
        { url, timestamp: '', executionTime: 0, overallScore: originalScore, categories, summary: { strengths: [], improvements: [], priority: 'medium' } },
        pageType,
        'main'
      );

      // Generate summary insights with context-aware information
      const summary = this.generateSummary(categories, contextAwareResult.adjustedScore);

      const executionTime = Date.now() - startTime;

      logger.info(`Analysis completed for ${url} in ${executionTime}ms - Score: ${originalScore} → ${contextAwareResult.adjustedScore} (${pageType})`);

      return {
        url,
        timestamp: new Date().toISOString(),
        executionTime,
        overallScore: contextAwareResult.adjustedScore,
        categories,
        summary,
        pageType,
        scoringAdjustments: contextAwareResult.adjustments,
        contextAwareResult: {
          originalScore,
          adjustedScore: contextAwareResult.adjustedScore,
          adjustmentReason: contextAwareResult.reason
        }
      };

    } catch (error) {
      logger.error(`Analysis failed for ${url}:`, error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private normalizeUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      throw new Error('URL is required and must be a string');
    }
    
    try {
      const parsed = new URL(url);
      return parsed.toString();
    } catch {
      // Try adding https:// if no protocol
      if (!url.includes('://')) {
        return this.normalizeUrl(`https://${url}`);
      }
      throw new Error('Invalid URL format');
    }
  }

  private extractContentMetrics($: any): ContentMetrics {
    const text = $.text();
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const headingCount = $('h1, h2, h3, h4, h5, h6').length;
    const semanticElementCount = $('article, section, nav, header, footer, main, aside, figure').length;
    
    // Extract schema types
    const schemaTypes: string[] = [];
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const jsonData = JSON.parse($(element).html() || '');
        if (jsonData['@type']) {
          schemaTypes.push(jsonData['@type']);
        }
      } catch {
        // Ignore invalid JSON
      }
    });

    // Calculate signal-to-noise ratio
    const mainContent = $('main, article, .content, #content').first();
    const mainText = mainContent.length > 0 ? mainContent.text() : text;
    const signalToNoiseRatio = mainText.length / (text.length || 1);

    return {
      wordCount,
      headingCount,
      semanticElementCount,
      schemaTypes,
      signalToNoiseRatio
    };
  }

  private async runAnalyses(
    url: string,
    $: any,
    htmlContent: string,
    contentMetrics: ContentMetrics,
    technicalMetrics: TechnicalMetrics
  ): Promise<CategoryResult[]> {
    const results: CategoryResult[] = [];

    for (const categoryDef of scoringStructure.scoring_categories) {
      const categoryStart = Date.now();
      const checks: CheckResult[] = [];

      for (const checkDef of categoryDef.checks) {
        const checkStart = Date.now();
        let score: number = 50; // Default (progressive scoring 0-100)

        try {
          // Simplified inline scoring logic
          switch (checkDef.id) {
            case 'robots_txt':
              score = await this.checkRobotsTxt(url);
              break;
            case 'response_time':
              score = technicalMetrics.responseTime < 500 ? 100 : technicalMetrics.responseTime < 1000 ? 75 : technicalMetrics.responseTime < 2000 ? 50 : 25;
              break;
            case 'https':
              score = technicalMetrics.hasHttps ? 100 : 0;
              break;
            case 'sitemap':
              score = await this.checkSitemap(url);
              break;
            case 'semantic_html':
              score = this.scoreSemanticHtml($);
              break;
            case 'schema_coverage':
              score = this.scoreSchemaMarkup($);
              break;
            case 'schema_validity':
              score = this.validateSchemas($);
              break;
            case 'rich_results':
              score = this.checkRichResults($);
              break;
            case 'heading_hierarchy':
              score = this.scoreHeadingHierarchy($);
              break;
            case 'ssr_content':
              score = this.scoreServerSideRendering($, htmlContent);
              break;
            case 'freshness':
              score = this.scoreFreshness($);
              break;
            case 'completeness':
              score = this.scoreCompleteness(contentMetrics);
              break;
            case 'clarity':
              score = this.scoreClarity($);
              break;
            case 'alternative_formats':
              score = await this.checkAlternativeFormats(url);
              break;
            case 'clean_extraction':
              score = this.scoreCleanExtraction($);
              break;
            case 'alt_formats':
              score = await this.checkAlternativeFormats(url);
              break;
            case 'llms_txt':
              score = await this.hasLlmsTxt(url) ? 100 : 0;
              break;
            default:
              logger.warn(`Unknown check ID: ${checkDef.id}`);
              break;
          }

          // Map progressive score to traditional scoring criteria
          let scoringKey: '0' | '50' | '100';
          if (score >= 80) {
            scoringKey = '100';
          } else if (score >= 40) {
            scoringKey = '50';
          } else {
            scoringKey = '0';
          }
          
          const scoring = checkDef.scoring[scoringKey];

          checks.push({
            id: checkDef.id,
            name: checkDef.name,
            score,
            status: scoring?.criteria || 'Unknown',
            details: scoring?.details || 'No details available',
            executionTime: Date.now() - checkStart
          });

        } catch (error) {
          logger.error(`Check ${checkDef.id} failed:`, error);
          checks.push({
            id: checkDef.id,
            name: checkDef.name,
            score: 0,
            status: 'Error',
            details: `Failed to analyze: ${error instanceof Error ? error.message : 'Unknown error'}`,
            executionTime: Date.now() - checkStart
          });
        }
      }

      // Calculate category score
      const categoryScore = Math.round(
        checks.reduce((sum, check) => sum + check.score, 0) / checks.length
      );

      results.push({
        id: categoryDef.id,
        name: categoryDef.name,
        weight: categoryDef.weight,
        icon: categoryDef.icon,
        description: categoryDef.description,
        score: categoryScore,
        checks,
        recommendations: this.generateRecommendations(checks)
      });

      logger.debug(`Category ${categoryDef.name} completed in ${Date.now() - categoryStart}ms - Score: ${categoryScore}`);
    }

    return results;
  }

  private calculateOverallScore(categories: CategoryResult[]): number {
    // Calculate base score from weighted categories (excluding structured data)
    const weightedCategories = categories.filter(cat => cat.weight > 0);
    const totalWeight = weightedCategories.reduce((sum, cat) => sum + cat.weight, 0);
    const weightedScore = weightedCategories.reduce((sum, cat) => sum + (cat.score * cat.weight), 0);
    const baseScore = Math.round(weightedScore / totalWeight);
    
    // Add structured data as bonus points (up to +10 points)
    const structuredDataCategory = categories.find(cat => cat.id === 'structured_data');
    const bonusPoints = structuredDataCategory ? Math.round((structuredDataCategory.score / 100) * 10) : 0;
    
    // Cap final score at 100
    return Math.min(100, baseScore + bonusPoints);
  }

  private generateRecommendations(checks: CheckResult[]): string[] {
    const recommendations: string[] = [];
    
    checks.forEach(check => {
      const actionableRec = this.getActionableRecommendation(check);
      if (actionableRec) {
        recommendations.push(actionableRec);
      }
    });
    
    return recommendations;
  }

  private getActionableRecommendation(check: CheckResult): string | null {
    // Only provide recommendations for checks that need improvement
    if (check.score >= 80) return null;
    
    const recommendations: Record<string, Record<string, string>> = {
      // AI Access Control
      'robots_txt': {
        low: '🚫 Add robots.txt file allowing AI crawlers: GPTBot, ChatGPT-User, Claude-Web, Bard-Google',
        medium: '⚠️ Update robots.txt to explicitly allow major AI crawlers and remove blocking rules',
      },
      'response_time': {
        low: '⚡ Optimize server response time: enable caching, CDN, compress images, minify CSS/JS',
        medium: '🔧 Improve page speed: optimize database queries, enable gzip compression',
      },
      'https': {
        low: '🔒 Enable HTTPS: get SSL certificate from Let\'s Encrypt or your hosting provider',
      },
      
      // Structured Data
      'schema_coverage': {
        low: '📊 Add JSON-LD structured data: start with Organization, WebSite, and Article schemas',
        medium: '📈 Expand schema coverage: add Product, FAQ, Review, or Event schemas as relevant',
      },
      'schema_validity': {
        low: '🔧 Fix JSON-LD syntax errors: validate at schema.org/validator and fix malformed data',
        medium: '✅ Complete missing schema properties: add required fields like author, datePublished, image',
      },
      'rich_results': {
        low: '⭐ Make schemas rich-result ready: add required properties for Google rich snippets',
        medium: '🎯 Enhance schema completeness: add optional properties for better rich snippet display',
      },
      
      // Content Structure  
      'semantic_html': {
        low: '🏗️ Replace generic divs with semantic HTML: use <main>, <article>, <section>, <nav>, <header>',
        medium: '📝 Improve semantic structure: add <aside>, <figure>, <time> elements where appropriate',
      },
      'heading_hierarchy': {
        low: '📋 Fix heading structure: ensure single H1, logical H2→H3→H4 progression without skipping levels',
        medium: '🎯 Optimize heading hierarchy: review heading levels and ensure proper content organization',
      },
      'ssr_content': {
        low: '🖥️ Enable server-side rendering: ensure content loads without JavaScript for AI crawlers',
        medium: '⚡ Improve SSR coverage: render more content server-side, reduce client-side dependencies',
      },
      
      // Technical Infrastructure
      'sitemap': {
        low: '🗺️ Create XML sitemap: generate sitemap.xml with all important pages and submit to search engines',
        medium: '📍 Enhance sitemap: ensure all pages included, add lastmod dates, create sitemap index',
      },
      'clean_extraction': {
        low: '🧹 Improve content clarity: move main content to <main> tag, reduce navigation/ads noise',
        medium: '📖 Optimize content structure: separate primary content from sidebar/footer elements',
      },
      'alt_formats': {
        low: '📄 Add alternative formats: create RSS feed, JSON feed, or API endpoints for content access',
        medium: '🔗 Expand content formats: add mobile-optimized versions, AMP pages, or structured APIs',
      },
      'llms_txt': {
        low: '🤖 Create llms.txt file: specify AI training permissions at /llms.txt (emerging standard)',
      },
      
      // Additional content checks
      'freshness': {
        low: '📅 Add publication dates: include datePublished, dateModified in content and schema',
        medium: '🔄 Update content timestamps: ensure recent modification dates are visible and accurate',
      },
      'completeness': {
        low: '📝 Expand content depth: add more comprehensive information, examples, and details',
        medium: '🎯 Enhance content quality: add related topics, FAQs, and supporting information',
      },
      'clarity': {
        low: '✍️ Improve content clarity: use clear headings, bullet points, and structured formatting',
        medium: '📚 Enhance readability: break up long paragraphs, add subheadings, improve flow',
      }
    };
    
    const checkRecs = recommendations[check.id];
    if (!checkRecs) return null;
    
    // Choose recommendation based on score
    if (check.score < 40 && checkRecs.low) {
      return checkRecs.low;
    } else if (check.score < 80 && checkRecs.medium) {
      return checkRecs.medium;
    }
    
    return null;
  }

  private generateSummary(categories: CategoryResult[], overallScore: number): { strengths: string[]; improvements: string[]; priority: 'low' | 'medium' | 'high' } {
    const strengths: string[] = [];
    const improvements: string[] = [];

    categories.forEach(category => {
      if (category.score >= 80) {
        strengths.push(`Strong ${category.name.toLowerCase()}`);
      } else if (category.score <= 40) {
        improvements.push(`Improve ${category.name.toLowerCase()}`);
      }
    });

    const priority: 'low' | 'medium' | 'high' = 
      overallScore >= 80 ? 'low' : 
      overallScore >= 60 ? 'medium' : 'high';

    return { strengths, improvements, priority };
  }

  // Simplified analyzer methods
  private async checkRobotsTxt(url: string): Promise<number> {
    try {
      const robotsUrl = new URL('/robots.txt', url).toString();
      const response = await this.httpService.head(robotsUrl);
      return response.status === 200 ? 85 : 30;
    } catch {
      return 30;
    }
  }

  private async checkSitemap(url: string): Promise<number> {
    try {
      const sitemapUrl = new URL('/sitemap.xml', url).toString();
      const response = await this.httpService.head(sitemapUrl);
      return response.status === 200 ? 90 : 20;
    } catch {
      return 20;
    }
  }

  private scoreSemanticHtml($: any): number {
    const semanticElements = $('main, article, section, nav, header, footer, aside').length;
    return Math.min(100, semanticElements * 15 + 25);
  }

  private scoreSchemaMarkup($: any): number {
    const schemaCount = $('script[type="application/ld+json"]').length;
    return Math.min(100, schemaCount * 25 + 25);
  }

  private validateSchemas($: any): number {
    // Simplified validation - just check if JSON-LD exists and is valid JSON
    let validSchemas = 0;
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        JSON.parse($(element).html() || '');
        validSchemas++;
      } catch {
        // Invalid JSON
      }
    });
    return Math.min(100, validSchemas * 30 + 40);
  }

  private checkRichResults($: any): number {
    // Check for common rich result schemas
    let richResultScore = 40;
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const data = JSON.parse($(element).html() || '');
        const type = data['@type'];
        if (['Article', 'Product', 'Review', 'Event', 'Organization'].includes(type)) {
          richResultScore += 15;
        }
      } catch {
        // Invalid JSON
      }
    });
    return Math.min(100, richResultScore);
  }

  private scoreHeadingHierarchy($: any): number {
    const h1Count = $('h1').length;
    const headings = $('h1, h2, h3, h4, h5, h6').length;
    
    if (h1Count === 1 && headings > 2) return 90;
    if (h1Count === 1) return 75;
    if (headings > 0) return 50;
    return 20;
  }

  private scoreServerSideRendering($: any, htmlContent: string): number {
    const textLength = $.text().length;
    return textLength > 500 ? 85 : textLength > 100 ? 60 : 30;
  }

  private scoreFreshness($: any): number {
    const dateElements = $('time, [datetime], .date, .published').length;
    return dateElements > 0 ? 80 : 40;
  }

  private scoreCompleteness(contentMetrics: ContentMetrics): number {
    const { wordCount, headingCount } = contentMetrics;
    if (wordCount > 500 && headingCount > 2) return 85;
    if (wordCount > 200) return 65;
    return 35;
  }

  private scoreClarity($: any): number {
    const paragraphs = $('p').length;
    const lists = $('ul, ol').length;
    return Math.min(100, (paragraphs * 5) + (lists * 10) + 30);
  }

  private async checkAlternativeFormats(url: string): Promise<number> {
    try {
      // Check for RSS feed
      const rssUrl = new URL('/feed.xml', url).toString();
      const response = await this.httpService.head(rssUrl);
      return response.status === 200 ? 70 : 30;
    } catch {
      return 30;
    }
  }

  private scoreCleanExtraction($: any): number {
    const mainContent = $('main, article').length;
    const totalElements = $('*').length;
    const ratio = mainContent / Math.max(totalElements, 1);
    return Math.min(100, ratio * 200 + 40);
  }

  private async hasLlmsTxt(url: string): Promise<boolean> {
    try {
      const llmsUrl = new URL('/llms.txt', url).toString();
      const response = await this.httpService.head(llmsUrl);
      return response.status === 200;
    } catch {
      return false;
    }
  }
}