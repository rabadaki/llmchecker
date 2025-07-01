/**
 * Unit tests for RecommendationService
 * Tests recommendation generation, prioritization, and formatting
 */

// Mock the config module - must be defined before any imports
jest.mock('../../config/recommendations', () => {
  const mockTemplates = [
    {
      id: 'robots_txt_missing',
      title: 'Add robots.txt with AI crawler access',
      description: 'Your site is missing a robots.txt file',
      impact: 'high',
      effort: 'easy',
      category: 'crawlability_access',
      affectedChecks: ['robots_txt'],
      implementation: {
        steps: ['Create robots.txt', 'Allow AI crawlers'],
        codeExample: 'User-agent: *\nAllow: /',
        estimatedTime: '5 minutes'
      }
    },
    {
      id: 'add_faq_schema',
      title: 'Add FAQ Schema markup',
      description: 'FAQ content detected without schema',
      impact: 'medium',
      effort: 'medium',
      category: 'structured_data',
      affectedChecks: ['schema_coverage'],
      implementation: {
        steps: ['Add JSON-LD FAQ schema'],
        estimatedTime: '20 minutes'
      }
    },
    {
      id: 'improve_headings',
      title: 'Improve heading structure',
      description: 'Missing H1 or poor heading hierarchy',
      impact: 'low',
      effort: 'easy',
      category: 'content_structure',
      affectedChecks: ['heading_structure'],
      implementation: {
        steps: ['Add H1', 'Fix hierarchy'],
        estimatedTime: '10 minutes'
      }
    }
  ];

  return {
    RECOMMENDATION_TEMPLATES: mockTemplates,
    getRecommendationsForAnalysis: jest.fn().mockImplementation((categories) => {
      const recommendations = [];
      
      categories.forEach(category => {
        category.checks?.forEach(check => {
          if (check.score < 80) {
            if (check.id === 'robots_txt' && check.score === 0) {
              recommendations.push(mockTemplates[0]);
            } else if (check.id === 'schema_coverage' && check.score < 30) {
              recommendations.push(mockTemplates[1]);
            } else if (check.id === 'heading_structure' && check.score < 50) {
              recommendations.push(mockTemplates[2]);
            }
          }
        });
      });
      
      return recommendations;
    }),
    sortRecommendationsByPriority: jest.fn().mockImplementation((recs) => {
      return [...recs].sort((a, b) => {
        const impactScore = { high: 3, medium: 2, low: 1 };
        const effortScore = { easy: 1, medium: 2, hard: 3 };
        const aPriority = impactScore[a.impact] / effortScore[a.effort];
        const bPriority = impactScore[b.impact] / effortScore[b.effort];
        return bPriority - aPriority;
      });
    }),
    formatRecommendationsForUI: jest.fn().mockImplementation((recs) => recs)
  };
});

import { RecommendationService } from '../RecommendationService';
import { RECOMMENDATION_TEMPLATES } from '../../config/recommendations';

describe('RecommendationService', () => {
  let recommendationService: RecommendationService;

  beforeEach(() => {
    jest.clearAllMocks();
    recommendationService = new RecommendationService();
  });

  describe('generateSingleSiteRecommendations', () => {
    it('should generate recommendations for low-scoring checks', () => {
      const mockAnalysis = {
        categories: [
          {
            id: 'crawlability_access',
            checks: [
              { id: 'robots_txt', score: 0, name: 'Robots.txt' }
            ]
          },
          {
            id: 'structured_data',
            checks: [
              { id: 'schema_coverage', score: 25, name: 'Schema Coverage' }
            ]
          }
        ]
      };

      const result = recommendationService.generateSingleSiteRecommendations(mockAnalysis);

      expect(result.totalRecommendations).toBeGreaterThan(0);
      expect(result.quickWins.length).toBeGreaterThan(0);
      expect(result.quickWins[0].impact).toBe('high');
      expect(result.quickWins[0].effort).toBe('easy');
    });

    it('should identify quick wins (high impact + easy effort)', () => {
      const mockAnalysis = {
        categories: [
          {
            id: 'crawlability_access',
            checks: [
              { id: 'robots_txt', score: 0 } // Should trigger high/easy recommendation
            ]
          }
        ]
      };

      const result = recommendationService.generateSingleSiteRecommendations(mockAnalysis);

      expect(result.quickWins.length).toBeGreaterThan(0);
      expect(result.quickWins[0].id).toBe('robots_txt_missing');
    });

    it('should count recommendations by impact level', () => {
      const mockAnalysis = {
        categories: [
          {
            id: 'crawlability_access',
            checks: [{ id: 'robots_txt', score: 0 }] // high impact
          },
          {
            id: 'structured_data',
            checks: [{ id: 'schema_coverage', score: 20 }] // medium impact
          },
          {
            id: 'content_structure',
            checks: [{ id: 'heading_structure', score: 40 }] // low impact
          }
        ]
      };

      const result = recommendationService.generateSingleSiteRecommendations(mockAnalysis);

      expect(result.highImpact).toBeGreaterThanOrEqual(1);
      expect(result.mediumImpact).toBeGreaterThanOrEqual(1);
      expect(result.lowImpact).toBeGreaterThanOrEqual(1);
    });

    it('should prioritize recommendations correctly', () => {
      const mockAnalysis = {
        categories: [
          {
            id: 'content_structure',
            checks: [{ id: 'heading_structure', score: 40 }] // low priority
          },
          {
            id: 'crawlability_access',
            checks: [{ id: 'robots_txt', score: 0 }] // high priority
          }
        ]
      };

      const result = recommendationService.generateSingleSiteRecommendations(mockAnalysis);

      // Check that we have both recommendations
      expect(result.prioritized.length).toBe(2);
      
      // High impact + easy effort should have higher priority score
      const robotsRec = result.prioritized.find(r => r.id === 'robots_txt_missing');
      const headingsRec = result.prioritized.find(r => r.id === 'improve_headings');
      
      expect(robotsRec).toBeDefined();
      expect(headingsRec).toBeDefined();
      expect(robotsRec.priority).toBeGreaterThan(headingsRec.priority);
    });

    it('should handle empty analysis gracefully', () => {
      const mockAnalysis = {
        categories: []
      };

      const result = recommendationService.generateSingleSiteRecommendations(mockAnalysis);

      expect(result.totalRecommendations).toBe(0);
      expect(result.quickWins).toEqual([]);
      expect(result.prioritized).toEqual([]);
    });

    it('should handle missing categories gracefully', () => {
      const mockAnalysis = {};

      const result = recommendationService.generateSingleSiteRecommendations(mockAnalysis);

      expect(result.totalRecommendations).toBe(0);
    });
  });

  describe('generateMultiSiteRecommendations', () => {
    it('should aggregate recommendations across multiple sites', () => {
      const mockAnalyses = [
        {
          url: 'https://site1.com',
          categories: [
            {
              id: 'crawlability_access',
              checks: [{ id: 'robots_txt', score: 0 }]
            }
          ]
        },
        {
          url: 'https://site2.com',
          categories: [
            {
              id: 'crawlability_access',
              checks: [{ id: 'robots_txt', score: 0 }]
            }
          ]
        }
      ];

      const result = recommendationService.generateMultiSiteRecommendations(mockAnalyses);

      // Should return standard RecommendationSummary
      expect(result.totalRecommendations).toBeGreaterThan(0);
      expect(result.prioritized.length).toBeGreaterThan(0);
      
      // Same issue on multiple sites should be aggregated
      const robotsRec = result.prioritized.find(r => r.id === 'robots_txt_missing');
      expect(robotsRec?.affectedPages).toContain('https://site1.com');
      expect(robotsRec?.affectedPages).toContain('https://site2.com');
    });

    it('should identify common issues across sites', () => {
      const mockAnalyses = [
        {
          url: 'https://site1.com',
          categories: [
            {
              id: 'crawlability_access',
              checks: [{ id: 'robots_txt', score: 0 }]
            }
          ]
        },
        {
          url: 'https://site2.com', 
          categories: [
            {
              id: 'crawlability_access',
              checks: [{ id: 'robots_txt', score: 0 }]
            }
          ]
        }
      ];

      const result = recommendationService.generateMultiSiteRecommendations(mockAnalyses);

      // Find the robots.txt recommendation that should affect both sites
      const robotsRec = result.prioritized.find(rec => 
        rec.id === 'robots_txt_missing'
      );
      
      expect(robotsRec).toBeDefined();
      expect(robotsRec?.affectedPages.length).toBe(2);
      expect(robotsRec?.affectedPages).toEqual(['https://site1.com', 'https://site2.com']);
    });
  });

  // Note: getLegacyRecommendations uses template.triggers which don't exist in our mocks
  // This would need proper mocking of RECOMMENDATION_TEMPLATES with triggers

  describe('Priority calculation', () => {
    it('should calculate priority based on impact and effort', () => {
      const mockAnalysis = {
        categories: [
          {
            id: 'crawlability_access',
            checks: [
              { id: 'robots_txt', score: 0 } // high impact, easy effort = priority 1
            ]
          }
        ]
      };

      const result = recommendationService.generateSingleSiteRecommendations(mockAnalysis);
      
      expect(result.prioritized[0].priority).toBeDefined();
      expect(result.prioritized[0].priority).toBeGreaterThan(0); // Priority is a calculated score
    });
  });
});