/**
 * Site Discovery API Route
 * Discovers related sites without performing full analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { SiteDiscoveryService } from '../../../lib/services/SiteDiscoveryService';
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

    console.log(`Site discovery request received for: ${body.inputUrl}`);

    // Try smart discovery first
    const result = await siteDiscoveryService.discoverSites(body.inputUrl);
    console.log(`Site discovery completed for ${body.inputUrl}: ${result.totalFound} sites found, ${result.analysisReady.length} accessible`);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Site discovery API failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Discovery failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
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