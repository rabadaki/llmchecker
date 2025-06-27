/**
 * Context-Aware Scoring Service
 * Adjusts scoring based on site type and category for fair assessment
 * Uses industry-standard weights from 2024 research
 */

import { AnalysisResponse, CategoryResult } from '../types/analysis';
import { DiscoveredSite } from './SiteDiscoveryService';
import { logger } from '../utils/logger';

interface ScoringAdjustment {
  category: string;
  adjustment: number;
  reason: string;
}

interface SiteTypeWeights {
  crawlability_access: number;
  structured_data: number;
  content_structure: number;
  technical_infrastructure: number;
}

export class ContextAwareScoringService {
  // Industry-realistic weights based on 2024 research
  // - Only 30% of sites use structured data (should be bonus, not penalty)
  // - Semantic HTML is widely adopted (realistic expectation)
  // - Technical infrastructure is core to modern web
  private siteTypeWeights: Record<DiscoveredSite['category'], SiteTypeWeights> = {
    homepage: {
      crawlability_access: 40,      // AI accessibility (your unique value)
      structured_data: 5,           // Only 30% of sites have this - bonus points
      content_structure: 25,        // Widely adopted - realistic expectation  
      technical_infrastructure: 30  // Core infrastructure - essential
    },
    docs: {
      crawlability_access: 35,      // Still important for LLM access
      structured_data: 10,          // Docs benefit more from structured data
      content_structure: 35,        // Critical for documentation
      technical_infrastructure: 20  // Less critical for docs
    },
    blog: {
      crawlability_access: 35,      // Important for content discovery
      structured_data: 15,          // Article schema helps with rich snippets
      content_structure: 30,        // Content structure is key
      technical_infrastructure: 20  // Basic requirements
    },
    shop: {
      crawlability_access: 35,      // Product discovery
      structured_data: 20,          // Product schema is valuable for e-commerce
      content_structure: 25,        // Product pages need structure
      technical_infrastructure: 20  // Performance matters
    },
    api: {
      crawlability_access: 30,      // API documentation access
      structured_data: 5,           // APIs rarely need schema
      content_structure: 20,        // Documentation structure
      technical_infrastructure: 45  // APIs are all about technical performance
    },
    support: {
      crawlability_access: 35,      // Help content discovery
      structured_data: 10,          // FAQ schema can help
      content_structure: 30,        // Clear structure for help content
      technical_infrastructure: 25  // Reliable access to support
    },
    unknown: {
      crawlability_access: 35, // Industry standard baseline
      structured_data: 10,     // Realistic baseline
      content_structure: 30,   // Content quality standard
      technical_infrastructure: 25 // Technical SEO standard
    }
  };

  /**
   * Detect page type from URL and content patterns
   */
  detectPageType(url: string, content?: string): DiscoveredSite['category'] {
    const urlLower = url.toLowerCase();
    
    // API documentation patterns
    if (urlLower.includes('/api') || urlLower.includes('/docs/api') || urlLower.includes('developer')) {
      return 'api';
    }
    
    // Documentation patterns
    if (urlLower.includes('/docs') || urlLower.includes('/documentation') || 
        urlLower.includes('/guide') || urlLower.includes('/help')) {
      return 'docs';
    }
    
    // Blog patterns
    if (urlLower.includes('/blog') || urlLower.includes('/news') || 
        urlLower.includes('/article') || urlLower.includes('/post')) {
      return 'blog';
    }
    
    // E-commerce patterns
    if (urlLower.includes('/shop') || urlLower.includes('/store') || 
        urlLower.includes('/product') || urlLower.includes('/buy')) {
      return 'shop';
    }
    
    // Support patterns
    if (urlLower.includes('/support') || urlLower.includes('/faq') || 
        urlLower.includes('/contact') || urlLower.includes('/help-center')) {
      return 'support';
    }
    
    // Homepage patterns (root domain or basic paths)
    const pathSegments = new URL(url).pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0 || 
        (pathSegments.length === 1 && ['about', 'home', 'index'].includes(pathSegments[0]))) {
      return 'homepage';
    }
    
    return 'unknown';
  }

  /**
   * Apply context-aware scoring adjustments
   */
  adjustScore(
    originalAnalysis: AnalysisResponse,
    siteCategory: DiscoveredSite['category'],
    siteType: DiscoveredSite['type']
  ): { adjustedScore: number; adjustments: ScoringAdjustment[]; reason: string } {
    const adjustments: ScoringAdjustment[] = [];
    const weights = this.siteTypeWeights[siteCategory];
    
    logger.debug(`Applying context-aware scoring for ${siteCategory} site`);

    // Recalculate score with site-type specific weights using the same formula as original
    let totalWeight = 0;
    let weightedScore = 0;
    const categories = originalAnalysis.categories;

    for (const category of categories) {
      const newWeight = weights[category.id as keyof SiteTypeWeights] || 20;
      const originalWeight = this.getOriginalWeight(category.id);
      
      // Calculate weighted score using the original formula: score * weight
      weightedScore += (category.score * newWeight);
      totalWeight += newWeight;

      // Log significant weight changes
      if (Math.abs(newWeight - originalWeight) >= 5) {
        adjustments.push({
          category: category.name,
          adjustment: newWeight - originalWeight,
          reason: this.getAdjustmentReason(category.id, siteCategory, newWeight - originalWeight)
        });
      }
    }

    // Calculate final score using original formula: weightedScore / totalWeight
    let adjustedScore = Math.round(weightedScore / totalWeight);

    // Apply category-specific bonuses/penalties
    const categoryAdjustments = this.applyCategorySpecificAdjustments(originalAnalysis, siteCategory);
    adjustments.push(...categoryAdjustments.adjustments);
    adjustedScore += categoryAdjustments.scoreChange;

    // Ensure score stays within 0-100 range
    adjustedScore = Math.max(0, Math.min(100, adjustedScore));

    const reason = this.generateAdjustmentReason(siteCategory, adjustments);

    logger.debug(`Score adjusted from ${originalAnalysis.overallScore} to ${adjustedScore} for ${siteCategory} site`);

    return {
      adjustedScore,
      adjustments,
      reason
    };
  }

  /**
   * Apply category-specific adjustments based on site type
   */
  private applyCategorySpecificAdjustments(
    analysis: AnalysisResponse,
    siteCategory: DiscoveredSite['category']
  ): { scoreChange: number; adjustments: ScoringAdjustment[] } {
    const adjustments: ScoringAdjustment[] = [];
    let scoreChange = 0;

    // Documentation sites: Bonus for good content structure
    if (siteCategory === 'docs') {
      const contentCategory = analysis.categories.find(c => c.id === 'content_structure');
      if (contentCategory && contentCategory.score >= 80) {
        scoreChange += 5;
        adjustments.push({
          category: 'Content Structure',
          adjustment: 5,
          reason: 'Documentation sites with excellent content structure get bonus points'
        });
      }
    }

    // E-commerce sites: Penalty for missing product schema
    if (siteCategory === 'shop') {
      const structuredCategory = analysis.categories.find(c => c.id === 'structured_data');
      if (structuredCategory && structuredCategory.score < 30) {
        scoreChange -= 10;
        adjustments.push({
          category: 'Structured Data',
          adjustment: -10,
          reason: 'E-commerce sites need Product schema for LLM discoverability'
        });
      }
    }

    // API sites: Bonus for technical infrastructure
    if (siteCategory === 'api') {
      const techCategory = analysis.categories.find(c => c.id === 'technical_infrastructure');
      if (techCategory && techCategory.score >= 70) {
        scoreChange += 5;
        adjustments.push({
          category: 'Technical Infrastructure',
          adjustment: 5,
          reason: 'API sites with strong technical infrastructure get bonus points'
        });
      }
    }

    // Blog sites: Bonus for article schema
    if (siteCategory === 'blog') {
      const structuredCategory = analysis.categories.find(c => c.id === 'structured_data');
      if (structuredCategory && structuredCategory.score >= 60) {
        scoreChange += 3;
        adjustments.push({
          category: 'Structured Data',
          adjustment: 3,
          reason: 'Blog sites with good Article schema markup get bonus points'
        });
      }
    }

    return { scoreChange, adjustments };
  }

  /**
   * Get original weight for category
   */
  private getOriginalWeight(categoryId: string): number {
    const originalWeights: Record<string, number> = {
      crawlability_access: 40,
      structured_data: 20,
      content_structure: 20,
      technical_infrastructure: 20
    };
    return originalWeights[categoryId] || 20;
  }

  /**
   * Generate reason for weight adjustment
   */
  private getAdjustmentReason(categoryId: string, siteCategory: string, adjustment: number): string {
    const direction = adjustment > 0 ? 'increased' : 'decreased';
    const categoryName = categoryId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const reasons: Record<string, Record<string, string>> = {
      docs: {
        content_structure: `${categoryName} weight ${direction} - documentation sites need excellent content organization`,
        structured_data: `${categoryName} weight ${direction} - docs have lower schema markup expectations`,
        technical_infrastructure: `${categoryName} weight ${direction} - technical features important for developer resources`
      },
      shop: {
        structured_data: `${categoryName} weight ${direction} - e-commerce requires Product schema for LLM understanding`,
        content_structure: `${categoryName} weight ${direction} - product pages have different content needs`
      },
      api: {
        technical_infrastructure: `${categoryName} weight ${direction} - API sites need robust technical implementation`,
        structured_data: `${categoryName} weight ${direction} - APIs have minimal schema requirements`
      },
      blog: {
        structured_data: `${categoryName} weight ${direction} - blogs benefit significantly from Article schema`,
        crawlability_access: `${categoryName} weight ${direction} - content discovery is crucial for blogs`
      }
    };

    return reasons[siteCategory]?.[categoryId] || 
           `${categoryName} weight adjusted for ${siteCategory} site type`;
  }

  /**
   * Generate overall adjustment reason
   */
  private generateAdjustmentReason(siteCategory: string, adjustments: ScoringAdjustment[]): string {
    if (adjustments.length === 0) {
      return `Standard scoring applied for ${siteCategory} site`;
    }

    const majorAdjustments = adjustments.filter(adj => Math.abs(adj.adjustment) >= 5);
    if (majorAdjustments.length > 0) {
      return `Score adjusted for ${siteCategory} site type: ${majorAdjustments[0].reason}`;
    }

    return `Minor adjustments applied for ${siteCategory} site type to reflect appropriate expectations`;
  }

  /**
   * Get recommended schema types for site category
   */
  getRecommendedSchemas(siteCategory: DiscoveredSite['category']): string[] {
    const schemaRecommendations: Record<DiscoveredSite['category'], string[]> = {
      homepage: ['Organization', 'WebSite', 'LocalBusiness'],
      docs: ['Article', 'TechArticle', 'HowTo', 'FAQPage'],
      blog: ['Article', 'BlogPosting', 'Person', 'BreadcrumbList'],
      api: ['TechArticle', 'SoftwareApplication', 'WebAPI'],
      shop: ['Product', 'Review', 'AggregateRating', 'Offer'],
      support: ['FAQPage', 'Article', 'ContactPoint'],
      unknown: ['Organization', 'WebSite', 'Article']
    };

    return schemaRecommendations[siteCategory] || schemaRecommendations.unknown;
  }
} 