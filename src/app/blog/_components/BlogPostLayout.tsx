import { ModernHeader } from "@/components/modern-header";

interface BlogPostMeta {
  title: string;
  description: string;
  date: string;
  image?: string;
  url?: string;
  dateModified?: string;
}

interface BlogPostLayoutProps {
  children: React.ReactNode;
  meta: BlogPostMeta;
}

export default function BlogPostLayout({ children, meta }: BlogPostLayoutProps) {
  const published = new Date(meta.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const updated = meta.dateModified
    ? new Date(meta.dateModified).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;
  return (
    <>
      {/* Article schema for SEO/AI visibility */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": meta.title,
            "description": meta.description,
            "datePublished": meta.date,
            ...(meta.dateModified && { "dateModified": meta.dateModified }),
            "author": {
              "@type": "Organization",
              "name": "Am I Visible on AI"
            },
            "image": meta.image || "/og-image.png",
            "mainEntityOfPage": meta.url || "https://amivisibleonai.vercel.app/blog"
          })
        }}
      />
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-6xl mx-auto py-12 px-6">
          {/* Article Header */}
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">AI Visibility</span>
              <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">New</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{meta.title}</h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">{meta.description}</p>
            <div className="text-sm text-gray-500">
              Published {published}
              {updated && (
                <>
                  <span className="mx-2">&bull;</span>
                  Last updated: {updated}
                </>
              )}
            </div>
          </header>

          {/* Divider */}
          <div className="max-w-4xl mx-auto mb-12">
            <hr className="border-t border-gray-300" />
          </div>

          {/* Article Content */}
          <article>
            <div className="prose prose-lg prose-gray max-w-none mx-auto">
              {children}
            </div>
          </article>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to check your AI visibility?</h3>
              <p className="text-gray-600 mb-6">See if ChatGPT, Claude, and Perplexity can find your website with our free analysis tool.</p>
              <a 
                href="/" 
                className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200"
              >
                Try our free AI visibility checker
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
} 