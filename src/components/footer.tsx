import { Bot, Mail, Github, Twitter } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Am I Visible on AI?</span>
            </div>
            <p className="text-sm text-gray-600">
              Free AI visibility tool to check if ChatGPT, Claude, and Perplexity can find your website.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
                  Analyze Your Site
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="text-sm text-gray-600 hover:text-gray-900">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/blog" className="text-sm text-gray-600 hover:text-gray-900">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="/blog/complete-guide-ai-seo-2025" className="text-sm text-gray-600 hover:text-gray-900">
                  AI Visibility Guide
                </a>
              </li>
              <li>
                <a href="/blog/why-ai-visibility-matters-2025" className="text-sm text-gray-600 hover:text-gray-900">
                  Why AI Visibility Matters
                </a>
              </li>
              <li>
                <a href="/blog/ai-content-myths-2025" className="text-sm text-gray-600 hover:text-gray-900">
                  AI Content Myths
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:amivisibleonai@pm.me" 
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  amivisibleonai@pm.me
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © {currentYear} Am I Visible on AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </a>
              <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}