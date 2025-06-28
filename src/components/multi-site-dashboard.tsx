"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Globe,
  FileText,
  Code,
  ShoppingCart,
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Share2,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { ArrowRightIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons"
import Head from "next/head"

interface SiteResult {
  url: string
  type: "homepage" | "docs" | "blog" | "api" | "shop" | "about" | "pricing"
  title: string
  overallScore: number
  categories: {
    aiAccess: number
    contentStructure: number
    technicalInfra: number
    structuredData: number
  }
  insights: string[]
  recommendations: Array<{
    title: string
    impact: "high" | "medium" | "low"
    effort: "easy" | "medium" | "hard"
    category: string
  }>
}

interface MultiSiteDashboardProps {
  results: SiteResult[]
  originalSearchTerm?: string
  onReset: () => void
  isSharedView?: boolean
  shareUrl?: string
}

export function MultiSiteDashboard({ results, originalSearchTerm, onReset, isSharedView = false, shareUrl }: MultiSiteDashboardProps) {
  const [viewMode, setViewMode] = React.useState<'grouped' | 'by-page'>('grouped');
  const [expandedPages, setExpandedPages] = React.useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = React.useState<'desc' | 'asc'>('desc'); // desc = high to low, asc = low to high

  const togglePageExpansion = (pageUrl: string) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageUrl)) {
      newExpanded.delete(pageUrl);
    } else {
      newExpanded.add(pageUrl);
    }
    setExpandedPages(newExpanded);
  };
  
  const siteTypeIcons = {
    homepage: Globe,
    docs: FileText,
    blog: FileText,
    api: Code,
    shop: ShoppingCart,
    about: FileText,
    pricing: FileText,
  }


  // Extract main website name from original search term or first result
  const getMainWebsite = () => {
    if (originalSearchTerm) {
      try {
        const url = new URL(originalSearchTerm);
        return url.hostname.replace(/^www\./, '');
      } catch {
        // If originalSearchTerm doesn't have protocol, it might be just a domain
        return originalSearchTerm.replace(/^www\./, '');
      }
    }
    
    if (results.length === 0) return 'Website';
    try {
      const url = new URL(results[0].url);
      return url.hostname.replace(/^www\./, '');
    } catch {
      return 'Website';
    }
  };

  const averageScore = Math.round(results.reduce((sum, site) => sum + (site.overallScore || 0), 0) / results.length)
  const bestPerforming = results.reduce((best, site) => ((site.overallScore || 0) > (best.overallScore || 0) ? site : best))
  const worstPerforming = results.reduce((worst, site) => ((site.overallScore || 0) < (worst.overallScore || 0) ? site : worst))

  const categoryAverages = {
    aiAccess: Math.round(results.reduce((sum, site) => sum + site.categories.aiAccess, 0) / results.length),
    contentStructure: Math.round(
      results.reduce((sum, site) => sum + site.categories.contentStructure, 0) / results.length,
    ),
    technicalInfra: Math.round(results.reduce((sum, site) => sum + site.categories.technicalInfra, 0) / results.length),
  }

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

  // Group common recommendations across sites
  const groupedRecommendations = (() => {
    const recommendationMap = new Map<string, {
      title: string;
      impact: "high" | "medium" | "low";
      effort: "easy" | "medium" | "hard";
      category: string;
      sites: Array<{
        siteName: string;
        siteUrl: string;
        siteType: "homepage" | "docs" | "blog" | "api" | "shop" | "about" | "pricing";
        siteIndex: number;
      }>;
    }>();

    // Collect all recommendations and group by title
    results.forEach((site, siteIndex) => {
      site.recommendations.forEach((rec) => {
        const key = rec.title; // Group by recommendation title
        
        if (recommendationMap.has(key)) {
          // Add this site to existing recommendation
          recommendationMap.get(key)!.sites.push({
            siteName: site.title,
            siteUrl: site.url,
            siteType: site.type,
            siteIndex,
          });
        } else {
          // Create new recommendation entry
          recommendationMap.set(key, {
            title: rec.title,
            impact: rec.impact,
            effort: rec.effort,
            category: rec.category,
            sites: [{
              siteName: site.title,
              siteUrl: site.url,
              siteType: site.type,
              siteIndex,
            }],
          });
        }
      });
    });

    // Convert to array and sort by impact (respecting sort order)
    return Array.from(recommendationMap.values()).sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      const effortOrder = { easy: 3, medium: 2, hard: 1 };

      if (a.impact !== b.impact) {
        const diff = (impactOrder[b.impact as keyof typeof impactOrder] || 0) -
                    (impactOrder[a.impact as keyof typeof impactOrder] || 0);
        return sortOrder === 'desc' ? diff : -diff;
      }
      
      // If same impact, prioritize recommendations affecting more sites
      if (a.sites.length !== b.sites.length) {
        const diff = b.sites.length - a.sites.length;
        return sortOrder === 'desc' ? diff : -diff;
      }
      
      const effortDiff = (effortOrder[b.effort] || 0) - (effortOrder[a.effort] || 0);
      return sortOrder === 'desc' ? effortDiff : -effortDiff;
    });
  })();

  // Keep the old format for stats calculations
  const allRecommendations = results
    .flatMap((site, siteIndex) =>
      site.recommendations.map((rec) => ({
        ...rec,
        siteName: site.title,
        siteUrl: site.url,
        siteType: site.type,
        siteIndex,
      })),
    )

  // Generate by-page view: group recommendations by site
  const byPageRecommendations = results
    .filter(site => site.recommendations && site.recommendations.length > 0)
    .sort((a, b) => {
      const diff = b.overallScore - a.overallScore;
      return sortOrder === 'desc' ? diff : -diff; // Sort by score based on sort order
    })
    .map((site, index) => ({
      siteName: site.title,
      siteUrl: site.url,
      siteType: site.type,
      overallScore: site.overallScore,
      uniqueKey: `${site.url}-${index}`, // Add unique key to prevent duplicates
      recommendations: site.recommendations.sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        const effortOrder = { easy: 3, medium: 2, hard: 1 };
        
        if (a.impact !== b.impact) {
          const diff = (impactOrder[b.impact as keyof typeof impactOrder] || 0) - 
                      (impactOrder[a.impact as keyof typeof impactOrder] || 0);
          return sortOrder === 'desc' ? diff : -diff;
        }
        const effortDiff = (effortOrder[b.effort] || 0) - (effortOrder[a.effort] || 0);
        return sortOrder === 'desc' ? effortDiff : -effortDiff;
      })
    }));

  const handleShare = async () => {
    const urlToShare = shareUrl || window.location.href
    console.log('🔗 Sharing URL:', urlToShare)
    console.log('📊 ShareUrl state:', shareUrl)
    
    if (navigator.share) {
      navigator.share({
        title: "Multi-Site LLM Discoverability Analysis",
        text: `Analysis of ${results.length} sites with average score of ${averageScore}/100`,
        url: urlToShare,
      })
    } else {
      try {
        await navigator.clipboard.writeText(urlToShare)
        console.log('✅ Link copied to clipboard:', urlToShare)
        // You could add a toast notification here
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error('❌ Failed to copy link:', error)
      }
    }
  }

  const handleExport = () => {
    console.log("Exporting multi-site report...")
  }

  const handleEmail = () => {
    const subject = encodeURIComponent("Multi-Site LLM Discoverability Analysis")
    const body = encodeURIComponent(
      `Multi-site analysis complete! Average score: ${averageScore}/100 across ${results.length} sites.`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  // Helper to get structured data bonus (only shows bonus for high scores)
  const getStructuredDataScore = (site) => {
    let structuredDataScore = 0;
    
    // Check if categories is an object with structuredData property
    if (site.categories && typeof site.categories === 'object' && 'structuredData' in site.categories) {
      structuredDataScore = site.categories.structuredData || 0;
    }
    // Fallback: if categories is an array (legacy format)
    else if (Array.isArray(site.categories)) {
      const cat = site.categories.find(cat => cat.id === 'structured_data');
      structuredDataScore = cat ? cat.score : 0;
    }
    
    // Only return a bonus if the structured data score is above 70 (indicating good implementation)
    // The bonus represents the extra value from having structured data
    if (structuredDataScore >= 70) {
      // Calculate bonus as percentage above baseline (50 is average)
      return Math.round((structuredDataScore - 50) / 2);
    }
    
    return 0;
  };

  return (
    <>
      <Head>
        <title>Multi-Site AI Visibility Dashboard – AI SEO Checker</title>
        <meta name="description" content="Compare AI visibility and SEO scores across multiple websites. See which sites are most discoverable by ChatGPT, Claude, and Perplexity." />
        <meta property="og:title" content="Multi-Site AI Visibility Dashboard – AI SEO Checker" />
        <meta property="og:description" content="Compare AI visibility and SEO scores across multiple websites. See which sites are most discoverable by ChatGPT, Claude, and Perplexity." />
        <meta property="og:image" content="https://amivisibleonai.vercel.app/og-image.png" />
        <meta property="og:url" content="https://amivisibleonai.vercel.app/dashboard" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Multi-Site AI Visibility Dashboard – AI SEO Checker" />
        <meta name="twitter:description" content="Compare AI visibility and SEO scores across multiple websites. See which sites are most discoverable by ChatGPT, Claude, and Perplexity." />
        <meta name="twitter:image" content="https://amivisibleonai.vercel.app/og-image.png" />
      </Head>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
          {/* Header with analyzed sites info */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
              Is {getMainWebsite()} visible on AI? Your Results
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">Comprehensive AI discoverability analysis across {results.length} sites</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
            <Card className="p-3 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{averageScore}</div>
              <p className="text-xs sm:text-sm text-gray-600">Average Score</p>
            </Card>
            <Card className="p-3 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">{bestPerforming.overallScore}</div>
              <p className="text-xs sm:text-sm text-gray-600">Best Performing</p>
              <p className="text-xs text-gray-500 mt-1 truncate">{bestPerforming.title}</p>
            </Card>
            <Card className="p-3 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1 sm:mb-2">{worstPerforming.overallScore}</div>
              <p className="text-xs sm:text-sm text-gray-600">Needs Attention</p>
              <p className="text-xs text-gray-500 mt-1 truncate">{worstPerforming.title}</p>
            </Card>
            <Card className="p-3 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">{groupedRecommendations.length}</div>
              <p className="text-xs sm:text-sm text-gray-600">Unique Improvements</p>
            </Card>
          </div>

          {/* Performance Matrix */}
          <Card className="p-8 mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Performance Matrix</h2>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                  <span>Poor (0-44)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
                  <span>Fair (45-64)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                  <span>Good (65-79)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                  <span>Excellent (80+)</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Site</th>
                    <th className="text-center py-3 px-4 font-semibold">AI Access Control</th>
                    <th className="text-center py-3 px-4 font-semibold">Content Structure</th>
                    <th className="text-center py-3 px-4 font-semibold">Technical Infrastructure</th>
                    <th className="text-center py-3 px-4 font-semibold">Overall Score</th>
                  </tr>
                </thead>
                <tbody>
                  {results
                    .sort((a, b) => b.overallScore - a.overallScore) // Sort by overall score, highest first
                    .map((site, index) => (
                      <tr key={`${site.url}-${index}`} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {React.createElement(siteTypeIcons[site.type] || Globe, { className: "w-4 h-4 text-gray-600" })}
                            <div>
                              <span className="font-medium text-gray-900">{site.title}</span>
                              <p className="text-xs text-gray-500">
                                {site.url}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div
                            className={`inline-flex items-center justify-center w-12 h-8 rounded text-sm font-medium ${getScoreBg(site.categories.aiAccess)} ${getScoreColor(site.categories.aiAccess)}`}
                          >
                            {site.categories.aiAccess}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div
                            className={`inline-flex items-center justify-center w-12 h-8 rounded text-sm font-medium ${getScoreBg(site.categories.contentStructure)} ${getScoreColor(site.categories.contentStructure)}`}
                          >
                            {site.categories.contentStructure}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div
                            className={`inline-flex items-center justify-center w-12 h-8 rounded text-sm font-medium ${getScoreBg(site.categories.technicalInfra)} ${getScoreColor(site.categories.technicalInfra)}`}
                          >
                            {site.categories.technicalInfra}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <div
                              className={`inline-flex items-center justify-center w-12 h-8 rounded text-sm font-bold ${getScoreBg(site.overallScore)} ${getScoreColor(site.overallScore)}`}
                            >
                              {site.overallScore}
                            </div>
                            {getStructuredDataScore(site) > 0 && (
                              <span 
                                className="text-yellow-500 text-sm cursor-help relative group"
                                title={`Structured Data Bonus: +${getStructuredDataScore(site)} points`}
                              >
                                ⭐
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                  Structured Data Bonus: +{getStructuredDataScore(site)} points
                                </div>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Insights & Category Averages */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Key Insights</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">AI Access Control Issues</p>
                    <p className="text-xs text-blue-700">
                      {results.filter((s) => s.categories?.aiAccess && s.categories.aiAccess < 70).length} sites have suboptimal AI access control
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">Structured Data Missing</p>
                    <p className="text-xs text-orange-700">
                      {results.filter((s) => getStructuredDataScore(s) < 50).length} sites lack proper structured data
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Strong Technical Infrastructure</p>
                    <p className="text-xs text-green-700">
                      {results.filter((s) => s.categories?.technicalInfra && s.categories.technicalInfra >= 80).length} sites have excellent technical infrastructure
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Category Averages</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">AI Access Control</span>
                    <span className="text-sm font-semibold text-gray-900">{categoryAverages.aiAccess}/100</span>
                  </div>
                  <Progress value={categoryAverages.aiAccess} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Content Structure</span>
                    <span className="text-sm font-semibold text-gray-900">{categoryAverages.contentStructure}/100</span>
                  </div>
                  <Progress value={categoryAverages.contentStructure} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Technical Infrastructure</span>
                    <span className="text-sm font-semibold text-gray-900">{categoryAverages.technicalInfra}/100</span>
                  </div>
                  <Progress value={categoryAverages.technicalInfra} className="h-2" />
                </div>
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-50">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Recommendations</h2>
                  <p className="text-gray-600">All improvements ranked by impact and effort across your sites</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Sort Button */}
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md transition-colors"
                  title={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
                >
                  <span>Sort:</span>
                  {sortOrder === 'desc' ? (
                    <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                  {viewMode === 'by-page' ? 'Score' : 'Impact'}
                </button>
                
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grouped')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'grouped'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    By Type
                  </button>
                  <button
                    onClick={() => setViewMode('by-page')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'by-page'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    By Page
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {groupedRecommendations.filter((r) => r.impact === "high").length}
                </div>
                <p className="text-sm text-red-700">High Impact</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {groupedRecommendations.filter((r) => r.effort === "easy").length}
                </div>
                <p className="text-sm text-orange-700">Quick Wins</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">{groupedRecommendations.length}</div>
                <p className="text-sm text-blue-700">Unique Improvements</p>
              </div>
            </div>

            {/* Conditional View Content */}
            {viewMode === 'grouped' ? (
              // Grouped by recommendation type view
              <div className="space-y-4">
                {groupedRecommendations.map((rec, index) => {
                  return (
                    <div
                      key={rec.title}
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
                            
                            {/* Show affected sites */}
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700">
                                Affects {rec.sites.length} page{rec.sites.length > 1 ? 's' : ''}:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {rec.sites.map((site, siteIndex) => {
                                  const Icon = siteTypeIcons[site.siteType] || Globe;
                                  return (
                                    <div 
                                      key={`${site.siteUrl}-${rec.title}-${siteIndex}`} 
                                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md cursor-help transition-colors relative group/badge"
                                      title={site.siteUrl}
                                    >
                                      <Icon className="w-3 h-3 text-gray-600" />
                                      <span className="text-xs text-gray-700">{site.siteName}</span>
                                      {/* Custom tooltip */}
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/badge:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                        {site.siteUrl}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <ArrowRightIcon className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // By page view
              <div className="space-y-6">
                {byPageRecommendations.map((pageData, pageIndex) => {
                  const Icon = siteTypeIcons[pageData.siteType] || Globe;
                  const isExpanded = expandedPages.has(pageData.siteUrl);
                  return (
                    <div
                      key={pageData.uniqueKey}
                      className="border border-gray-200 rounded-xl bg-white overflow-hidden"
                    >
                      {/* Page Header - Clickable */}
                      <div 
                        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => togglePageExpansion(pageData.siteUrl)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">{pageData.siteName}</h3>
                            <p className="text-sm text-gray-500">{pageData.siteUrl}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {/* Score Badge */}
                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            pageData.overallScore >= 80 ? 'bg-green-100 text-green-800' :
                            pageData.overallScore >= 65 ? 'bg-blue-100 text-blue-800' :
                            pageData.overallScore >= 45 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {pageData.overallScore}/100
                          </div>
                          
                          {/* Recommendations Count */}
                          <div className="text-sm text-gray-600">
                            {pageData.recommendations.length} recommendation{pageData.recommendations.length > 1 ? 's' : ''}
                          </div>
                          
                          {/* Expand/Collapse Icon */}
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Collapsible Recommendations Content */}
                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-gray-100">
                          <div className="space-y-3 mt-4">
                            {pageData.recommendations.map((rec, recIndex) => (
                              <div
                                key={`${pageData.siteUrl}-${rec.title}-${recIndex}`}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                    rec.impact === "high"
                                      ? "bg-red-500"
                                      : rec.impact === "medium"
                                        ? "bg-orange-500"
                                        : "bg-gray-500"
                                  }`}
                                >
                                  {recIndex + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 mb-1">{rec.title}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {rec.category}
                                    </Badge>
                                    <Badge
                                      variant={
                                        rec.impact === "high" ? "destructive" : rec.impact === "medium" ? "default" : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {rec.impact.charAt(0).toUpperCase() + rec.impact.slice(1)} impact
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {rec.effort.charAt(0).toUpperCase() + rec.effort.slice(1)} effort
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
        
        {/* Sticky CTA buttons at bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-wrap justify-center gap-3">
              {!isSharedView && (
                <Button onClick={handleShare} variant="outline" className="border-gray-300 text-gray-700 bg-transparent">
                  <Share2 className="w-4 h-4 mr-2" />
                  {shareUrl ? 'Share Results' : 'Copy Link'}
                </Button>
              )}
              <Button onClick={handleEmail} variant="outline" className="border-gray-300 text-gray-700 bg-transparent">
                <EnvelopeClosedIcon className="w-4 h-4 mr-2" />
                Email Report
              </Button>
              <Button onClick={onReset} className="bg-blue-600 hover:bg-blue-700 text-white">
                <ArrowRightIcon className="w-4 h-4 mr-2" />
                Analyze More Sites
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
