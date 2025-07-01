"use client"

import { useState } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"

const faqs = [
  {
    question: "How can I check if my website is visible to ChatGPT?",
    answer: "That's exactly what our tool does! We analyze your website to see if AI systems like ChatGPT can access and understand your content. We check your robots.txt file for AI crawler permissions, validate your structured data markup, and test how well your content is organized. You'll get a score and specific recommendations to improve how ChatGPT, Claude, and other AI systems can find and reference your site."
  },
  {
    question: "What is GPTBot and should I allow it on my website?",
    answer: "GPTBot is OpenAI's official web crawler that feeds information to ChatGPT. If you block GPTBot in your robots.txt file, your content won't appear in ChatGPT responses when people ask questions about your topic. Most websites should allow GPTBot unless they have specific privacy concerns. We'll check if your robots.txt blocks GPTBot and show you exactly how to fix it."
  },
  {
    question: "Why isn't my website showing up in AI search results?",
    answer: "There are usually three main reasons: 1) Your robots.txt file blocks AI crawlers like GPTBot or ClaudeBot, 2) You're missing structured data that helps AI understand your content, or 3) Your content isn't organized in a way that AI can easily extract information. Our analysis identifies exactly which issues your site has and gives you step-by-step fixes."
  },
  {
    question: "Is this actually free?",
    answer: "Yep, completely free! No hidden costs, no signup required, no credit card needed. You can run as many analyses as you want and check multiple websites. We built this because we think everyone should be able to optimize their AI visibility without paying enterprise fees."
  },
  {
    question: "Which AI platforms will this help me with?",
    answer: "We focus on the major ones that people actually use: ChatGPT, Claude, Perplexity, Google's AI features, and Bing AI. These are the platforms where people are searching for information and getting AI-generated answers, so being visible there matters."
  },
  {
    question: "What if my site is blocking AI crawlers?",
    answer: "That's actually pretty common! Many sites accidentally block AI crawlers through their robots.txt file or other technical issues. If ChatGPT, Claude, or Perplexity can't crawl your site, you're essentially invisible when people ask AI questions about your topic. We'll show you exactly how to fix this with copy-paste code examples."
  },
  {
    question: "How is this different from regular SEO?",
    answer: "Traditional SEO is about ranking on Google search results pages. This is about being found and referenced by AI when people ask questions. It's a completely different game - AI systems care more about structured data like JSON-LD schema, clear content organization, and being able to easily extract specific information from your pages."
  },
  {
    question: "Can I check multiple websites or competitors?",
    answer: "Absolutely! You can analyze your competitors to see how their AI visibility compares to yours. Plus, there's an option to automatically discover and analyze multiple pages from your own domain - subdomains, key pages, etc. - to get a complete picture of your AI presence."
  }
]

export function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <section aria-labelledby="faq-heading" className="bg-white py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Common questions about making your website visible to ChatGPT, Claude, and AI search engines
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  onClick={() => toggleItem(index)}
                  aria-expanded={openItems.has(index)}
                  aria-controls={`faq-answer-${index}`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    {openItems.has(index) ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
                {openItems.has(index) && (
                  <div id={`faq-answer-${index}`} className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}