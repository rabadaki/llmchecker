"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MultiSiteDashboard } from "@/components/multi-site-dashboard"
import { ModernHeader } from "@/components/modern-header"
import { Card } from "@/components/ui/card"
import { AlertCircle, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SharedResultsData {
  id: string
  results: any[]
  originalSearchTerm: string
  createdAt: string
  expiresAt: string
}

export default function SharedResultsPage() {
  const params = useParams()
  const id = params.id as string
  
  const [data, setData] = useState<SharedResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/results/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Analysis results not found or have expired')
          } else {
            setError('Failed to load analysis results')
          }
          return
        }

        const data = await response.json()
        setData(data)
      } catch (error) {
        console.error('Failed to fetch results:', error)
        setError('Failed to load analysis results')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [id])

  const handleReset = () => {
    // Navigate back to home page for new analysis
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernHeader />
        <main className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading shared analysis results...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernHeader />
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto">
            <Card className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Analysis Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                {error || 'The shared analysis results could not be found or have expired.'}
              </p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Start New Analysis
                </Button>
              </Link>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const daysUntilExpiry = Math.ceil(
    (new Date(data.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader />
      
      {/* Shared Results Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  New Analysis
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Shared {formatDate(data.createdAt)}</span>
                <span className="text-gray-400">•</span>
                <span>Expires in {daysUntilExpiry} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main>
        <MultiSiteDashboard 
          results={data.results} 
          originalSearchTerm={data.originalSearchTerm}
          onReset={handleReset}
          isSharedView={true}
        />
      </main>
    </div>
  )
}