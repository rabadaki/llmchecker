import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Free AI SEO Tool - Check Your Website's AI Visibility | Am I Visible on AI",
  description: "Free AI SEO tool with robots.txt checker for ChatGPT, Claude & Perplexity. Test if AI can find your website. Get instant schema markup analysis & optimization tips. 100% free.",
  keywords: "AI SEO tool, free AI SEO, robots.txt checker, AI visibility, ChatGPT SEO, Claude search, Perplexity optimization, AI crawler analysis, schema markup checker, AI search optimization, LLM visibility, free SEO tool",
  authors: [{ name: "Am I Visible on AI" }],
  creator: "Am I Visible on AI",
  publisher: "Am I Visible on AI",
  openGraph: {
    title: "Free AI SEO Tool - Check Your Website's AI Visibility",
    description: "Free robots.txt checker & AI visibility analysis for ChatGPT, Claude & Perplexity. Test if AI crawlers can access your website. Get instant optimization recommendations.",
    url: "https://amivisibleonai.vercel.app",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
