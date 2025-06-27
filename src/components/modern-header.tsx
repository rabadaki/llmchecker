"use client"

import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GearIcon } from "@radix-ui/react-icons"

export function ModernHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900">Am I Visible on AI?</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              How it works
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Documentation
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
