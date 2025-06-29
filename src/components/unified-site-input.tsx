"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
  const [expandAnalysis, setExpandAnalysis] = useState(true)
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

    if (expandAnalysis) {
      // Discover multiple sites
      await handleDiscoverSites(formattedUrl)
    } else {
      // Analyze single site immediately
      const singleSite: DiscoveredSite = {
        url: formattedUrl,
        type: "homepage",
        title: new URL(formattedUrl).hostname,
        status: "discovered",
      }
      onAnalyze([singleSite])
    }
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
          {/* Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-600 text-white" role="banner">
              <Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1.5 sm:mr-2" aria-hidden="true" />
              <span className="text-xs sm:text-sm font-medium">AI-Powered</span>
            </div>
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-600 text-white" role="banner">
              <span className="text-xs sm:text-sm font-bold">100% FREE</span>
            </div>
            <div className="hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-purple-600 text-white" role="banner">
              <span className="text-sm font-medium">No Signup Required</span>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Free AI SEO Tool - Check Your Website's AI Visibility</h1>

          <p className="text-lg text-gray-600 mb-6 max-w-xl mx-auto">
            Test if ChatGPT, Claude & Perplexity can find your website. Get free robots.txt analysis, schema markup validation, and instant AI optimization recommendations.
          </p>

          {/* Quick Benefits - Desktop only */}
          <div className="hidden sm:flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Takes 30 seconds</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">No technical knowledge needed</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700">Get actionable fixes</span>
            </div>
          </div>
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
                        Analyze
                      </>
                    )}
                  </Button>
                </div>

                {/* Expand Analysis Checkbox */}
                <div className="flex items-center space-x-3 justify-center">
                  <Checkbox
                    id="expand-analysis"
                    checked={expandAnalysis}
                    onCheckedChange={(checked) => setExpandAnalysis(checked === true)}
                    disabled={isAnalyzing || isDiscovering}
                  />
                  <label
                    htmlFor="expand-analysis"
                    className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                  >
                    Also analyze key pages, subdomains and paths
                  </label>
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
          
          {/* Why This Matters Section */}
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

          {/* Social Proof Section */}
          {!discoveredSites.length && (
            <section className="mt-16 max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Trusted by Website Owners Everywhere</h2>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">Join thousands of people who've improved their AI visibility</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">SM</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Sarah M.</div>
                      <div className="text-xs text-gray-500">E-commerce Store Owner</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic">"I had no idea my robots.txt was blocking ChatGPT! Fixed it in 5 minutes and now people actually find my store when they ask AI for product recommendations."</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">DJ</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">David J.</div>
                      <div className="text-xs text-gray-500">Tech Blogger</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic">"This tool showed me exactly what schema markup I was missing. My articles started appearing in Claude responses within a week!"</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">MK</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Maria K.</div>
                      <div className="text-xs text-gray-500">Digital Marketer</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic">"Finally, a free tool that actually helps with AI optimization! The recommendations were spot-on and easy to implement."</p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
