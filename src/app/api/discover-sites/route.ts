/**
 * Site Discovery API Route
 * Discovers related sites without performing full analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { SiteDiscoveryService, SiteDiscoveryResult } from '../../../lib/services/SiteDiscoveryService';
import { logger } from '../../../lib/utils/logger';

const siteDiscoveryService = new SiteDiscoveryService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    if (!body.inputUrl) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    logger.info(`Site discovery request received for: ${body.inputUrl}`);

    // Add timeout wrapper for Vercel
    const discoveryPromise = siteDiscoveryService.discoverSites(body.inputUrl);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Discovery timeout after 45 seconds')), 45000)
    );

    const result = await Promise.race([discoveryPromise, timeoutPromise]) as SiteDiscoveryResult;
    logger.info(`Site discovery completed for ${body.inputUrl}: ${result.totalFound} sites found, ${result.analysisReady.length} accessible`);
    
    return NextResponse.json(result);

  } catch (error) {
    logger.error('Site discovery API failed:', error);
    
    // Return more user-friendly error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = errorMessage.includes('timeout');
    
    return NextResponse.json(
      { 
        error: isTimeout ? 'Analysis timeout - please try a simpler URL' : 'Discovery failed', 
        details: errorMessage,
        retryable: !isTimeout
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
    const result = await siteDiscoveryService.discoverSites(url);
    return NextResponse.json(result);

  } catch (error) {
    logger.error('Site discovery failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Discovery failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}