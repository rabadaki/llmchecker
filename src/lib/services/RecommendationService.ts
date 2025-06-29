/**
 * Unified Recommendation Service
 * Single service to handle all recommendation generation and processing
 */

import { 
  RECOMMENDATION_TEMPLATES, 
  getRecommendationsForAnalysis, 
  sortRecommendationsByPriority, 
  formatRecommendationsForUI,
  RecommendationTemplate 
} from '../config/recommendations';
import { AnalysisResponse, CategoryResult } from '../types/analysis';

export interface ProcessedRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  category: string;
  implementation: {
    steps: string[];
    codeExample?: string;
    estimatedTime: string;
  };
  affectedPages: string[];
  priority: number;
}

export interface RecommendationSummary {
  totalRecommendations: number;
  highImpact: number;
  mediumImpact: number;
  lowImpact: number;
  quickWins: ProcessedRecommendation[]; // High impact + Easy effort
  prioritized: ProcessedRecommendation[];
}

export class RecommendationService {
  
  /**
   * Generate recommendations for single site analysis
   */
  generateSingleSiteRecommendations(analysis: AnalysisResponse): RecommendationSummary {
    const templates = getRecommendationsForAnalysis(analysis.categories);
    const processed = this.processRecommendations(templates, [analysis.url]);
    
    return this.createSummary(processed);
  }
  
  /**
   * Generate recommendations for multi-site analysis
   */
  generateMultiSiteRecommendations(analyses: AnalysisResponse[]): RecommendationSummary {
    // Aggregate all recommendations across sites
    const allRecommendations = new Map<string, {
      template: RecommendationTemplate;
      affectedSites: string[];
      totalImpact: number;
    }>();
    
    analyses.forEach(analysis => {
      const templates = getRecommendationsForAnalysis(analysis.categories);
      
      templates.forEach(template => {
        const existing = allRecommendations.get(template.id);
        const impactWeight = this.getImpactWeight(template.impact);
        
        if (existing) {
          existing.affectedSites.push(analysis.url);
          existing.totalImpact += impactWeight;
        } else {
          allRecommendations.set(template.id, {
            template,
            affectedSites: [analysis.url],
            totalImpact: impactWeight
          });
        }
      });
    });
    
    // Convert to processed recommendations and sort by total impact
    const processed = Array.from(allRecommendations.values())
      .map(item => this.processRecommendation(item.template, item.affectedSites, item.totalImpact))
      .sort((a, b) => b.priority - a.priority);
    
    return this.createSummary(processed);
  }
  
  /**
   * Process recommendation templates into full recommendation objects
   */
  private processRecommendations(
    templates: RecommendationTemplate[], 
    affectedPages: string[]
  ): ProcessedRecommendation[] {
    return templates.map(template => 
      this.processRecommendation(template, affectedPages)
    );
  }
  
  /**
   * Process single recommendation template
   */
  private processRecommendation(
    template: RecommendationTemplate, 
    affectedPages: string[],
    totalImpact?: number
  ): ProcessedRecommendation {
    const priority = totalImpact || this.calculatePriority(template);
    
    return {
      id: template.id,
      title: template.title,
      description: template.description,
      impact: template.impact,
      effort: template.effort,
      category: this.formatCategoryName(template.category),
      implementation: template.implementation,
      affectedPages,
      priority
    };
  }
  
  /**
   * Calculate priority score for recommendation
   */
  private calculatePriority(template: RecommendationTemplate): number {
    const impactWeight = this.getImpactWeight(template.impact);
    const effortWeight = this.getEffortWeight(template.effort);
    
    // Formula: Impact is 3x more important than effort
    return (impactWeight * 3) + effortWeight;
  }
  
  /**
   * Get numeric weight for impact level
   */
  private getImpactWeight(impact: 'high' | 'medium' | 'low'): number {
    switch (impact) {
      case 'high': return 10;
      case 'medium': return 6;
      case 'low': return 3;
    }
  }
  
  /**
   * Get numeric weight for effort level (inverse - easier = higher weight)
   */
  private getEffortWeight(effort: 'easy' | 'medium' | 'hard'): number {
    switch (effort) {
      case 'easy': return 3;
      case 'medium': return 2;
      case 'hard': return 1;
    }
  }
  
  /**
   * Format category name for display
   */
  private formatCategoryName(category: string): string {
    return category
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
  
  /**
   * Create recommendation summary with statistics
   */
  private createSummary(recommendations: ProcessedRecommendation[]): RecommendationSummary {
    const highImpact = recommendations.filter(r => r.impact === 'high').length;
    const mediumImpact = recommendations.filter(r => r.impact === 'medium').length;
    const lowImpact = recommendations.filter(r => r.impact === 'low').length;
    
    // Quick wins: High impact + Easy effort
    const quickWins = recommendations
      .filter(r => r.impact === 'high' && r.effort === 'easy')
      .slice(0, 5); // Top 5 quick wins
    
    return {
      totalRecommendations: recommendations.length,
      highImpact,
      mediumImpact,
      lowImpact,
      quickWins,
      prioritized: recommendations
    };
  }
  
  /**
   * Get legacy format for backward compatibility
   */
  getLegacyRecommendations(analysis: any): string[] {
    const allChecks: any[] = [];
    
    // Extract all checks from all categories
    if (analysis.categories) {
      analysis.categories.forEach((category: any) => {
        if (category.checks) {
          category.checks.forEach((check: any) => {
            allChecks.push(check);
          });
        }
      });
    }
    
    // Get recommendations for each check that needs improvement
    const recommendations: string[] = [];
    
    allChecks.forEach(check => {
      const templates = RECOMMENDATION_TEMPLATES.filter(template => 
        template.triggers.some(trigger => 
          trigger.checkId === check.id && check.score < trigger.scoreThreshold
        )
      );
      
      templates.forEach(template => {
        const emoji = this.getEmojiForCategory(template.category);
        recommendations.push(`${emoji} ${template.title}`);
      });
    });
    
    return recommendations;
  }
  
  /**
   * Get emoji for category (backward compatibility)
   */
  private getEmojiForCategory(category: string): string {
    switch (category) {
      case 'ai_access': return '🤖';
      case 'structured_data': return '📊';
      case 'content_structure': return '📝';
      case 'technical_infrastructure': return '⚙️';
      default: return '📋';
    }
  }
  
  /**
   * Format recommendations for UI components
   */
  formatForUI(recommendations: ProcessedRecommendation[]): Array<{
    title: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'easy' | 'medium' | 'hard';
    category: string;
    description?: string;
    implementation?: any;
  }> {
    return recommendations.map(rec => ({
      title: rec.title,
      impact: rec.impact,
      effort: rec.effort,
      category: rec.category,
      description: rec.description,
      implementation: rec.implementation
    }));
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();