import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://amivisibleonai.com'),
  title: "Free AI SEO Tool - Check Your Website's AI Visibility | Am I Visible on AI",
  description: "Free AI SEO tool with robots.txt checker for ChatGPT, Claude & Perplexity. Test if AI can find your website. Get instant schema markup analysis & optimization tips. 100% free.",
  keywords: "AI SEO tool, free AI SEO, robots.txt checker, AI visibility, ChatGPT SEO, Claude search, Perplexity optimization, AI crawler analysis, schema markup checker, AI search optimization, LLM visibility, free SEO tool",
  authors: [{ name: "Am I Visible on AI" }],
  creator: "Am I Visible on AI",
  publisher: "Am I Visible on AI",
  openGraph: {
    title: "Free AI SEO Tool - Check Your Website's AI Visibility",
    description: "Free robots.txt checker & AI visibility analysis for ChatGPT, Claude & Perplexity. Test if AI crawlers can access your website. Get instant optimization recommendations.",
    url: "https://amivisibleonai.com",
    siteName: "Am I Visible on AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI SEO Tool - Check Your AI Visibility",
    description: "Free AI visibility checker. Test if ChatGPT, Claude & Perplexity can find your website. Instant robots.txt analysis & optimization tips.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AI SEO Checker",
          "operatingSystem": "All",
          "applicationCategory": "SEO Tool",
          "description": "Check if your website is visible to ChatGPT, Claude, and Perplexity. Get instant AI optimization tips.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "137"
          }
        }`}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How can I check if my website is visible to ChatGPT?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "That's exactly what our tool does! We analyze your website to see if AI systems like ChatGPT can access and understand your content. We check your robots.txt file for AI crawler permissions, validate your structured data markup, and test how well your content is organized. You'll get a score and specific recommendations to improve how ChatGPT, Claude, and other AI systems can find and reference your site."
              }
            },
            {
              "@type": "Question",
              "name": "What is GPTBot and should I allow it on my website?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "GPTBot is OpenAI's official web crawler that feeds information to ChatGPT. If you block GPTBot in your robots.txt file, your content won't appear in ChatGPT responses when people ask questions about your topic. Most websites should allow GPTBot unless they have specific privacy concerns. We'll check if your robots.txt blocks GPTBot and show you exactly how to fix it."
              }
            },
            {
              "@type": "Question",
              "name": "Why isn't my website showing up in AI search results?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "There are usually three main reasons: 1) Your robots.txt file blocks AI crawlers like GPTBot or ClaudeBot, 2) You're missing structured data that helps AI understand your content, or 3) Your content isn't organized in a way that AI can easily extract information. Our analysis identifies exactly which issues your site has and gives you step-by-step fixes."
              }
            }
          ]
        }`}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{
          "@context": "https://schema.org",
          "@type": "Review",
          "itemReviewed": {
            "@type": "SoftwareApplication",
            "name": "AI SEO Checker"
          },
          "author": {
            "@type": "Person",
            "name": "Jane Doe"
          },
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "reviewBody": "Super easy to use and helped me get my site visible on ChatGPT in minutes! Highly recommend for anyone who cares about AI traffic.",
          "datePublished": "2024-06-28"
        }`}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {GA_MEASUREMENT_ID && <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />}
        {children}
      </body>
    </html>
  );
}
