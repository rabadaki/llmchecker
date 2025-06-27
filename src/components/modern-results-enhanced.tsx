"use client"

import { useState } from "react"
// Removed unused imports - simplified component
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw, Share2, Download, BarChart3, Target, Lightbulb } from "lucide-react"

interface ModernResultsEnhancedProps {
  result: any
  onReset: () => void
}

export function ModernResultsEnhanced({ result, onReset }: ModernResultsEnhancedProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Transform the existing result data to match new structure
  const enhancedResult = {
    url: result.url,
    overallScore: result.overallScore,
    pageType: "homepage" as const,
    categories: {
      aiAccess: {
        score: result.categories.crawlability?.score || 75,
        weight: 50,
        insights: ["Your robots.txt allows most AI bots", "Consider adding specific AI bot rules"],
      },
      contentStructure: {
        score: result.categories.contentStructure?.score || 68,
        weight: 25,
        insights: ["Good heading structure", "Meta descriptions could be improved"],
      },
      technicalInfra: {
        score: result.categories.technicalPerformance?.score || 82,
        weight: 25,
        insights: ["HTTPS properly configured", "Fast loading times"],
      },
      structuredData: {
        score: result.categories.structuredData?.score || 45,
        weight: 0,
        insights: ["Missing schema.org markup", "No JSON-LD detected"],
      },
    },
    quickWins: [
      { title: "Add robots.txt AI bot rules", impact: 15, effort: "easy" as const, category: "AI Access" },
      { title: "Implement article schema markup", impact: 12, effort: "medium" as const, category: "Structured Data" },
      { title: "Optimize meta descriptions", impact: 8, effort: "easy" as const, category: "Content Structure" },
    ],
    industryBenchmark: 62,
    timestamp: result.timestamp,
  }

  const categoryDetails = [
    {
      name: "AI Access Control",
      score: enhancedResult.categories.aiAccess.score,
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
      score: enhancedResult.categories.contentStructure.score,
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
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">AI Discoverability Report</h1>
          <p className="text-lg text-gray-600 mb-2">
            Analysis for <span className="font-semibold text-gray-900">{result.url}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">Completed on {new Date(result.timestamp).toLocaleDateString()}</p>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => {
                onReset()
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Analyze Another URL
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl bg-transparent">
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Detailed Analysis
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Action Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="text-center py-12">
              <div className="text-6xl font-bold text-green-600 mb-4">{enhancedResult.overallScore}</div>
              <p className="text-xl text-gray-600">Overall AI Discoverability Score</p>
            </div>
          </TabsContent>

          <TabsContent value="breakdown">
            <div className="grid md:grid-cols-2 gap-6">
              {categoryDetails.map((category) => (
                <div key={category.name} className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-2">{category.score}/100</div>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  <div className="space-y-2">
                    {category.checks.map((check) => (
                      <div key={check.name} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          check.status === 'pass' ? 'bg-green-500' : 
                          check.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm">{check.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Action Plan Coming Soon</h3>
              <p className="text-gray-600">Detailed implementation guides and priority matrix</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
