/**
 * Multi-Site Analysis API Route
 * Provides comprehensive website analysis with site discovery and context-aware scoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { MultiSiteAnalysisService } from '../../../lib/services/MultiSiteAnalysisService';
import { MultiSiteAnalysisRequest } from '../../../lib/types/analysis';
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

    // Set default values
    const analysisRequest: MultiSiteAnalysisRequest = {
      inputUrl: body.inputUrl,
      discoveryEnabled: body.discoveryEnabled ?? true,
      customUrls: body.customUrls || [],
      analysisOptions: {
        includeSubdomains: body.analysisOptions?.includeSubdomains ?? true,
        includePaths: body.analysisOptions?.includePaths ?? true,
        maxSites: body.analysisOptions?.maxSites ?? 10
      }
    };

    logger.info(`Multi-site analysis request received for: ${analysisRequest.inputUrl}`);

    // Perform multi-site analysis
    const result = await multiSiteAnalysisService.analyzeMultipleSites(analysisRequest);

    logger.info(`Multi-site analysis completed for ${analysisRequest.inputUrl}: ${result.analyses.length} sites analyzed, average score: ${result.summary.averageScore}`);

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