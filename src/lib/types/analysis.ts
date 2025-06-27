/**
 * Type definitions for LLM Discoverability Analysis
 */

import { DiscoveredSite, SiteDiscoveryResult } from '../services/SiteDiscoveryService';

export interface AnalysisRequest {
  url: string;
}

export interface CheckResult {
  id: string;
  name: string;
  score: number; // Progressive scoring 0-100
  status: string;
  details: string;
  executionTime?: number;
}

export interface CategoryResult {
  id: string;
  name: string;
  weight: number;
  icon: string;
  description: string;
  score: number;
  checks: CheckResult[];
  recommendations: string[];
}

export interface AnalysisResponse {
  url: string;
  timestamp: string;
  executionTime: number;
  overallScore: number;
  categories: CategoryResult[];
  summary: {
    strengths: string[];
    improvements: string[];
    priority: 'low' | 'medium' | 'high';
  };
  pageType?: string;
  scoringAdjustments?: Array<{
    category: string;
    adjustment: number;
    reason: string;
  }>;
  contextAwareResult?: {
    originalScore: number;
    adjustedScore: number;
    adjustmentReason: string;
  };
}

export interface ScoringCriteria {
  '0': { criteria: string; details: string };
  '50'?: { criteria: string; details: string };
  '100': { criteria: string; details: string };
}

export interface CheckDefinition {
  id: string;
  name: string;
  description: string;
  scoring: ScoringCriteria;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  weight: number;
  icon: string;
  description: string;
  checks: CheckDefinition[];
}

export interface ScoringStructure {
  scoring_categories: CategoryDefinition[];
  overall_scoring: {
    excellent: { min_score: number; description: string };
    good: { min_score: number; description: string };
    fair: { min_score: number; description: string };
    poor: { min_score: number; description: string };
  };
}

export interface RobotsTxtRule {
  userAgent: string;
  type: 'allow' | 'disallow';
  path: string;
}

export interface ContentMetrics {
  wordCount: number;
  headingCount: number;
  semanticElementCount: number;
  schemaTypes: string[];
  signalToNoiseRatio: number;
  readabilityScore?: number;
}

export interface TechnicalMetrics {
  responseTime: number;
  hasHttps: boolean;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  statusCode: number;
  contentSize: number;
}

export interface MultiSiteAnalysisRequest {
  inputUrl: string;
  discoveryEnabled?: boolean;
  customUrls?: string[];
  analysisOptions?: {
    includeSubdomains?: boolean;
    includePaths?: boolean;
    maxSites?: number;
  };
}

export interface SiteAnalysisResult extends AnalysisResponse {
  siteInfo: {
    url: string;
    type: DiscoveredSite['type'];
    category: DiscoveredSite['category'];
    discoveredAt: string;
  };
  contextAwareScore: {
    originalScore: number;
    adjustedScore: number;
    adjustmentReason: string;
  };
}

export interface MultiSiteAnalysisResponse {
  requestId: string;
  inputUrl: string;
  discovery: SiteDiscoveryResult;
  analyses: SiteAnalysisResult[];
  summary: {
    totalSites: number;
    averageScore: number;
    highestScore: SiteAnalysisResult;
    lowestScore: SiteAnalysisResult;
    recommendationsPriority: string[];
  };
  completedAt: string;
  duration: number;
}