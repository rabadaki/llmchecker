"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Globe, Zap, FileText, Code, ShoppingCart } from "lucide-react"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { OpenAI, Anthropic, Gemini, Perplexity } from "@lobehub/icons"
import { trackSuggestionClick } from "@/lib/analytics"

interface DiscoveredSite {
  url: string
  type: "homepage" | "docs" | "blog" | "api" | "shop" | "about" | "pricing"
  title: string
  status: "discovered" | "selected" | "analyzing" | "completed"
}

interface UnifiedSiteInputProps {
  onAnalyze: (sites: DiscoveredSite[]) => void
  isAnalyzing: boolean
}

export function UnifiedSiteInput({ onAnalyze, isAnalyzing }: UnifiedSiteInputProps) {
  const [url, setUrl] = useState("")
  const [discoveredSites, setDiscoveredSites] = useState<DiscoveredSite[]>([])
  const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set())
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isValidUrl, setIsValidUrl] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const siteTypeIcons = {
    homepage: Globe,
    docs: FileText,
    blog: FileText,
    api: Code,
    shop: ShoppingCart,
    about: FileText,
    pricing: FileText,
  }

  const siteTypeColors = {
    homepage: "bg-blue-100 text-blue-700",
    docs: "bg-green-100 text-green-700",
    blog: "bg-purple-100 text-purple-700",
    api: "bg-orange-100 text-orange-700",
    shop: "bg-pink-100 text-pink-700",
    about: "bg-gray-100 text-gray-700",
    pricing: "bg-yellow-100 text-yellow-700",
  }

  const validateAndFormatUrl = (input: string) => {
    let url = input.trim()

    // If no protocol, add https://
    if (!url.match(/^https?:\/\//)) {
      url = `https://${url}`
    }

    try {
      new URL(url)
      return { isValid: true, formattedUrl: url }
    } catch {
      return { isValid: false, formattedUrl: url }
    }
  }

  const handleDiscoverSites = async (baseUrl: string) => {
    setIsDiscovering(true)
    setError(null)

    try {
      const response = await fetch('/api/discover-sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputUrl: baseUrl
        }),
      })

      if (!response.ok) {
        throw new Error(`Discovery failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Transform discovered sites to match expected format
      const transformedSites: DiscoveredSite[] = result.analysisReady.map((site: any) => ({
        url: site.url,
        type: site.category,
        title: (() => {
          const urlObj = new URL(site.url);
          if (site.category === 'homepage') return 'Homepage';
          if (site.category === 'docs') return 'Documentation';
          if (site.category === 'blog') return 'Blog';
          if (site.category === 'api') return 'API Reference';
          if (site.category === 'shop') return 'Shop';
          if (site.category === 'support') return 'Support';
          
          // Fallback to path or hostname
          if (urlObj.pathname !== '/') {
            return urlObj.pathname.split('/').filter(p => p).pop() || urlObj.hostname;
          }
          return urlObj.hostname;
        })(),
        status: "discovered" as const
      }))

      setDiscoveredSites(transformedSites)
      setIsDiscovering(false)

      // Automatically proceed to analysis with all discovered sites
      onAnalyze(transformedSites)
    } catch (err) {
      console.error('Site discovery error:', err)
      setError("Failed to discover sites. Please check the URL and try again.")
      setIsDiscovering(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    const { isValid, formattedUrl } = validateAndFormatUrl(url)

    if (!isValid) {
      setIsValidUrl(false)
      return
    }

    setIsValidUrl(true)
    setError(null)

    // Always do multi-page analysis by default
    await handleDiscoverSites(formattedUrl)
  }

  const toggleSiteSelection = (url: string) => {
    const newSelected = new Set(selectedSites)
    if (newSelected.has(url)) {
      newSelected.delete(url)
    } else {
      newSelected.add(url)
    }
    setSelectedSites(newSelected)
  }

  const handleAnalyzeSelected = () => {
    const sitesToAnalyze = discoveredSites.filter((site) => selectedSites.has(site.url))
    onAnalyze(sitesToAnalyze)
  }

  const handleSuggestionClick = (suggestedUrl: string) => {
    setUrl(suggestedUrl)
    setIsValidUrl(true)
    trackSuggestionClick(suggestedUrl)
  }

  const suggestions = [
    { url: "google.com", label: "Google" },
    { url: "github.com", label: "GitHub" },
    { url: "stripe.com", label: "Stripe" },
    { url: "vercel.com", label: "Vercel" },
  ]

  return (
    <div className="bg-white">
      <div className="container mx-auto px-6 py-16">
        <header className="max-w-3xl mx-auto text-center">
          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Is Your Website Visible to ChatGPT?</h1>

          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Test if ChatGPT, Claude & Perplexity can find your website. Get instant analysis and actionable recommendations.
          </p>
        </header>

        <main className="max-w-3xl mx-auto">
          <section aria-labelledby="analyzer-heading">
            <h2 id="analyzer-heading" className="sr-only">Website AI Analysis Tool</h2>

          {/* URL Input Form */}
          <Card className="p-8 mb-6">
            <form onSubmit={handleSubmit} className={`mb-6 ${isAnalyzing || isDiscovering ? "opacity-75" : ""}`}>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder="Enter your website URL"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value)
                        setIsValidUrl(true)
                        setError(null)
                      }}
                      className={`h-14 text-base px-4 bg-white border-2 rounded-xl ${
                        !isValidUrl || error ? "border-red-400" : "border-gray-300 focus:border-blue-500"
                      }`}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    disabled={!url.trim() || isAnalyzing || isDiscovering}
                  >
                    {isDiscovering ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Discovering...
                      </>
                    ) : isAnalyzing ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                        Check My Site
                      </>
                    )}
                  </Button>
                </div>

                {!isValidUrl && <p className="text-red-500 text-sm">Please enter a valid URL</p>}
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </form>

            {/* Quick suggestions */}
            {!discoveredSites.length && (
              <div>
                <p className="text-sm text-gray-500 mb-3">Try these examples:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.url}
                      onClick={() => handleSuggestionClick(suggestion.url)}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      disabled={isAnalyzing || isDiscovering}
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          </section>

          {/* Discovered Sites Selection */}
          {discoveredSites.length > 0 && (
            <Card className="p-8 mb-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Found {discoveredSites.length} pages to analyze
                </h3>
                <p className="text-gray-600">
                  Select which pages you'd like to include in your AI visibility analysis
                </p>
              </div>

              <div className="grid gap-4 mb-6">
                {discoveredSites.map((site) => {
                  const Icon = siteTypeIcons[site.type] || Globe
                  const colorClass = siteTypeColors[site.type] || "bg-gray-100 text-gray-700"

                  return (
                    <div
                      key={site.url}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedSites.has(site.url)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleSiteSelection(site.url)}
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={selectedSites.has(site.url)}
                          onCheckedChange={() => {}}
                          className="pointer-events-none"
                        />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{site.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {site.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{site.url}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSites(new Set())}
                  disabled={selectedSites.size === 0}
                >
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSites(new Set(discoveredSites.map((s) => s.url)))}
                  disabled={selectedSites.size === discoveredSites.length}
                >
                  Select All
                </Button>
                <Button
                  onClick={handleAnalyzeSelected}
                  disabled={selectedSites.size === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Analyze {selectedSites.size} Selected {selectedSites.size === 1 ? "Site" : "Sites"}
                </Button>
              </div>
            </Card>
          )}

          {/* Why This Matters Section - Now below the tool */}
          {!discoveredSites.length && (
            <section className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Why AI Visibility Matters Right Now</h2>
                <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Millions of people are asking AI questions every day instead of Googling. If your website isn't visible to ChatGPT, Claude, and Perplexity, you're missing out on a huge audience that's looking for exactly what you offer.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-white/70 p-6 rounded-lg shadow-sm border border-white/30">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">73%</div>
                  <div className="text-sm text-gray-700 font-medium">of people now ask AI for recommendations</div>
                </div>
                <div className="bg-white/70 p-6 rounded-lg shadow-sm border border-white/30">
                  <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">5.2B</div>
                  <div className="text-sm text-gray-700 font-medium">AI searches happen monthly</div>
                </div>
                <div className="bg-white/70 p-6 rounded-lg shadow-sm border border-white/30">
                  <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">60%</div>
                  <div className="text-sm text-gray-700 font-medium">of websites aren't AI-optimized yet</div>
                </div>
              </div>
            </section>
          )}

          {/* AI Model Logos */}
          {!discoveredSites.length && (
            <section aria-labelledby="ai-models-heading" className="mt-12">
              <div className="text-center mb-8">
                <h2 id="ai-models-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Works With All Major AI Platforms</h2>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">We test your visibility across the AI platforms people actually use every day</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8">
                {/* ChatGPT */}
                <div className="flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <OpenAI size={40} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">ChatGPT</span>
                  <span className="text-xs text-gray-500">100M+ users</span>
                </div>

                {/* Claude */}
                <div className="flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Anthropic size={40} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Claude</span>
                  <span className="text-xs text-gray-500">Fastest growing</span>
                </div>

                {/* Gemini */}
                <div className="flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Gemini size={40} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Gemini</span>
                  <span className="text-xs text-gray-500">Google's AI</span>
                </div>

                {/* Perplexity */}
                <div className="flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Perplexity size={40} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Perplexity</span>
                  <span className="text-xs text-gray-500">AI search engine</span>
                </div>
              </div>
            </section>
          )}

          {/* Feature Highlights */}
          {!discoveredSites.length && (
            <section className="mt-16 max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">How We Check If AI Can Find Your Website</h2>
                <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">Three key areas that determine if ChatGPT, Claude, and Perplexity can discover and reference your content</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Can AI Crawlers Access Your Site?</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">We check if GPTBot, ClaudeBot, and PerplexityBot are blocked by your robots.txt file. Many sites accidentally block AI crawlers, making them invisible to ChatGPT and Claude.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Code className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Does AI Understand Your Content?</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">We scan for structured data like Article, FAQ, and Product schemas that help AI systems understand and extract information from your pages.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">How Can You Fix Issues?</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Get copy-paste code fixes for robots.txt, missing schema markup examples, and specific technical improvements to boost your AI visibility score.</p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
