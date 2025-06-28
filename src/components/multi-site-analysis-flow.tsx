"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertTriangle, Globe, FileText, Code, ShoppingCart } from "lucide-react"

interface AnalyzingSite {
  url: string
  type: "homepage" | "docs" | "blog" | "api" | "shop" | "about" | "pricing"
  title: string
  status: "pending" | "analyzing" | "completed" | "error"
  progress: number
  currentStep?: string
  insights?: string[]
}

interface MultiSiteAnalysisFlowProps {
  sites: AnalyzingSite[]
  baseDomain: string
  onComplete: (results: any[]) => void
}

export function MultiSiteAnalysisFlow({ sites, baseDomain, onComplete }: MultiSiteAnalysisFlowProps) {
  const [analyzingSites, setAnalyzingSites] = useState<AnalyzingSite[]>(
    sites.map((site) => ({ ...site, status: "pending", progress: 0 })),
  )
  const [overallProgress, setOverallProgress] = useState(0)
  const [currentlyAnalyzing, setCurrentlyAnalyzing] = useState(0)

  const siteTypeIcons = {
    homepage: Globe,
    docs: FileText,
    blog: FileText,
    api: Code,
    shop: ShoppingCart,
    about: FileText,
    pricing: FileText,
    support: FileText,
    unknown: Globe,
  }

  useEffect(() => {
    const performRealAnalysis = async () => {
      try {
        // Use the first site URL as the base for multi-site discovery
        const baseUrl = sites[0]?.url || `https://${baseDomain}`
        
        const response = await fetch('/api/multi-analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputUrl: baseUrl,
            discoveryEnabled: true,
            analysisOptions: {
              includeSubdomains: true,
              includePaths: true,
              maxSites: 10
            }
          }),
        })

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.statusText}`)
        }

        const result = await response.json()
        
        // Transform API result to match expected format
        const transformedResults = result.analyses.map((analysis: any, index: number) => {
          // Extract scores from categories array
          const categoriesObject: any = {};
          analysis.categories.forEach((cat: any) => {
            // Map category IDs to the expected property names
            switch(cat.id) {
              case 'crawlability_access':
                categoriesObject.aiAccess = cat.score;
                break;
              case 'content_structure':
                categoriesObject.contentStructure = cat.score;
                break;
              case 'technical_infrastructure':
                categoriesObject.technicalInfra = cat.score;
                break;
              case 'structured_data':
                categoriesObject.structuredData = cat.score;
                break;
            }
          });


          return {
            url: analysis.url,
            type: analysis.siteInfo.category,
            title: sites[index]?.title || (analysis.siteInfo.url.includes('www.') ? 
              new URL(analysis.siteInfo.url).hostname.replace('www.', '') : 
              new URL(analysis.siteInfo.url).hostname),
            overallScore: analysis.overallScore,
            categories: categoriesObject, // Pass the transformed categories object
            insights: [
              `Score: ${analysis.overallScore}/100`,
              `${analysis.categories.length} categories analyzed`,
              `${analysis.categories.reduce((sum: number, cat: any) => sum + cat.recommendations.length, 0)} recommendations`
            ],
            recommendations: analysis.categories.flatMap((cat: any) => 
              cat.recommendations.map((rec: string) => ({
                title: rec.replace(/^[🚫⚠️⭐🔧✅🏗️📝📋🖥️⚡🗺️🧹📄🤖📅🔄✍️📚🎯📊📈📍🔗🔒]/g, '').split(':')[0].trim(),
                impact: rec.includes('Add') || rec.includes('Enable') || rec.includes('Create') ? 'high' : 
                       rec.includes('Improve') || rec.includes('Optimize') ? 'medium' : 'low',
                effort: rec.includes('robots.txt') || rec.includes('sitemap') || rec.includes('HTTPS') ? 'easy' :
                       rec.includes('structured data') || rec.includes('schema') ? 'medium' : 'hard',
                category: cat.name
              }))
            )
          };
        });

        onComplete(transformedResults);
        
      } catch (error) {
        console.error('Multi-site analysis failed:', error)
        // Fallback to show error state
        setAnalyzingSites(prev => prev.map(site => ({
          ...site,
          status: 'error' as const,
          progress: 0
        })))
      }
    }

    // Start the real analysis
    performRealAnalysis()

    // Show progress animation while waiting for real results
    const progressInterval = setInterval(() => {
      setAnalyzingSites((prev) => {
        const updated = [...prev]
        let hasChanges = false

        updated.forEach((site) => {
          if (site.status === "pending" || site.status === "analyzing") {
            if (site.status === "pending") {
              site.status = "analyzing"
              site.currentStep = "Checking robots.txt..."
            }
            
            if (site.progress < 95) { // Don't complete until real analysis is done
              site.progress += 2 // Steady progress instead of random
              hasChanges = true

              // Update current step based on progress
              if (site.progress > 80) {
                site.currentStep = "Generating recommendations..."
              } else if (site.progress > 60) {
                site.currentStep = "Analyzing structured data..."
              } else if (site.progress > 40) {
                site.currentStep = "Checking content structure..."
              } else if (site.progress > 20) {
                site.currentStep = "Testing technical infrastructure..."
              }
            }
          }
        })

        return hasChanges ? updated : prev
      })
    }, 800)

    // Calculate overall progress
    const progressCalcInterval = setInterval(() => {
      const totalProgress = analyzingSites.reduce((sum, site) => sum + site.progress, 0)
      const newOverallProgress = Math.min(95, totalProgress / analyzingSites.length) // Cap at 95% until real analysis completes
      setOverallProgress(newOverallProgress)
    }, 200)

    return () => {
      clearInterval(progressInterval)
      clearInterval(progressCalcInterval)
    }
  }, [sites, baseDomain, onComplete])

  const completedCount = analyzingSites.filter((site) => site.status === "completed").length
  const analyzingCount = analyzingSites.filter((site) => site.status === "analyzing").length

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Analyzing {baseDomain}'s Pages</h2>
            <p className="text-gray-600">Running comprehensive analysis across {sites.length} pages...</p>
          </div>

          {/* Overall Progress */}
          <Card className="p-8 mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Overall Progress</span>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-purple-600">{Math.round(overallProgress)}%</span>
                <Badge variant="outline">
                  {completedCount}/{analyzingSites.length} completed
                </Badge>
              </div>
            </div>
            <Progress value={overallProgress} className="h-3 mb-2" />
            <p className="text-sm text-gray-600">
              {analyzingCount > 0 && analyzingCount === 1 && (
                <>Currently analyzing {analyzingSites.find((site) => site.status === "analyzing")?.title}</>
              )}
              {analyzingCount > 1 && `Currently analyzing ${analyzingCount} sites`}
            </p>
          </Card>

          {/* Site Progress Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {analyzingSites.map((site) => {
              const Icon = siteTypeIcons[site.type] || Globe

              return (
                <Card key={site.url} className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        site.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : site.status === "analyzing"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {site.status === "completed" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : site.status === "analyzing" ? (
                        <Icon className="w-5 h-5 animate-pulse" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">{site.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {site.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{site.url}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {site.status === "completed"
                          ? "Completed"
                          : site.status === "analyzing"
                            ? "Analyzing"
                            : "Pending"}
                      </span>
                      <span className="text-sm text-gray-600">{Math.round(site.progress)}%</span>
                    </div>
                    <Progress value={site.progress} className="h-2" />
                    {site.currentStep && <p className="text-xs text-gray-500 mt-1">{site.currentStep}</p>}
                  </div>

                  {site.insights && (
                    <div className="space-y-2">
                      {site.insights.map((insight, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="w-3 h-3 text-green-600" />
                          <span className="text-gray-700">{insight}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
