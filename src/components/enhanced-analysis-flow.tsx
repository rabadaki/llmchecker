"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, FileText, Database, Bot, Zap, AlertTriangle, TrendingUp, Search } from "lucide-react"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"

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
}

export function EnhancedAnalysisFlow({ onComplete }: EnhancedAnalysisFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [insights, setInsights] = useState<string[]>([])
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes

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
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 1000)
          return 100
        }
        return prev + 1
      })
    }, 120) // 2 minutes total

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
    }, 20000) // 20 seconds per step

    const timeInterval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
      clearInterval(timeInterval)
    }
  }, [onComplete, steps.length])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-white animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Analyzing Your Website</h2>
        <p className="text-gray-600">Running comprehensive AI discoverability analysis...</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Progress */}
        <div className="lg:col-span-2">
          <Card className="p-8">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Analysis Progress</span>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</span>
                  <Badge variant="outline" className="text-sm">
                    {formatTime(timeRemaining)} remaining
                  </Badge>
                </div>
              </div>
              <Progress value={progress} className="h-3 mb-2" />
              <p className="text-sm text-gray-600">
                Step {Math.min(currentStep + 1, steps.length)} of {steps.length}
              </p>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isCompleted = index < currentStep
                const isCurrent = index === currentStep
                const isPending = index > currentStep

                return (
                  <div key={step.id} className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-100 text-green-600"
                          : isCurrent
                            ? "bg-blue-100 text-blue-600 scale-110"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isCurrent ? (
                        <Icon className="w-5 h-5 animate-pulse" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`font-medium transition-colors duration-300 ${
                          isCompleted ? "text-green-600" : isCurrent ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {step.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      {isCurrent && (
                        <div className="flex items-center mt-2">
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                            <div
                              className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 ml-2">Processing...</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{step.estimatedTime}s</div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Live Insights */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Insights</h3>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg animate-in slide-in-from-right duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{insight}</p>
                </div>
              ))}
              {insights.length === 0 && (
                <p className="text-sm text-gray-500 italic">Insights will appear as analysis progresses...</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
