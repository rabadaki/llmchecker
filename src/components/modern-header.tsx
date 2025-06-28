"use client"

import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GearIcon } from "@radix-ui/react-icons"

export function ModernHeader() {
  return (
    <header className="border-b border-gray-200 bg-white" role="banner">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity cursor-pointer" aria-label="Am I Visible on AI - Home">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center" aria-hidden="true">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-semibold text-gray-900">Am I Visible on AI?</span>
            </div>
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
            <a href="#analyzer-heading" className="text-sm text-gray-600 hover:text-gray-900">
              How it works
            </a>
            <a href="#ai-models-heading" className="text-sm text-gray-600 hover:text-gray-900">
              AI Models
            </a>
            <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Analyze Site
            </a>
          </nav>

          {/* Actions - Hidden for now */}
          <div className="flex items-center space-x-4">
            {/* Authentication buttons will be added when implementing Clerk */}
          </div>
        </div>
      </div>
    </header>
  )
}
