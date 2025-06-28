/**
 * Multi-Site Analysis API Route
 * Provides comprehensive website analysis with site discovery and context-aware scoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { MultiSiteAnalysisService } from '../../../lib/services/MultiSiteAnalysisService';
import { MultiSiteAnalysisRequest, MultiSiteAnalysisResponse } from '../../../lib/types/analysis';
import { logger } from '../../../lib/utils/logger';

const multiSiteAnalysisService = new MultiSiteAnalysisService();

export async function POST(request: NextRequest) {
  try {
    const body: MultiSiteAnalysisRequest = await request.json();
    
    // Validate request
    if (!body.inputUrl) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Set default values with lower limits for serverless
    const analysisRequest: MultiSiteAnalysisRequest = {
      inputUrl: body.inputUrl,
      discoveryEnabled: body.discoveryEnabled ?? true,
      customUrls: body.customUrls || [],
      analysisOptions: {
        includeSubdomains: body.analysisOptions?.includeSubdomains ?? true,
        includePaths: body.analysisOptions?.includePaths ?? true,
        maxSites: Math.min(body.analysisOptions?.maxSites ?? 5, 5) // Limit to 5 for serverless
      }
    };

    logger.info(`Multi-site analysis request received for: ${analysisRequest.inputUrl}`);

    // Add timeout wrapper for Vercel (50 seconds to stay under 60s limit)
    const analysisPromise = multiSiteAnalysisService.analyzeMultipleSites(analysisRequest);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Analysis timeout after 50 seconds')), 50000)
    );

    const result = await Promise.race([analysisPromise, timeoutPromise]) as MultiSiteAnalysisResponse;

    logger.info(`Multi-site analysis completed for ${analysisRequest.inputUrl}: ${result.analyses.length} sites analyzed, average score: ${result.summary.averageScore}`);

    return NextResponse.json(result);

  } catch (error) {
    logger.error('Multi-site analysis failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = errorMessage.includes('timeout');
    
    return NextResponse.json(
      { 
        error: isTimeout ? 'Analysis timeout - try analyzing fewer sites' : 'Analysis failed', 
        details: errorMessage,
        retryable: !isTimeout,
        suggestion: isTimeout ? 'Try reducing the number of sites or disable discovery' : undefined
      },
      { status: isTimeout ? 408 : 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    const analysisRequest: MultiSiteAnalysisRequest = {
      inputUrl: url,
      discoveryEnabled: true,
      analysisOptions: {
        includeSubdomains: true,
        includePaths: true,
        maxSites: 5 // Smaller limit for GET requests
      }
    };

    const result = await multiSiteAnalysisService.analyzeMultipleSites(analysisRequest);
    return NextResponse.json(result);

  } catch (error) {
    logger.error('Multi-site analysis failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 