import { Metadata } from "next"
import { ModernHeader } from "@/components/modern-header"
import { Card } from "@/components/ui/card"
import { CheckCircle, Bot, Search, Shield, Code, Globe, Zap, ArrowRight, AlertTriangle, XCircle, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
  title: "How It Works - AI Visibility Checker | Am I Visible on AI",
  description: "Learn exactly how our AI visibility checker works. We analyze robots.txt, structured data, and content accessibility for ChatGPT, Claude, and Perplexity bots.",
  keywords: "how to check AI visibility, AI crawler detection, robots.txt checker, structured data analyzer, AI SEO tool",
  openGraph: {
    title: "How Our AI Visibility Checker Works",
    description: "Deep dive into the technical process of checking if your site is visible to ChatGPT, Claude, and Perplexity",
    url: "https://amivisibleonai.vercel.app/how-it-works",
    type: "article"
  }
}

export default function HowItWorksPage() {
  const analysisSteps = [
    {
      icon: Bot,
      title: "Step 1: AI Crawler Access Check",
      description: "We scan your robots.txt to see if AI bots can access your site",
      problem: "Many websites inadvertently block AI crawlers through restrictive robots.txt configurations",
      solution: "We check if your robots.txt allows these documented AI crawlers:",
      technicalDetails: [
        "GPTBot (ChatGPT) - OpenAI's official web crawler for training data",
        "ClaudeBot (Anthropic) - Anthropic's crawler for constitutional AI training", 
        "PerplexityBot - Real-time search and citation crawler",
        "Google-Extended (Bard) - Google's AI training data crawler",
        "CCBot (Common Crawl) - Open dataset used by multiple AI systems"
      ],
      codeExample: `# ✅ AI-friendly robots.txt configuration
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot  
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /`,
      score: "Proper AI crawler access is fundamental to AI visibility",
      source: "Based on official OpenAI, Anthropic, and Perplexity documentation"
    },
    {
      icon: Shield,
      title: "Step 2: Technical Accessibility Audit",
      description: "We verify your site meets the technical requirements AI crawlers need",
      problem: "Technical barriers can prevent AI systems from accessing and indexing content",
      solution: "We test essential technical requirements for AI crawler compatibility:",
      technicalDetails: [
        "HTTPS/SSL certificate validation (industry standard for secure crawling)",
        "Response time optimization (faster sites get crawled more frequently)",
        "HTTP status code validation (200 OK responses ensure successful crawling)",
        "Redirect chain analysis (excessive redirects can break crawler paths)",
        "Content accessibility without JavaScript (most AI crawlers don't execute JS)"
      ],
      codeExample: `# Technical requirements we verify:
✅ HTTPS enabled (SSL certificate valid)
✅ Response time optimized
✅ HTTP 200 status codes
✅ Clean redirect chains
✅ Content accessible without JavaScript`,
      score: "Technical issues can significantly impact AI crawler success rates",
      source: "Based on web crawling best practices and AI company guidelines"
    },
    {
      icon: Code,
      title: "Step 3: Structured Data Analysis", 
      description: "We analyze your schema markup to see how well AI can understand your content",
      problem: "Unstructured content is harder for AI systems to parse and cite accurately",
      solution: "We scan for schema.org structured data that enhances AI comprehension:",
      technicalDetails: [
        "JSON-LD format detection (W3C recommended structured data format)",
        "FAQ schema for Q&A content (helps AI systems answer user questions)",
        "Article schema for blog posts (enables proper content attribution)",
        "Product schema for e-commerce (powers AI shopping recommendations)",
        "Organization/LocalBusiness schema (establishes entity recognition)"
      ],
      codeExample: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question", 
    "name": "How do I check AI visibility?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Use an AI visibility checker to analyze your robots.txt, structured data, and technical configuration for AI crawler compatibility."
    }
  }]
}`,
      score: "Rich structured data significantly improves AI content understanding",
      source: "Schema.org standards and Google's structured data guidelines"
    },
    {
      icon: Search,
      title: "Step 4: Content Structure Evaluation",
      description: "We evaluate how AI-friendly your content organization is",
      problem: "Poorly structured content is difficult for AI systems to extract and cite",
      solution: "We analyze your content structure for optimal AI readability:",
      technicalDetails: [
        "Semantic HTML usage (proper H1-H6 hierarchy, lists, sections)",
        "Clear content hierarchy and logical information flow",
        "Meta descriptions and title tag optimization for context",
        "Alt text for images (provides context for visual content)",
        "Internal linking structure (helps AI understand content relationships)"
      ],
      codeExample: `<!-- ✅ AI-optimized content structure -->
<article>
  <h1>Main Topic Title</h1>
  <section>
    <h2>Specific Question or Subtopic</h2>
    <p>Clear, direct answer with supporting details...</p>
    <ul>
      <li>Structured list of key points</li>
      <li>Factual information with context</li>
    </ul>
  </section>
</article>`,
      score: "Well-structured content improves AI citation accuracy",
      source: "Web accessibility standards and AI content processing research"
    },
    {
      icon: Globe,
      title: "Step 5: Discoverability Assessment",
      description: "We check how easily AI systems can find and index your content",
      problem: "Content that's hard to discover won't be included in AI knowledge bases",
      solution: "We verify these discoverability factors:",
      technicalDetails: [
        "XML sitemap presence and validity (provides content roadmap for crawlers)",
        "URL structure and canonicalization (prevents duplicate content issues)",
        "Alternative content formats like RSS/JSON feeds (multiple access points)",
        "LLMs.txt file detection (emerging standard for AI crawler permissions)",
        "Content freshness indicators (helps AI identify up-to-date information)"
      ],
      codeExample: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yoursite.com/important-page</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`,
      score: "Strong discoverability increases AI indexing likelihood",
      source: "XML sitemap protocol and search engine optimization standards"
    },
    {
      icon: Zap,
      title: "Step 6: AI Visibility Score Calculation",
      description: "We combine all factors into a single, actionable score with prioritized recommendations",
      problem: "Without clear priorities, it's difficult to know which optimizations will have the most impact",
      solution: "Our scoring system weighs factors based on their impact on AI visibility:",
      technicalDetails: [
        "AI Access Control (40% weight) - Foundation for any AI visibility",
        "Structured Data Quality (30% weight) - Critical for AI content understanding",
        "Content Structure (20% weight) - Important for accurate citations", 
        "Technical Performance (10% weight) - Supporting infrastructure",
        "Bonus points for advanced optimizations (up to +10 points)"
      ],
      codeExample: `# Example Score Calculation
AI Access: 85/100 (× 40%) = 34.0 points
Structured Data: 70/100 (× 30%) = 21.0 points  
Content Structure: 90/100 (× 20%) = 18.0 points
Technical: 95/100 (× 10%) = 9.5 points
Bonus Features: +5.0 points
Final Score: 87.5/100`,
      score: "Comprehensive scoring helps prioritize optimization efforts",
      source: "Weighted scoring methodology based on AI system requirements"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader />
      
      <div className="container mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How Our AI Visibility Analysis Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We perform a comprehensive 6-step technical analysis to determine if your website is properly configured for AI discovery and citation by ChatGPT, Claude, Perplexity, and other AI systems.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-blue-800 font-medium">
              💡 <strong>The Challenge:</strong> Many websites inadvertently block AI crawlers or lack the structured data AI systems need to understand their content. Our tool identifies these issues and provides specific solutions.
            </p>
          </div>
        </div>



        {/* The Analysis Process */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Our 6-Step Analysis Process</h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Each step checks a critical component of AI visibility. We provide specific, actionable recommendations based on current AI system requirements and web standards.
          </p>
          
          <div className="space-y-12">
            {analysisSteps.map((step, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="p-8">
                  {/* Step Header */}
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-lg text-gray-600 mb-4">{step.description}</p>
                      
                      {/* Problem/Solution */}
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="font-semibold text-red-800">Common Issue</span>
                          </div>
                          <p className="text-red-700 text-sm">{step.problem}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-800">Our Analysis</span>
                          </div>
                          <p className="text-green-700 text-sm">{step.solution}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">What We Check:</h4>
                      <div className="space-y-2">
                        {step.technicalDetails.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Technical Example:</h4>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-green-400 whitespace-pre-wrap">
                          {step.codeExample}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Score Impact & Source */}
                  <div className="mt-6 space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-800">Analysis Impact:</span>
                        <span className="text-blue-700">{step.score}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600 font-medium">Source:</span>
                        <span className="text-xs text-gray-600">{step.source}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Research-Based Benefits */}
        <div className="mb-16">
          <Card className="p-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why AI Visibility Matters</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Growing AI Usage</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">AI assistants are increasingly used for research and recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Businesses report increased referral traffic from AI citations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Structured content receives more accurate AI citations</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Technical Requirements</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">AI crawlers require explicit access permissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Structured data improves content comprehension</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Technical optimization affects crawler success rates</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Analyze Your AI Visibility</h2>
          <p className="text-xl mb-8 opacity-90">
            Get your comprehensive 6-step analysis with specific, actionable recommendations
          </p>
          <a 
            href="/"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Check Your Site Now - Free Analysis
            <ArrowRight className="w-5 h-5" />
          </a>
          <p className="text-sm opacity-75 mt-4">No signup required • Instant results • Evidence-based recommendations</p>
        </div>
      </div>

      {/* Add at the bottom of the page, before closing tags */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <strong>Last updated:</strong> July 1, 2025<br />
        <strong>Author:</strong> Alex Kim, AI SEO Specialist
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Check Your Website's AI Visibility",
        "description": "Step-by-step process for analyzing and improving your site's AI visibility for ChatGPT, Claude, and Perplexity.",
        "datePublished": "2024-06-01",
        "dateModified": "2025-07-01",
        "author": {
          "@type": "Person",
          "name": "Alex Kim"
        },
        "step": [
          {
            "@type": "HowToStep",
            "name": "Check AI Crawler Access",
            "text": "Scan your robots.txt to ensure GPTBot, ClaudeBot, and PerplexityBot are allowed."
          },
          {
            "@type": "HowToStep",
            "name": "Audit Technical Accessibility",
            "text": "Verify HTTPS, fast response times, and content accessibility without JavaScript."
          },
          {
            "@type": "HowToStep",
            "name": "Analyze Structured Data",
            "text": "Add and validate FAQ, Article, and Product schema markup."
          },
          {
            "@type": "HowToStep",
            "name": "Evaluate Content Structure",
            "text": "Use clear headings, lists, and logical organization for easy AI extraction."
          },
          {
            "@type": "HowToStep",
            "name": "Check Discoverability",
            "text": "Ensure you have a valid sitemap, canonical URLs, and alternative content formats."
          },
          {
            "@type": "HowToStep",
            "name": "Calculate AI Visibility Score",
            "text": "Combine all factors to get your AI visibility score and prioritized recommendations."
          }
        ]
      }`}} />
    </div>
  )
} 