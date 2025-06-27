import { NextRequest, NextResponse } from 'next/server'
import { AnalysisService } from '@/lib/services/AnalysisService'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Use the real analysis service
    const analysisService = new AnalysisService()
    const result = await analysisService.analyzeUrl({ url })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
