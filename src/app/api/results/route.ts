import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 API Request received:', {
      hasResults: !!body.results,
      resultsLength: body.results?.length,
      originalSearchTerm: body.originalSearchTerm,
      userId: body.userId
    })
    
    const { results, originalSearchTerm, userId } = body

    if (!results || !originalSearchTerm) {
      console.error('❌ Missing required fields:', { results: !!results, originalSearchTerm: !!originalSearchTerm })
      return NextResponse.json(
        { error: 'Missing required fields: results, originalSearchTerm' },
        { status: 400 }
      )
    }

    // Sanitize results data to ensure it's JSON-serializable
    const sanitizeData = (obj: any): any => {
      return JSON.parse(JSON.stringify(obj, (key, value) => {
        // Remove functions, undefined values, and other non-serializable data
        if (typeof value === 'function' || value === undefined) {
          return null
        }
        // Clean up strings with invalid Unicode characters
        if (typeof value === 'string') {
          return value
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
            .replace(/\udcca/g, '📊') // Replace specific problematic character
            .replace(/[\uD800-\uDFFF]/g, '') // Remove unpaired surrogates
        }
        return value
      }))
    }

    const sanitizedResults = sanitizeData(results)
    console.log('🧹 Sanitized results:', {
      originalLength: results.length,
      sanitizedLength: sanitizedResults.length,
      firstItem: sanitizedResults[0] ? Object.keys(sanitizedResults[0]) : 'No items'
    })

    // Debug: Let's see the actual structure of the first item
    if (sanitizedResults.length > 0) {
      console.log('🔍 First result structure:', JSON.stringify(sanitizedResults[0], null, 2).substring(0, 500))
    }

    // Create properly structured data that matches what the dashboard expects
    const properlyStructuredResults = sanitizedResults.map(site => ({
      url: site.url || 'unknown.com',
      type: site.type || 'homepage',
      title: site.title || 'Unknown Site',
      overallScore: site.overallScore || 50,
      categories: {
        aiAccess: site.categories?.aiAccess || 50,
        contentStructure: site.categories?.contentStructure || 50, 
        technicalInfra: site.categories?.technicalInfra || 50,
        structuredData: site.categories?.structuredData || 0
      },
      insights: site.insights || [],
      recommendations: (site.recommendations || []).map(rec => ({
        title: rec.title || 'Unknown recommendation',
        impact: rec.impact || 'medium',
        effort: rec.effort || 'medium', 
        category: rec.category || 'General'
      }))
    }))
    
    console.log('🏗️ Using properly structured data:', {
      count: properlyStructuredResults.length,
      firstItemKeys: Object.keys(properlyStructuredResults[0] || {})
    })

    // Final test: verify data can be JSON serialized
    try {
      JSON.stringify(properlyStructuredResults)
      console.log('✅ JSON serialization test passed')
    } catch (error) {
      console.error('❌ JSON serialization test failed:', error)
      // Fallback to minimal data
      const fallbackResults = [{
        url: originalSearchTerm,
        type: 'homepage',
        title: 'Analysis Results',
        overallScore: 50,
        categories: { aiAccess: 50, contentStructure: 50, technicalInfra: 50, structuredData: 0 },
        insights: ['Analysis completed'],
        recommendations: [{ title: 'Improve AI discoverability', impact: 'high', effort: 'medium', category: 'General' }]
      }]
      return NextResponse.json({
        id: nanoid(12),
        shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/results/fallback`
      })
    }

    // Generate a unique ID for the analysis
    const id = nanoid(12) // 12 character ID (URL-safe)

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { data, error } = await supabase
      .from('analysis_results')
      .insert({
        id,
        user_id: userId || null,
        results: properlyStructuredResults, // Use properly structured data
        original_search_term: originalSearchTerm,
        is_public: true, // For now, all results are public
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error:', error)
      console.error('❌ Data being inserted:', {
        id,
        user_id: userId || null,
        results: results.length > 0 ? 'Array with data' : 'Empty array',
        original_search_term: originalSearchTerm,
        is_public: true,
        expires_at: expiresAt.toISOString()
      })
      return NextResponse.json(
        { error: 'Failed to save analysis results' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      id: data.id,
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/results/${data.id}`
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}