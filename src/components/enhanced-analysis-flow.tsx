"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, FileText, Database, Bot, Zap, AlertTriangle, TrendingUp, Search } from "lucide-react"

interface AnalysisStep {
  id: string
  name: string
  description: string
  icon: any
  estimatedTime: number
  status: "pending" | "running" | "completed" | "error"
  insights?: string[]
}

interface EnhancedAnalysisFlowProps {
  onComplete: () => void
  url?: string
}

export function EnhancedAnalysisFlow({ onComplete, url }: EnhancedAnalysisFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [insights, setInsights] = useState<string[]>([])

  const analysisSteps: AnalysisStep[] = [
    {
      id: "robots",
      name: "Checking robots.txt & AI bot permissions",
      description: "Analyzing which AI bots can access your content",
      icon: Bot,
      estimatedTime: 15,
      status: "pending",
    },
    {
      id: "structure",
      name: "Analyzing content structure & semantics",
      description: "Evaluating HTML structure and heading hierarchy",
      icon: FileText,
      estimatedTime: 25,
      status: "pending",
    },
    {
      id: "technical",
      name: "Checking technical infrastructure",
      description: "Testing HTTPS, sitemaps, and mobile-friendliness",
      icon: Zap,
      estimatedTime: 20,
      status: "pending",
    },
    {
      id: "structured",
      name: "Validating structured data markup",
      description: "Scanning for schema.org and JSON-LD markup",
      icon: Database,
      estimatedTime: 30,
      status: "pending",
    },
    {
      id: "llms",
      name: "Checking llms.txt configuration",
      description: "Looking for AI-specific configuration files",
      icon: Search,
      estimatedTime: 10,
      status: "pending",
    },
    {
      id: "analysis",
      name: "Generating insights & recommendations",
      description: "Calculating scores and preparing recommendations",
      icon: TrendingUp,
      estimatedTime: 20,
      status: "pending",
    },
  ]

  const [steps, setSteps] = useState(analysisSteps)

  useEffect(() => {
    // Start the actual API call after a brief delay to ensure component is ready
    const apiCallTimer = setTimeout(() => {
      onComplete();
    }, 1000); // 1 second delay
    
    // Show a loading animation for user experience
    const totalTime = 15000; // 15 seconds max - analyses usually complete faster
    const stepTime = totalTime / steps.length; // Time per step
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + (100 / (totalTime / 100)) // Smooth progress
      })
    }, 100) // Update every 100ms for smooth animation

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval)
          return prev
        }

        // Add insights as we progress
        const newInsights = [
          "Found robots.txt blocking 3 AI bots",
          "Missing structured data for articles", 
          "HTTPS properly configured",
          "No llms.txt file detected",
          "Heading structure needs improvement",
        ]

        if (prev < newInsights.length) {
          setInsights((current) => [...current, newInsights[prev]])
        }

        return prev + 1
      })
    }, stepTime) // Sync step changes with progress

    return () => {
      clearTimeout(apiCallTimer)
      clearInterval(interval)
      clearInterval(stepInterval)
    }
  }, [onComplete, steps.length])

  // Extract domain from URL for display
  const getDomainFromUrl = (inputUrl?: string) => {
    if (!inputUrl) return "your site";
    try {
      return new URL(inputUrl).hostname.replace(/^www\./, '');
    } catch {
      return inputUrl.replace(/^www\./, '');
    }
  };

  const domain = getDomainFromUrl(url);

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header - consistent with multi-site */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Analyzing {domain}</h2>
            <p className="text-gray-600">Running comprehensive AI discoverability analysis...</p>
          </div>

          {/* Overall Progress - consistent with multi-site */}
          <Card className="p-8 mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Overall Progress</span>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-purple-600">{Math.round(progress)}%</span>
                <Badge variant="outline">
                  Analyzing...
                </Badge>
              </div>
            </div>
            <Progress value={progress} className="h-3 mb-2" />
            <p className="text-sm text-gray-600">
              {currentStep < steps.length && `Currently ${steps[currentStep]?.name.toLowerCase()}`}
            </p>
          </Card>

        </div>
      </div>
    </div>
  )
}