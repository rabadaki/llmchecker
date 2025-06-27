"use client"

import { useEffect } from "react"

interface ScrollToResultsProps {
  shouldScroll: boolean
}

export function ScrollToResults({ shouldScroll }: ScrollToResultsProps) {
  useEffect(() => {
    if (shouldScroll) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        const resultsElement = document.getElementById("analysis-results")
        if (resultsElement) {
          resultsElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      }, 100)
    }
  }, [shouldScroll])

  return null
}
