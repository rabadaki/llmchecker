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
  private lastRobotsTxtDetails: string = '';

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
      // Try adding https:// if no protocol (with additional safety check)
      if (url && typeof url === 'string' && !url.includes('://')) {
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
            details: checkDef.id === 'robots_txt' && this.lastRobotsTxtDetails 
              ? this.lastRobotsTxtDetails 
              : scoring?.details || 'No details available',
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
    // Use new centralized recommendation service for legacy compatibility
    try {
      const { recommendationService } = require('./RecommendationService');
      
      // Convert checks to simple analysis format for recommendation service
      const mockAnalysis = {
        categories: [{
          checks: checks.filter(check => check.score < 80) // Only checks that need improvement
        }]
      };
      
      return recommendationService.getLegacyRecommendations(mockAnalysis);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      
      // Fallback to simple recommendations if service fails
      return checks
        .filter(check => check.score < 80)
        .map(check => `Improve ${check.name} (currently ${check.score}/100)`)
        .slice(0, 5); // Limit to 5 recommendations
    }
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

  // Enhanced AI crawler detection
  private async checkRobotsTxt(url: string): Promise<number> {
    try {
      const robotsUrl = new URL('/robots.txt', url).toString();
      const response = await this.httpService.get(robotsUrl);
      
      if (response.status !== 200) {
        return 0; // No robots.txt file = 0 points
      }

      const robotsContent = response.data.toLowerCase();
      const result = this.analyzeAiCrawlerAccess(robotsContent);
      // Store the details for use in the check result
      this.lastRobotsTxtDetails = result.details;
      return result.score;
    } catch {
      return 0; // Error accessing robots.txt = 0 points
    }
  }

  private analyzeAiCrawlerAccess(robotsContent: string): { score: number; details: string } {
    const AI_CRAWLERS = {
      'gptbot': { weight: 10, platform: 'ChatGPT', critical: true },
      'chatgpt-user': { weight: 8, platform: 'ChatGPT', critical: true },
      'claudebot': { weight: 9, platform: 'Claude', critical: true },
      'claude-web': { weight: 7, platform: 'Claude', critical: false },
      'anthropic-ai': { weight: 6, platform: 'Claude', critical: false },
      'perplexitybot': { weight: 8, platform: 'Perplexity', critical: true },
      'perplexity-user': { weight: 6, platform: 'Perplexity', critical: false },
      'bard': { weight: 7, platform: 'Bard', critical: true },
      'googlebot': { weight: 8, platform: 'Google', critical: true },
      'bingbot': { weight: 6, platform: 'Bing', critical: false }
    };

    let totalWeight = 0;
    let allowedWeight = 0;
    let blockedCritical = 0;
    const crawlerStatuses: string[] = [];
    const criticalCrawlers = new Set<string>();

    for (const [crawler, config] of Object.entries(AI_CRAWLERS)) {
      if (!config.critical) continue; // Only show critical crawlers in details
      
      totalWeight += config.weight;
      const isAllowed = this.isCrawlerAllowed(robotsContent, crawler);
      
      if (isAllowed) {
        allowedWeight += config.weight;
        if (!criticalCrawlers.has(config.platform)) {
          crawlerStatuses.push(`${config.platform} ✓`);
          criticalCrawlers.add(config.platform);
        }
      } else {
        blockedCritical += 1;
        if (!criticalCrawlers.has(config.platform)) {
          crawlerStatuses.push(`${config.platform} ✗`);
          criticalCrawlers.add(config.platform);
        }
      }
    }

    // Calculate score: base percentage + penalty for blocked critical crawlers
    const baseScore = Math.round((allowedWeight / totalWeight) * 100);
    const criticalPenalty = blockedCritical * 15; // -15 points per blocked critical crawler
    const score = Math.max(0, Math.min(100, baseScore - criticalPenalty));
    
    // Create detailed status message
    const details = crawlerStatuses.length > 0 
      ? `AI crawler access: ${crawlerStatuses.join(', ')}`
      : 'No AI crawler rules detected';
    
    return { score, details };
  }

  private isCrawlerAllowed(robotsContent: string, crawler: string): boolean {
    const lines = robotsContent.split('\n').map(line => line.trim().toLowerCase());
    
    // First pass: Look for specific crawler rules (higher priority)
    let specificResult = this.checkSpecificCrawlerRules(lines, crawler);
    if (specificResult !== null) {
      return specificResult;
    }
    
    // Second pass: Look for wildcard (*) rules (lower priority)
    let wildcardResult = this.checkWildcardRules(lines);
    if (wildcardResult !== null) {
      return wildcardResult;
    }
    
    // If no explicit rules found, assume allowed (default robots.txt behavior)
    return true;
  }

  private checkSpecificCrawlerRules(lines: string[], crawler: string): boolean | null {
    let currentUserAgent = '';
    let isTargetAgent = false;
    
    for (const line of lines) {
      if (line.startsWith('user-agent:')) {
        currentUserAgent = line.replace('user-agent:', '').trim();
        isTargetAgent = currentUserAgent === crawler;
      } else if (isTargetAgent && line.startsWith('disallow:')) {
        const disallowPath = line.replace('disallow:', '').trim();
        if (disallowPath === '/' || disallowPath === '') {
          return false; // Explicitly blocked
        }
      } else if (isTargetAgent && line.startsWith('allow:')) {
        const allowPath = line.replace('allow:', '').trim();
        if (allowPath === '/' || allowPath === '') {
          return true; // Explicitly allowed
        }
      }
    }
    
    return null; // No specific rules found
  }

  private checkWildcardRules(lines: string[]): boolean | null {
    let currentUserAgent = '';
    let isWildcard = false;
    
    for (const line of lines) {
      if (line.startsWith('user-agent:')) {
        currentUserAgent = line.replace('user-agent:', '').trim();
        isWildcard = currentUserAgent === '*';
      } else if (isWildcard && line.startsWith('disallow:')) {
        const disallowPath = line.replace('disallow:', '').trim();
        if (disallowPath === '/' || disallowPath === '') {
          return false; // Blocked by wildcard
        }
      } else if (isWildcard && line.startsWith('allow:')) {
        const allowPath = line.replace('allow:', '').trim();
        if (allowPath === '/' || allowPath === '') {
          return true; // Allowed by wildcard
        }
      }
    }
    
    return null; // No wildcard rules found
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
    const schemas = this.extractSchemas($);
    if (schemas.length === 0) return 0; // No structured data
    
    return this.calculateSchemaScore(schemas, $);
  }

  private extractSchemas($: any): any[] {
    const schemas: any[] = [];
    
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const jsonContent = $(element).html() || '';
        const data = JSON.parse(jsonContent);
        schemas.push(data);
      } catch {
        // Invalid JSON - skip
      }
    });
    
    return schemas;
  }

  private calculateSchemaScore(schemas: any[], $: any): number {
    const AI_SCHEMA_PRIORITIES = {
      'FAQPage': { score: 25, aiRelevance: 'Critical for AI Q&A responses' },
      'Question': { score: 20, aiRelevance: 'Individual Q&A pairs for AI' },
      'HowTo': { score: 20, aiRelevance: 'AI loves step-by-step instructions' },
      'Article': { score: 15, aiRelevance: 'Standard content schema' },
      'BlogPosting': { score: 15, aiRelevance: 'Blog content optimization' },
      'Product': { score: 15, aiRelevance: 'E-commerce visibility' },
      'Review': { score: 12, aiRelevance: 'Trust signals for AI' },
      'Organization': { score: 10, aiRelevance: 'Entity recognition' },
      'WebSite': { score: 8, aiRelevance: 'Basic site structure' },
      'Person': { score: 8, aiRelevance: 'Author credibility' },
      'BreadcrumbList': { score: 8, aiRelevance: 'Navigation structure' },
      'VideoObject': { score: 10, aiRelevance: 'Multimedia content' }
    };

    let totalScore = 0;
    const foundTypes = new Set<string>();

    // Analyze each schema
    for (const schema of schemas) {
      const type = schema['@type'];
      if (type && AI_SCHEMA_PRIORITIES[type]) {
        foundTypes.add(type);
        totalScore += AI_SCHEMA_PRIORITIES[type].score;
      }
    }

    // Bonus for FAQ content detection even without schema
    if (!foundTypes.has('FAQPage') && this.detectFAQContent($)) {
      totalScore += 10; // Bonus for FAQ content without proper schema
    }

    // Diversity bonus - reward having multiple schema types
    if (foundTypes.size > 1) {
      totalScore += Math.min(15, (foundTypes.size - 1) * 5);
    }

    return Math.min(100, totalScore);
  }

  private detectFAQContent($: any): boolean {
    const text = $.text().toLowerCase();
    
    // Look for FAQ patterns in content
    const faqIndicators = [
      /frequently asked questions?/i,
      /faq/i,
      /questions? (?:and|&) answers?/i,
      /q&a/i
    ];

    const questionPatterns = [
      /what (?:is|are|does|do|can|will|would|should)/gi,
      /how (?:do|does|can|to|much|many|long|often)/gi,
      /why (?:do|does|is|are|would|should|can)/gi,
      /when (?:do|does|is|are|will|would|should|can)/gi,
      /where (?:do|does|is|are|can|will|would|should)/gi,
      /who (?:is|are|can|will|would|should|does)/gi,
      /which (?:is|are|do|does|can|will|would|should)/gi
    ];

    // Check for FAQ indicators
    const hasFAQSection = faqIndicators.some(pattern => pattern.test(text));
    
    // Count question patterns
    const questionCount = questionPatterns.reduce((count, pattern) => {
      const matches = text.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);

    // Look for Q: or Question: patterns
    const qPatterns = /(?:^|\n)\s*(?:q:|question:|q\d+:|question\s+\d+:)/gmi;
    const qMatches = text.match(qPatterns);
    const hasQAFormat = qMatches && qMatches.length >= 2;

    return hasFAQSection || questionCount >= 3 || hasQAFormat;
  }

  private validateSchemas($: any): number {
    let totalSchemas = 0;
    let validSchemas = 0;
    let score = 0;

    $('script[type="application/ld+json"]').each((_, element) => {
      totalSchemas++;
      try {
        const jsonContent = $(element).html() || '';
        const data = JSON.parse(jsonContent);
        
        // Basic JSON-LD validation
        const validation = this.validateJsonLdSchema(data);
        
        if (validation.isValid) {
          validSchemas++;
          score += validation.score;
        }
      } catch {
        // Invalid JSON - contributes to total but not valid count
      }
    });

    if (totalSchemas === 0) return 0; // No schemas to validate
    
    // Calculate final score: base validity score + completeness bonus
    const validityRatio = validSchemas / totalSchemas;
    const averageScore = validSchemas > 0 ? score / validSchemas : 0;
    
    return Math.round(Math.min(100, (validityRatio * 60) + (averageScore * 0.4)));
  }

  private validateJsonLdSchema(data: any): { isValid: boolean; score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 0;

    // Check for required JSON-LD properties
    if (!data['@context']) {
      issues.push('Missing @context property');
    } else {
      score += 20; // Has context
    }

    if (!data['@type']) {
      issues.push('Missing @type property');
    } else {
      score += 20; // Has type
      
      // Type-specific validation
      const typeScore = this.validateSchemaType(data, data['@type']);
      score += typeScore;
    }

    // Check for common required properties based on schema type
    if (data['@type']) {
      const requiredFields = this.getRequiredFieldsForType(data['@type']);
      const presentFields = requiredFields.filter(field => data[field] !== undefined);
      const fieldCompleteness = presentFields.length / Math.max(requiredFields.length, 1);
      score += Math.round(fieldCompleteness * 30); // Up to 30 points for required fields
    }

    // Bonus points for rich properties
    const richProperties = ['image', 'author', 'datePublished', 'dateModified', 'description', 'url'];
    const presentRichProps = richProperties.filter(prop => data[prop] !== undefined);
    score += Math.min(10, presentRichProps.length * 2); // Up to 10 bonus points

    const isValid = issues.length === 0 && score >= 40;
    return { isValid, score: Math.min(100, score), issues };
  }

  private validateSchemaType(data: any, type: string): number {
    let score = 0;
    
    switch (type) {
      case 'FAQPage':
        if (data.mainEntity) {
          score += 10; // Required for FAQPage
          if (Array.isArray(data.mainEntity)) {
            const validQuestions = data.mainEntity.filter(q => 
              q['@type'] === 'Question' && q.name && q.acceptedAnswer
            );
            score += Math.min(10, validQuestions.length * 2); // Up to 10 points for valid questions
          }
        }
        break;
        
      case 'Question':
        if (data.name) score += 10; // Question text
        if (data.acceptedAnswer) {
          score += 10; // Answer is crucial
          if (data.acceptedAnswer.text || data.acceptedAnswer.description) {
            score += 5; // Answer has content
          }
        }
        break;
        
      case 'HowTo':
        if (data.name) score += 5;
        if (data.description) score += 5;
        if (data.step || data.steps) {
          score += 10; // Steps are crucial for HowTo
          const steps = data.step || data.steps;
          if (Array.isArray(steps) && steps.length > 1) {
            score += 5; // Multiple steps
          }
        }
        break;
        
      case 'Article':
      case 'BlogPosting':
      case 'NewsArticle':
        if (data.headline) score += 5;
        if (data.author) score += 5;
        if (data.datePublished) score += 5;
        if (data.image) score += 5;
        break;
        
      case 'Organization':
        if (data.name) score += 5;
        if (data.url) score += 5;
        if (data.logo) score += 5;
        if (data.contactPoint || data.address) score += 5;
        break;
        
      case 'WebSite':
        if (data.name) score += 5;
        if (data.url) score += 5;
        if (data.description) score += 5;
        if (data.potentialAction) score += 5;
        break;
        
      case 'Product':
        if (data.name) score += 5;
        if (data.description) score += 5;
        if (data.image) score += 5;
        if (data.offers) score += 5;
        break;
        
      case 'Person':
        if (data.name) score += 5;
        if (data.jobTitle || data.worksFor) score += 5;
        if (data.image) score += 5;
        if (data.url || data.sameAs) score += 5;
        break;
        
      case 'Review':
        if (data.reviewBody) score += 5;
        if (data.author) score += 5;
        if (data.reviewRating) score += 5;
        if (data.itemReviewed) score += 5;
        break;
        
      default:
        // Generic validation for unknown types
        if (data.name) score += 3;
        if (data.description) score += 3;
        if (data.url) score += 2;
        if (data.image) score += 2;
        break;
    }
    
    return Math.min(20, score); // Cap type-specific score at 20
  }

  private getRequiredFieldsForType(type: string): string[] {
    const requiredFields: Record<string, string[]> = {
      'FAQPage': ['mainEntity'],
      'Question': ['name', 'acceptedAnswer'],
      'HowTo': ['name', 'step'],
      'Article': ['headline', 'author'],
      'BlogPosting': ['headline', 'author'],
      'NewsArticle': ['headline', 'author', 'datePublished'],
      'Organization': ['name'],
      'WebSite': ['name', 'url'],
      'Product': ['name', 'offers'],
      'Person': ['name'],
      'Event': ['name', 'startDate'],
      'Review': ['reviewBody', 'author'],
      'Recipe': ['name', 'recipeIngredient', 'recipeInstructions']
    };
    
    return requiredFields[type] || ['name']; // Default to requiring 'name'
  }

  private checkRichResults($: any): number {
    // Enhanced rich results checking with AI-priority schemas
    let richResultScore = 0;
    let hasSchema = false;
    
    const RICH_RESULT_SCHEMAS = {
      'FAQPage': 30,    // High value for AI Q&A
      'HowTo': 25,      // High value for AI instructions
      'Article': 20,    // Standard content
      'Product': 20,    // E-commerce
      'Review': 20,     // Trust signals
      'Event': 15,      // Events
      'Organization': 15, // Entity
      'Question': 15,   // Q&A pairs
      'Recipe': 15,     // Structured content
      'VideoObject': 10 // Multimedia
    };
    
    $('script[type="application/ld+json"]').each((_, element) => {
      hasSchema = true;
      try {
        const data = JSON.parse($(element).html() || '');
        const type = data['@type'];
        if (RICH_RESULT_SCHEMAS[type]) {
          richResultScore += RICH_RESULT_SCHEMAS[type];
        }
      } catch {
        // Invalid JSON
      }
    });
    
    if (!hasSchema) return 0; // No schemas present
    return Math.min(100, richResultScore + 20); // Base 20 points + schema-specific scores
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