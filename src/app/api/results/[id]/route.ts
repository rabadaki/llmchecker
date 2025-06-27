import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Missing result ID' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('id', id)
      .eq('is_public', true) // Only return public results for now
      .gt('expires_at', new Date().toISOString()) // Check not expired
      .single()

    if (error || !data) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Analysis results not found or expired' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: data.id,
      results: data.results,
      originalSearchTerm: data.original_search_term,
      createdAt: data.created_at,
      expiresAt: data.expires_at
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}