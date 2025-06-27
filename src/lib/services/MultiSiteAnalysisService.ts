/**
 * Multi-Site Analysis Service
 * Orchestrates comprehensive website analysis with site discovery and context-aware scoring
 */

import { AnalysisService } from './AnalysisService';
import { SiteDiscoveryService, DiscoveredSite, SiteDiscoveryResult } from './SiteDiscoveryService';
import { ContextAwareScoringService } from './ContextAwareScoringService';
import { 
  MultiSiteAnalysisRequest, 
  MultiSiteAnalysisResponse, 
  SiteAnalysisResult,
  AnalysisResponse 
} from '../types/analysis';
import { logger } from '../utils/logger';

export class MultiSiteAnalysisService {
  private analysisService: AnalysisService;
  private discoveryService: SiteDiscoveryService;
  private scoringService: ContextAwareScoringService;

  constructor() {
    this.analysisService = new AnalysisService();
    this.discoveryService = new SiteDiscoveryService();
    this.scoringService = new ContextAwareScoringService();
  }

  /**
   * Perform comprehensive multi-site analysis
   */
  async analyzeMultipleSites(request: MultiSiteAnalysisRequest): Promise<MultiSiteAnalysisResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    logger.info(`Starting multi-site analysis for: ${request.inputUrl} (Request ID: ${requestId})`);

    try {
      // Step 1: Site Discovery
      const discovery = await this.performSiteDiscovery(request);
      logger.info(`Site discovery completed: Found ${discovery.totalFound} sites, ${discovery.analysisReady.length} ready for analysis`);

      // Step 2: Parallel Analysis of All Sites
      const analyses = await this.performParallelAnalyses(discovery.analysisReady);
      logger.info(`Parallel analysis completed for ${analyses.length} sites`);

      // Step 3: Generate Summary and Recommendations
      const summary = this.generateAnalysisSummary(analyses);

      const response: MultiSiteAnalysisResponse = {
        requestId,
        inputUrl: request.inputUrl,
        discovery,
        analyses,
        summary,
        completedAt: new Date().toISOString(),
        duration: Date.now() - startTime
      };

      logger.info(`Multi-site analysis completed for ${request.inputUrl} in ${response.duration}ms - Average score: ${summary.averageScore}`);
      return response;

    } catch (error) {
      logger.error(`Multi-site analysis failed for ${request.inputUrl}:`, error);
      throw error;
    }
  }

  /**
   * Perform site discovery based on request parameters
   */
  private async performSiteDiscovery(request: MultiSiteAnalysisRequest): Promise<SiteDiscoveryResult> {
    if (!request.discoveryEnabled && request.customUrls) {
      // Manual URL list mode - still check accessibility
      const discoveredSites: DiscoveredSite[] = await Promise.all(
        request.customUrls.map(async (url) => {
          const category = await this.discoveryService.detectSiteType(url);
          const accessible = await this.discoveryService.checkSiteAccessibility(url);
          
          if (!accessible) {
            logger.info(`Skipping inaccessible site: ${url}`);
          }
          
          return {
            url,
            type: 'main' as const,
            category,
            discovered: true,
            accessible
          };
        })
      );

      // Filter to only accessible sites
      const analysisReady = discoveredSites.filter(site => site.accessible);

      return {
        mainDomain: this.extractDomain(request.inputUrl),
        discoveredSites,
        totalFound: discoveredSites.length,
        analysisReady
      };
    }

    // Automatic discovery mode
    return await this.discoveryService.discoverSites(request.inputUrl);
  }

  /**
   * Perform parallel analysis of all discovered sites
   */
  private async performParallelAnalyses(sites: DiscoveredSite[]): Promise<SiteAnalysisResult[]> {
    const maxConcurrent = 5; // Limit concurrent requests to avoid overwhelming servers
    const results: SiteAnalysisResult[] = [];

    // Process sites in batches
    for (let i = 0; i < sites.length; i += maxConcurrent) {
      const batch = sites.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(site => this.analyzeSingleSite(site));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            logger.error(`Analysis failed for ${batch[index].url}:`, result.reason);
            // Create a failed analysis result
            results.push(this.createFailedAnalysisResult(batch[index], result.reason));
          }
        });
      } catch (error) {
        logger.error(`Batch analysis failed:`, error);
      }
    }

    return results;
  }

  /**
   * Analyze a single site with context-aware scoring
   */
  private async analyzeSingleSite(site: DiscoveredSite): Promise<SiteAnalysisResult> {
    try {
      logger.debug(`Analyzing ${site.category} site: ${site.url}`);
      
      // Perform standard analysis
      const originalAnalysis = await this.analysisService.analyzeUrl({ url: site.url });
      
      // Apply context-aware scoring
      const scoringResult = this.scoringService.adjustScore(
        originalAnalysis,
        site.category,
        site.type
      );

      // Create enhanced result
      const result: SiteAnalysisResult = {
        url: originalAnalysis.url,
        timestamp: originalAnalysis.timestamp,
        executionTime: originalAnalysis.executionTime,
        overallScore: scoringResult.adjustedScore,
        categories: originalAnalysis.categories,
        summary: originalAnalysis.summary,
        siteInfo: {
          url: site.url,
          type: site.type,
          category: site.category,
          discoveredAt: new Date().toISOString()
        },
        contextAwareScore: {
          originalScore: originalAnalysis.overallScore,
          adjustedScore: scoringResult.adjustedScore,
          adjustmentReason: scoringResult.reason
        }
      };

      logger.debug(`Site analysis completed for ${site.url}: ${scoringResult.adjustedScore}/100 (adjusted from ${originalAnalysis.overallScore})`);
      return result;

    } catch (error) {
      logger.error(`Single site analysis failed for ${site.url}:`, error);
      throw error;
    }
  }

  /**
   * Generate analysis summary and recommendations
   */
  private generateAnalysisSummary(analyses: SiteAnalysisResult[]): MultiSiteAnalysisResponse['summary'] {
    if (analyses.length === 0) {
      throw new Error('No successful analyses to summarize');
    }

    const scores = analyses.map(a => a.overallScore);
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    
    const sortedAnalyses = [...analyses].sort((a, b) => b.overallScore - a.overallScore);
    const highestScore = sortedAnalyses[0];
    const lowestScore = sortedAnalyses[sortedAnalyses.length - 1];

    // Generate prioritized recommendations across all sites
    const allRecommendations = analyses.flatMap(analysis => 
      analysis.categories.flatMap(category => 
        category.recommendations.map(rec => ({
          text: rec,
          siteUrl: analysis.siteInfo.url,
          siteCategory: analysis.siteInfo.category,
          categoryScore: category.score
        }))
      )
    );

    // Prioritize recommendations by impact and frequency
    const recommendationPriority = this.prioritizeRecommendations(allRecommendations);

    return {
      totalSites: analyses.length,
      averageScore,
      highestScore,
      lowestScore,
      recommendationsPriority: recommendationPriority.slice(0, 10) // Top 10 recommendations
    };
  }

  /**
   * Prioritize recommendations based on impact and frequency
   */
  private prioritizeRecommendations(recommendations: any[]): string[] {
    // Group recommendations by type and count frequency
    const recommendationGroups = new Map<string, { count: number; avgImpact: number; sites: Set<string> }>();

    recommendations.forEach(rec => {
      const key = rec.text.substring(0, 50); // Group by first 50 chars
      if (!recommendationGroups.has(key)) {
        recommendationGroups.set(key, { count: 0, avgImpact: 0, sites: new Set() });
      }
      const group = recommendationGroups.get(key)!;
      group.count++;
      group.avgImpact += (100 - rec.categoryScore); // Higher impact for lower scores
      group.sites.add(rec.siteUrl);
    });

    // Sort by priority score (frequency * impact * site coverage)
    const prioritized = Array.from(recommendationGroups.entries())
      .map(([text, data]) => ({
        text,
        priority: data.count * (data.avgImpact / data.count) * data.sites.size
      }))
      .sort((a, b) => b.priority - a.priority)
      .map(item => item.text);

    return prioritized;
  }

  /**
   * Create a failed analysis result for error handling
   */
  private createFailedAnalysisResult(site: DiscoveredSite, error: any): SiteAnalysisResult {
    return {
      url: site.url,
      timestamp: new Date().toISOString(),
      executionTime: 0,
      overallScore: 0,
      categories: [],
      summary: {
        strengths: [],
        improvements: [`Analysis failed: ${error.message || 'Unknown error'}`],
        priority: 'high' as const
      },
      siteInfo: {
        url: site.url,
        type: site.type,
        category: site.category,
        discoveredAt: new Date().toISOString()
      },
      contextAwareScore: {
        originalScore: 0,
        adjustedScore: 0,
        adjustmentReason: 'Analysis failed'
      }
    };
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `multi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch (error) {
      throw new Error(`Invalid URL: ${url}`);
    }
  }
} 