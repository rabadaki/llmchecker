"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Globe, Zap, FileText, Code, ShoppingCart } from "lucide-react"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"

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
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600 text-white mb-6">
            <Zap className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">AI-Powered Analysis</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How AI-Friendly Is Your Website?</h1>

          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Get your AI discoverability score and actionable recommendations to rank better in ChatGPT, Claude, and
            other AI search results.
          </p>

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
                    className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
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

          {/* AI Model Logos */}
          {!discoveredSites.length && (
            <div className="mt-8">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimized for Leading AI Models</h3>
                <p className="text-sm text-gray-600">Ensure your website ranks well across all major AI search engines</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8">
                {/* ChatGPT */}
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" fill="#10A37F"/>
                  </svg>
                  <span className="text-xs font-medium text-gray-700">ChatGPT</span>
                </div>

                {/* Claude */}
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                    <path d="M7.307 4.537c-1.524 0-2.758 1.234-2.758 2.758v9.41c0 1.524 1.234 2.758 2.758 2.758h9.386c1.524 0 2.758-1.234 2.758-2.758v-9.41c0-1.524-1.234-2.758-2.758-2.758H7.307zM12 6.462c3.05 0 5.538 2.488 5.538 5.538 0 3.05-2.488 5.538-5.538 5.538-3.05 0-5.538-2.488-5.538-5.538 0-3.05 2.488-5.538 5.538-5.538z" fill="#D97706"/>
                    <circle cx="12" cy="12" r="3.692" fill="white"/>
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Claude</span>
                </div>

                {/* Gemini */}
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8l2 4 4-1-3 3 1 4-4-2-4 2 1-4-3-3 4 1 2-4z" fill="#4285F4"/>
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Gemini</span>
                </div>

                {/* Perplexity */}
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#6366F1" strokeWidth="2"/>
                    <path d="M8 12l2 2 4-4" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="6" fill="none" stroke="#6366F1" strokeWidth="1.5"/>
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Perplexity</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
