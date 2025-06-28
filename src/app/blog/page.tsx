import Link from "next/link";
import { ModernHeader } from "@/components/modern-header";
import { postsMeta } from "./posts-meta";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI SEO Blog – AI Visibility Tips & News",
  description: "Read the latest on AI SEO, AI visibility, and how to get your website discovered by ChatGPT, Claude, and Perplexity.",
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "https://amivisibleonai.vercel.app/blog/rss.xml", title: "AI SEO Blog RSS Feed" },
      ],
    },
  },
  openGraph: {
    title: "AI SEO Blog – AI Visibility Tips & News",
    description: "Read the latest on AI SEO, AI visibility, and how to get your website discovered by ChatGPT, Claude, and Perplexity.",
    images: ["https://amivisibleonai.vercel.app/og-image.png"],
    url: "https://amivisibleonai.vercel.app/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI SEO Blog – AI Visibility Tips & News",
    description: "Read the latest on AI SEO, AI visibility, and how to get your website discovered by ChatGPT, Claude, and Perplexity.",
    images: ["https://amivisibleonai.vercel.app/og-image.png"],
  },
};

const posts = postsMeta.sort((a, b) => (a.date < b.date ? 1 : -1));

export default function BlogIndex() {
  return (
    <>
      <ModernHeader />
      <div className="min-h-screen bg-gray-50 pb-16">
        {/* Hero Section */}
        <section className="max-w-3xl mx-auto pt-16 pb-8 px-4 text-center">
          <h1 className="text-4xl font-bold mb-3 text-gray-900">AI SEO Blog</h1>
          <p className="text-lg text-gray-600 mb-2">Tips, news, and strategies for getting found by AI in 2025</p>
        </section>
        {/* Blog Post Cards */}
        <main className="max-w-3xl mx-auto px-4">
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="block group">
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-blue-600 uppercase">AI Visibility</span>
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full ml-2">New</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:underline">{post.title}</h2>
                    <p className="text-gray-600">{post.description}</p>
                    <span className="text-xs text-gray-400 mt-2">Published: {new Date(post.date).toLocaleString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </main>
        {/* Call to Action */}
        <div className="max-w-3xl mx-auto mt-12 px-4 text-center">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Want to check your AI visibility?</h3>
            <Link href="/" className="inline-block bg-blue-600 text-white font-semibold px-6 py-2 rounded-full shadow hover:bg-blue-700 transition">Try our free tool</Link>
          </div>
        </div>
      </div>
    </>
  );
} 