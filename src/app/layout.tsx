import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { Footer } from "@/components/footer";

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
  title: "Am I Visible on AI? Free Tool to Check Your AI Visibility | Test AI Crawlers",
  description: "Wondering 'am I visible on AI?' Find out instantly. Free tool analyzes if ChatGPT, Claude & Perplexity can access your website. Get your AI visibility score and optimization tips.",
  keywords: "am i visible on ai, AI visibility checker, am I visible to AI, AI visibility tool, free AI visibility, robots.txt checker, ChatGPT optimization, Claude search, Perplexity optimization, AI crawler analysis, schema markup checker, AI search optimization, LLM visibility, free SEO tool",
  authors: [{ name: "Am I Visible on AI" }],
  creator: "Am I Visible on AI",
  publisher: "Am I Visible on AI",
  openGraph: {
    title: "Am I Visible on AI? Free Tool to Check Your AI Visibility",
    description: "Wondering 'am I visible on AI?' Find out instantly. Free tool analyzes if ChatGPT, Claude & Perplexity can access your website with detailed optimization tips.",
    url: "https://amivisibleonai.com",
    siteName: "Am I Visible on AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Am I Visible on AI? Free AI Visibility Checker",
    description: "Wondering 'am I visible on AI?' Find out instantly. Free analysis of your ChatGPT, Claude & Perplexity visibility.",
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {GA_MEASUREMENT_ID && <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />}
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
