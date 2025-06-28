"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Share2, Download, Target, Lightbulb, CheckCircle, AlertTriangle } from "lucide-react"
import { ArrowRightIcon } from "@radix-ui/react-icons"

interface ModernResultsEnhancedProps {
  result: any
  onReset: () => void
}

export function ModernResultsEnhanced({ result, onReset }: ModernResultsEnhancedProps) {

  // Extract page type from URL for consistent display with multi-site
  const getPageType = (url: string) => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('/docs')) return 'Documentation';
    if (urlLower.includes('/blog')) return 'Blog';
    if (urlLower.includes('/api')) return 'API Reference';
    if (urlLower.includes('/support')) return 'Support';
    if (urlLower.includes('/shop') || urlLower.includes('/store')) return 'Store';
    return 'Homepage';
  };

  // Helper to get structured data bonus (consistent with multi-site)
  const getStructuredDataScore = () => {
    const structuredDataScore = result.categories?.structuredData?.score || 0;
    if (structuredDataScore >= 70) {
      return Math.round((structuredDataScore - 50) / 2);
    }
    return 0;
  };

  // Transform the existing result data to match multi-site structure
  const siteResult = {
    url: result.url,
    type: getPageType(result.url),
    title: new URL(result.url).hostname.replace(/^www\./, ''),
    overallScore: result.overallScore,
    categories: {
      aiAccess: result.categories?.crawlability?.score || 0,
      contentStructure: result.categories?.contentStructure?.score || 0,
      technicalInfra: result.categories?.technicalPerformance?.score || 0,
      structuredData: result.categories?.structuredData?.score || 0,
    },
    insights: [],
    recommendations: result.recommendations?.quickWins?.map((rec: any) => ({
      title: rec.title,
      impact: rec.impact,
      effort: rec.effort || "medium",
      category: rec.category || "General"
    })) || []
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 65) return "text-blue-600"
    if (score >= 45) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200"
    if (score >= 65) return "bg-blue-50 border-blue-200"
    if (score >= 45) return "bg-orange-50 border-orange-200"
    return "bg-red-50 border-red-200"
  }

  const categoryDetails = [
    {
      name: "AI Access Control",
      score: siteResult.categories.aiAccess,
      weight: 50,
      description: "Controls which AI bots can access and index your content",
      potentialScore: 95,
      checks: [
        {
          name: "Robots.txt Configuration",
          status: "pass" as const,
          score: 85,
          description: "Your robots.txt file properly allows AI crawlers",
          recommendation: "Consider adding specific rules for AI bots",
          difficulty: "easy" as const,
          estimatedImpact: 5,
          implementationTime: "15 minutes",
        },
        {
          name: "AI Bot User Agents",
          status: "warning" as const,
          score: 65,
          description: "Some AI bots may be blocked by default rules",
          recommendation: "Add explicit allow rules for ChatGPT, Claude, and other AI bots",
          difficulty: "easy" as const,
          estimatedImpact: 15,
          implementationTime: "30 minutes",
        },
      ],
    },
    {
      name: "Content Structure",
      score: siteResult.categories.contentStructure,
      weight: 25,
      description: "How well your content is structured for AI understanding",
      potentialScore: 88,
      checks: [
        {
          name: "Semantic HTML",
          status: "pass" as const,
          score: 80,
          description: "Good use of semantic HTML elements",
          recommendation: "Continue using semantic markup",
          difficulty: "easy" as const,
          estimatedImpact: 3,
          implementationTime: "Ongoing",
        },
        {
          name: "Heading Hierarchy",
          status: "warning" as const,
          score: 70,
          description: "Heading structure could be improved",
          recommendation: "Ensure proper H1-H6 hierarchy throughout pages",
          difficulty: "medium" as const,
          estimatedImpact: 10,
          implementationTime: "2 hours",
        },
      ],
    },
  ]

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Header with consistent styling to multi-site */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
            Is {siteResult.title} visible on AI? Your Results
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
            Single site analysis for <span className="font-semibold">{siteResult.type}</span>
          </p>
        </div>

        {/* Key Metrics - consistent with multi-site format */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white rounded-lg border p-3 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{siteResult.overallScore}</div>
            <p className="text-xs sm:text-sm text-gray-600">Overall Score</p>
          </div>
          <div className="bg-white rounded-lg border p-3 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{siteResult.categories.aiAccess}</div>
            <p className="text-xs sm:text-sm text-gray-600">AI Access</p>
          </div>
          <div className="bg-white rounded-lg border p-3 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">{siteResult.categories.contentStructure}</div>
            <p className="text-xs sm:text-sm text-gray-600">Content Structure</p>
          </div>
          <div className="bg-white rounded-lg border p-3 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">{siteResult.categories.technicalInfra}</div>
            <p className="text-xs sm:text-sm text-gray-600">Technical</p>
          </div>
        </div>

        {/* Site Overview Table - consistent with multi-site dashboard */}
        <div className="bg-white rounded-lg border mb-6 sm:mb-8 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Site Analysis Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Site</th>
                  <th className="text-center py-3 px-4 text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="text-center py-3 px-4 text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">AI Access</th>
                  <th className="text-center py-3 px-4 text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Content</th>
                  <th className="text-center py-3 px-4 text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Technical</th>
                  <th className="text-center py-3 px-4 text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Overall Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{siteResult.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{siteResult.url}</div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {siteResult.type}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className={`inline-flex items-center justify-center w-12 h-8 rounded text-sm font-bold ${getScoreBg(siteResult.categories.aiAccess)} ${getScoreColor(siteResult.categories.aiAccess)}`}>
                      {siteResult.categories.aiAccess}
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className={`inline-flex items-center justify-center w-12 h-8 rounded text-sm font-bold ${getScoreBg(siteResult.categories.contentStructure)} ${getScoreColor(siteResult.categories.contentStructure)}`}>
                      {siteResult.categories.contentStructure}
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className={`inline-flex items-center justify-center w-12 h-8 rounded text-sm font-bold ${getScoreBg(siteResult.categories.technicalInfra)} ${getScoreColor(siteResult.categories.technicalInfra)}`}>
                      {siteResult.categories.technicalInfra}
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <div className={`inline-flex items-center justify-center w-12 h-8 rounded text-sm font-bold ${getScoreBg(siteResult.overallScore)} ${getScoreColor(siteResult.overallScore)}`}>
                        {siteResult.overallScore}
                      </div>
                      {getStructuredDataScore() > 0 && (
                        <span 
                          className="text-yellow-500 text-sm cursor-help relative group"
                          title={`Structured Data Bonus: +${getStructuredDataScore()} points`}
                        >
                          ⭐
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                            Structured Data Bonus: +{getStructuredDataScore()} points
                          </div>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights & Category Breakdown - same as multi-site */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Key Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">AI Access Control</p>
                  <p className="text-xs text-blue-700">
                    {siteResult.categories.aiAccess < 70 ? 'Needs improvement for optimal AI access' : 'Well configured for AI bot access'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-900">Structured Data</p>
                  <p className="text-xs text-orange-700">
                    {getStructuredDataScore() > 0 ? `Excellent structured data implementation (+${getStructuredDataScore()} bonus)` : 'Missing structured data markup'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Technical Infrastructure</p>
                  <p className="text-xs text-green-700">
                    {siteResult.categories.technicalInfra >= 80 ? 'Excellent technical infrastructure' : siteResult.categories.technicalInfra >= 60 ? 'Good technical foundation' : 'Technical infrastructure needs attention'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Category Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">AI Access Control</span>
                  <span className="text-sm font-semibold text-gray-900">{siteResult.categories.aiAccess}/100</span>
                </div>
                <Progress value={siteResult.categories.aiAccess} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Content Structure</span>
                  <span className="text-sm font-semibold text-gray-900">{siteResult.categories.contentStructure}/100</span>
                </div>
                <Progress value={siteResult.categories.contentStructure} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Technical Infrastructure</span>
                  <span className="text-sm font-semibold text-gray-900">{siteResult.categories.technicalInfra}/100</span>
                </div>
                <Progress value={siteResult.categories.technicalInfra} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Structured Data</span>
                  <span className="text-sm font-semibold text-gray-900">{siteResult.categories.structuredData}/100</span>
                </div>
                <Progress value={siteResult.categories.structuredData} className="h-2" />
              </div>
            </div>
          </Card>
        </div>


        {/* Recommendations Section - Direct, no tabs */}
        <Card className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-green-50">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Recommendations</h2>
              <p className="text-sm sm:text-base text-gray-600">Prioritized improvements to boost your AI discoverability</p>
            </div>
          </div>

          {/* Recommendations Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-red-600 mb-1">
                  {siteResult.recommendations.filter((r) => r.impact === "high").length}
                </div>
                <p className="text-xs sm:text-sm text-red-700">High Impact</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-1">
                  {siteResult.recommendations.filter((r) => r.effort === "easy").length}
                </div>
                <p className="text-xs sm:text-sm text-orange-700">Quick Wins</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">{siteResult.recommendations.length}</div>
                <p className="text-xs sm:text-sm text-blue-700">Total Improvements</p>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-4">
              {siteResult.recommendations.length > 0 ? (
                siteResult.recommendations
                  .sort((a, b) => {
                    const impactOrder = { high: 3, medium: 2, low: 1 };
                    const effortOrder = { easy: 3, medium: 2, hard: 1 };
                    
                    if (a.impact !== b.impact) {
                      return (impactOrder[b.impact as keyof typeof impactOrder] || 0) - (impactOrder[a.impact as keyof typeof impactOrder] || 0);
                    }
                    return (effortOrder[b.effort as keyof typeof effortOrder] || 0) - (effortOrder[a.effort as keyof typeof effortOrder] || 0);
                  })
                  .map((rec, index) => (
                    <div
                      key={`${rec.title}-${index}`}
                      className="border border-gray-200 rounded-xl p-6 hover:border-green-300 hover:bg-green-50/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                              rec.impact === "high"
                                ? "bg-red-500"
                                : rec.impact === "medium"
                                  ? "bg-orange-500"
                                  : "bg-gray-500"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                              {rec.title}
                            </h4>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className="text-xs">
                                {rec.category}
                              </Badge>
                              <Badge
                                variant={
                                  rec.impact === "high" ? "destructive" : rec.impact === "medium" ? "default" : "secondary"
                                }
                              >
                                {rec.impact.charAt(0).toUpperCase() + rec.impact.slice(1)} impact
                              </Badge>
                              <Badge variant="outline">{rec.effort.charAt(0).toUpperCase() + rec.effort.slice(1)} effort</Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700">
                                Affects: {siteResult.title}
                              </p>
                              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md w-fit">
                                <span className="text-xs text-gray-700">{siteResult.type}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <ArrowRightIcon className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Great Job!</h3>
                  <p className="text-gray-600">No specific recommendations at this time. Your site is performing well!</p>
                </div>
              )}
            </div>
        </Card>
      </div>
      
      {/* Sticky CTA buttons at bottom - same as multi-site */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" className="border-gray-300 text-gray-700 bg-transparent">
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Email Report
            </Button>
            <Button 
              onClick={() => {
                onReset()
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowRightIcon className="w-4 h-4 mr-2" />
              Analyze Another URL
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
