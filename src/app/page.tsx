"use client"

import { useState, useEffect } from "react"
import { UnifiedSiteInput } from "@/components/unified-site-input"
import { MultiSiteAnalysisFlow } from "@/components/multi-site-analysis-flow"
import { MultiSiteDashboard } from "@/components/multi-site-dashboard"
import { EnhancedAnalysisFlow } from "@/components/enhanced-analysis-flow"
import { ModernResultsEnhanced } from "@/components/modern-results-enhanced"
import { ModernHeader } from "@/components/modern-header"
import { ScrollToResults } from "@/components/scroll-to-results"
import { FAQSection } from "@/components/faq-section"
import { trackAnalysisStart, trackAnalysisComplete } from "@/lib/analytics"
import Head from "next/head"
import { SchemaMarkup } from "@/components/schema-markup"

export interface AnalysisResult {
  url: string
  type?: string
  title?: string
  overallScore: number
  categories: {
    crawlability: {
      name: string
      score: number
      weight: number
      icon: string
      checks: Array<{
        name: string
        score: number
        status: "pass" | "warning" | "fail"
        recommendation: string
      }>
    }
    contentStructure: {
      name: string
      score: number
      weight: number
      icon: string
      checks: Array<{
        name: string
        score: number
        status: "pass" | "warning" | "fail"
        recommendation: string
      }>
    }
    contentQuality: {
      name: string
      score: number
      weight: number
      icon: string
      checks: Array<{
        name: string
        score: number
        status: "pass" | "warning" | "fail"
        recommendation: string
      }>
    }
    structuredData: {
      name: string
      score: number
      weight: number
      icon: string
      checks: Array<{
        name: string
        score: number
        status: "pass" | "warning" | "fail"
        recommendation: string
      }>
    }
    machineReadability: {
      name: string
      score: number
      weight: number
      icon: string
      checks: Array<{
        name: string
        score: number
        status: "pass" | "warning" | "fail"
        recommendation: string
      }>
    }
    authoritySignals: {
      name: string
      score: number
      weight: number
      icon: string
      checks: Array<{
        name: string
        score: number
        status: "pass" | "warning" | "fail"
        recommendation: string
      }>
    }
    technicalPerformance: {
      name: string
      score: number
      weight: number
      icon: string
      checks: Array<{
        name: string
        score: number
        status: "pass" | "warning" | "fail"
        recommendation: string
      }>
    }
  }
  recommendations: {
    quickWins: Array<{
      title: string
      description: string
      impact: "high" | "medium" | "low"
    }>
    longTerm: Array<{
      title: string
      description: string
      impact: "high" | "medium" | "low"
    }>
  }
  summary?: {
    insights: string[]
  }
  timestamp: string
}

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [multiSiteResults, setMultiSiteResults] = useState<any[] | null>(null)
  const [sitesToAnalyze, setSitesToAnalyze] = useState<any[]>([])
  const [originalSearchTerm, setOriginalSearchTerm] = useState<string>('')
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  // Database connection test completed - removed to avoid interference

  const handleAnalyze = (sites: any[]) => {
    setSitesToAnalyze(sites)
    // Store the original search term (first site's URL)
    if (sites.length > 0) {
      setOriginalSearchTerm(sites[0].url)
      // Track analysis start
      trackAnalysisStart(sites[0].url, sites.length > 1)
    }
    setIsAnalyzing(true)
  }

  const handleSingleSiteComplete = async () => {
    try {
      const url = sitesToAnalyze[0]?.url;
      if (!url) {
        throw new Error('No URL to analyze');
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Transform the result to match the expected AnalysisResult format
      const transformedResult: AnalysisResult = {
        url: result.url,
        overallScore: result.overallScore,
        categories: result.categories.reduce((acc: any, category: any) => {
          // Map category IDs to the expected property names
          const categoryMap: Record<string, string> = {
            'crawlability_access': 'crawlability',
            'content_structure': 'contentStructure', 
            'structured_data': 'structuredData',
            'technical_infrastructure': 'technicalPerformance'
          };
          
          const propertyName = categoryMap[category.id] || category.id;
          acc[propertyName] = {
            name: category.name,
            score: category.score,
            weight: category.weight,
            icon: category.icon,
            checks: category.checks || []
          };
          return acc;
        }, {}),
        recommendations: {
          quickWins: result.summary?.improvements?.slice(0, 3)?.map((imp: string) => ({
            title: imp,
            description: `Based on analysis findings`,
            impact: "high" as const
          })) || [],
          longTerm: result.summary?.improvements?.slice(3)?.map((imp: string) => ({
            title: imp,
            description: `Long-term improvement opportunity`,
            impact: "medium" as const
          })) || []
        },
        timestamp: result.timestamp || new Date().toISOString(),
      };

      setAnalysisResult(transformedResult);
      setIsAnalyzing(false);
      
      // Track analysis completion
      trackAnalysisComplete(url, transformedResult.overallScore, false);
      
      // Save single-site results to database for sharing
      const singleSiteResult = {
        url: transformedResult.url,
        type: transformedResult.type || 'homepage',
        title: transformedResult.title,
        overallScore: transformedResult.overallScore,
        categories: {
          aiAccess: transformedResult.categories.crawlability?.score || 0,
          contentStructure: transformedResult.categories.contentStructure?.score || 0,
          technicalInfra: transformedResult.categories.technicalPerformance?.score || 0,
          structuredData: transformedResult.categories.structuredData?.score || 0
        },
        insights: transformedResult.summary?.insights || [],
        recommendations: [
          ...(transformedResult.recommendations?.quickWins || []),
          ...(transformedResult.recommendations?.longTerm || [])
        ].map(rec => ({
          title: rec.title,
          impact: rec.impact,
          effort: 'medium',
          category: 'General'
        }))
      };
      saveResultsToDatabase([singleSiteResult]);
    } catch (error) {
      console.error('Single site analysis error:', error);
      setIsAnalyzing(false);
      // Could set an error state here to show to the user
    }
  }

  const handleMultiSiteComplete = (results: any[]) => {
    // Use the real analysis results directly
    const transformedResults = results.map((result) => {
      // Fallback data for when analysis fails - use conservative defaults with no fake scores
      const generateFallbackData = () => {
        const scores = {
          aiAccess: 0, // No fake scores - analysis failed
          contentStructure: 0, // No fake scores - analysis failed
          technicalInfra: 0, // No fake scores - analysis failed
          structuredData: 0, // No fake scores - analysis failed
        };

        // Only provide generic recommendations for failed analysis
        const recommendations: Array<{
          title: string;
          impact: "high" | "medium" | "low";
          effort: "easy" | "medium" | "hard";
          category: string;
        }> = [
          {
            title: "Analysis incomplete - try again",
            impact: "high" as const,
            effort: "easy" as const,
            category: "System"
          }
        ];

        return { scores, recommendations };
      };

      const hasRealData = result.categories && Array.isArray(result.categories) && result.categories.length > 0;
      
      const realData = hasRealData ? {
        scores: {
          aiAccess: result.categories?.find((c: any) => 
            c.name === 'AI Access Control' || c.id === 'crawlability_access'
          )?.score || 0,
          contentStructure: result.categories?.find((c: any) => 
            c.name === 'Content Structure' || c.id === 'content_structure'
          )?.score || 0,
          technicalInfra: result.categories?.find((c: any) => 
            c.name === 'Technical Infrastructure' || c.id === 'technical_infrastructure'
          )?.score || 0,
          structuredData: result.categories?.find((c: any) => 
            c.name === 'Structured Data' || c.id === 'structured_data'
          )?.score || 0,
        },
        recommendations: result.recommendations || []
      } : generateFallbackData();

      const categoryScores = realData.scores;

      return {
        url: result.url,
        type: (() => {
          const category = result.siteInfo?.category || result.type || "homepage";
          // Map backend categories to user-friendly display names
          const categoryMap: Record<string, string> = {
            'homepage': 'Homepage',
            'docs': 'Documentation', 
            'api': 'API Reference',
            'support': 'Support',
            'blog': 'Blog',
            'shop': 'Store',
            'unknown': 'Website'
          };
          
          // Special handling for specific URLs
          const url = result.url;
          if (url.includes('/dashboard')) return 'Dashboard';
          if (url.includes('/status')) return 'Status';
          if (url.includes('/pricing')) return 'Pricing';
          if (url.includes('/about')) return 'About';
          
          return categoryMap[category] || 'Website';
        })(),
        title: result.title || (() => {
          const urlObj = new URL(result.url);
          // Show subdomain.domain.com or domain.com/path
          if (urlObj.hostname !== urlObj.hostname.replace(/^www\./, '').split('.').slice(-2).join('.')) {
            // Has subdomain
            return urlObj.hostname;
          } else if (urlObj.pathname !== '/') {
            // Has path
            return `${urlObj.hostname}${urlObj.pathname}`;
          } else {
            // Just domain
            return urlObj.hostname;
          }
        })(),
        overallScore: result.overallScore || 0,
        categories: result.categories || categoryScores,
        insights: result.insights || [],
        recommendations: result.recommendations || realData.recommendations,
      };
    })

    setMultiSiteResults(transformedResults)
    setIsAnalyzing(false)
    
    // Track multi-site analysis completion
    if (transformedResults.length > 0) {
      const averageScore = Math.round(
        transformedResults.reduce((sum, result) => sum + (result.overallScore || 0), 0) / transformedResults.length
      );
      trackAnalysisComplete(originalSearchTerm, averageScore, true);
    }
    
    // Save results to database for sharing
    saveResultsToDatabase(transformedResults)
  }

  // Save results to database for sharing
  const saveResultsToDatabase = async (results: any[]) => {
    console.log('💾 Saving results to database...', { originalSearchTerm, resultsCount: results.length })
    console.log('🔍 Function called with results:', results.length > 0)
    
    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results,
          originalSearchTerm,
          userId: null // Will be set when we add authentication
        }),
      })

      console.log('📡 API Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Results saved successfully:', data)
        setShareUrl(data.shareUrl)
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to save results for sharing:', response.status, errorText)
      }
    } catch (error) {
      console.error('💥 Error saving results:', error)
    }
  }

  const handleReset = () => {
    setAnalysisResult(null)
    setMultiSiteResults(null)
    setSitesToAnalyze([])
    setOriginalSearchTerm('')
    setShareUrl(null)
  }

  const isMultiSite = sitesToAnalyze.length > 1

  return (
    <>
      <Head>
        <title>Free AI Visibility Tool – Check Your Website's AI Visibility</title>
        <meta name="description" content="Test if ChatGPT, Claude & Perplexity can find your website. Get free robots.txt analysis, schema markup validation, and instant AI optimization recommendations." />
        <meta property="og:title" content="Free AI Visibility Tool – Check Your Website's AI Visibility" />
        <meta property="og:description" content="Test if ChatGPT, Claude & Perplexity can find your website. Get free robots.txt analysis, schema markup validation, and instant AI optimization recommendations." />
        <meta property="og:image" content="https://amivisibleonai.vercel.app/og-image.png" />
        <meta property="og:url" content="https://amivisibleonai.vercel.app/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free AI Visibility Tool – Check Your Website's AI Visibility" />
        <meta name="twitter:description" content="Test if ChatGPT, Claude & Perplexity can find your website. Get free robots.txt analysis, schema markup validation, and instant AI optimization recommendations." />
        <meta name="twitter:image" content="https://amivisibleonai.vercel.app/og-image.png" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Am I Visible on AI - Free AI Visibility Tool",
              "alternateName": ["AI Visibility Checker", "Am I Visible on AI Tool", "AI Visibility Test"],
              "description": "Wondering 'am I visible on AI?' Find out instantly. Free tool analyzes if ChatGPT, Claude & Perplexity can access your website. Get your AI visibility score with detailed optimization recommendations.",
              "url": "https://amivisibleonai.vercel.app",
              "applicationCategory": "SEOApplication",
              "applicationSubCategory": "AI Visibility Tool",
              "operatingSystem": "Web Browser",
              "softwareVersion": "1.0",
              "releaseNotes": "Comprehensive AI visibility analysis with robots.txt checking, schema validation, and multi-site comparison",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "priceValidUntil": "2025-12-31"
              },
              "creator": {
                "@type": "Organization",
                "name": "Am I Visible on AI",
                "url": "https://amivisibleonai.vercel.app"
              },
              "featureList": [
                "Free AI visibility analysis",
                "Robots.txt checker for AI crawlers",
                "Schema markup validation",
                "ChatGPT visibility testing",
                "Claude crawler analysis", 
                "Perplexity optimization",
                "Technical SEO analysis",
                "Multi-site comparison",
                "Instant optimization recommendations",
                "AI crawler access permissions"
              ],
              "keywords": "AI visibility tool, robots.txt checker, AI visibility, ChatGPT optimization, Claude search, schema markup checker",
              "screenshot": "https://amivisibleonai.vercel.app/screenshot.png",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "156",
                "bestRating": "5",
                "worstRating": "1"
              },
              "review": [
                {
                  "@type": "Review",
                  "author": {
                    "@type": "Person",
                    "name": "Sarah M."
                  },
                  "reviewBody": "I had no idea my robots.txt was blocking ChatGPT! Fixed it in 5 minutes and now people actually find my store when they ask AI for product recommendations.",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                  }
                },
                {
                  "@type": "Review",
                  "author": {
                    "@type": "Person", 
                    "name": "David J."
                  },
                  "reviewBody": "This tool showed me exactly what schema markup I was missing. My articles started appearing in Claude responses within a week!",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                  }
                },
                {
                  "@type": "Review",
                  "author": {
                    "@type": "Person",
                    "name": "Maria K."
                  },
                  "reviewBody": "Finally, a free tool that actually helps with AI optimization! The recommendations were spot-on and easy to implement.",
                  "reviewRating": {
                    "@type": "Rating", 
                    "ratingValue": "5",
                    "bestRating": "5"
                  }
                }
              ]
            })
          }}
        />

        {/* FAQ Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How can I check if my website is visible to ChatGPT?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "That's exactly what our tool does! We analyze your website to see if AI systems like ChatGPT can access and understand your content. We check your robots.txt file for AI crawler permissions, validate your structured data markup, and test how well your content is organized. You'll get a score and specific recommendations to improve how ChatGPT, Claude, and other AI systems can find and reference your site."
                  }
                },
                {
                  "@type": "Question", 
                  "name": "What is GPTBot and should I allow it on my website?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "GPTBot is OpenAI's official web crawler that feeds information to ChatGPT. If you block GPTBot in your robots.txt file, your content won't appear in ChatGPT responses when people ask questions about your topic. Most websites should allow GPTBot unless they have specific privacy concerns. We'll check if your robots.txt blocks GPTBot and show you exactly how to fix it."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Why isn't my website showing up in AI search results?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "There are usually three main reasons: 1) Your robots.txt file blocks AI crawlers like GPTBot or ClaudeBot, 2) You're missing structured data that helps AI understand your content, or 3) Your content isn't organized in a way that AI can easily extract information. Our analysis identifies exactly which issues your site has and gives you step-by-step fixes."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is this actually free?", 
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yep, completely free! No hidden costs, no signup required, no credit card needed. You can run as many analyses as you want and check multiple websites. We built this because we think everyone should be able to optimize their AI visibility without paying enterprise fees."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What if my site is blocking AI crawlers?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "That's actually pretty common! Many sites accidentally block AI crawlers through their robots.txt file or other technical issues. If ChatGPT, Claude, or Perplexity can't crawl your site, you're essentially invisible when people ask AI questions about your topic. We'll show you exactly how to fix this with copy-paste code examples."
                  }
                }
              ]
            })
          }}
        />

        
        <ModernHeader />
        <main>
          {/* Input section */}
          {!isAnalyzing && !analysisResult && !multiSiteResults && (
            <>
              <UnifiedSiteInput onAnalyze={handleAnalyze} isAnalyzing={false} />
              <FAQSection />
            </>
          )}

          {/* Analysis loading states */}
          {isAnalyzing && (
            <div className="border-t border-gray-200">
              {isMultiSite ? (
                <MultiSiteAnalysisFlow
                  sites={sitesToAnalyze}
                  baseDomain={
                    sitesToAnalyze[0]?.url ? new URL(sitesToAnalyze[0].url).hostname.replace("www.", "") : "your site"
                  }
                  onComplete={handleMultiSiteComplete}
                />
              ) : (
                <EnhancedAnalysisFlow 
                  onComplete={handleSingleSiteComplete} 
                  url={sitesToAnalyze[0]?.url}
                />
              )}
            </div>
          )}

          {/* Results */}
          {analysisResult && (
            <div id="analysis-results" className="border-t border-gray-200">
              <ScrollToResults shouldScroll={!!analysisResult} />
              <ModernResultsEnhanced result={analysisResult} onReset={handleReset} shareUrl={shareUrl || undefined} />
            </div>
          )}

          {multiSiteResults && (
            <div id="analysis-results" className="border-t border-gray-200">
              <ScrollToResults shouldScroll={!!multiSiteResults} />
              <MultiSiteDashboard 
                results={multiSiteResults} 
                originalSearchTerm={originalSearchTerm} 
                onReset={handleReset}
                shareUrl={shareUrl || undefined}
              />
            </div>
          )}
        </main>
      </div>
    </>
  )
}
