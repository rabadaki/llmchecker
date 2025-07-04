import Head from 'next/head'

interface SchemaMarkupProps {
  data: Record<string, any>
}

export function SchemaMarkup({ data }: SchemaMarkupProps) {
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data)
        }}
      />
    </Head>
  )
}

// Example usage in a blog post:
// <SchemaMarkup data={{
//   "@context": "https://schema.org",
//   "@type": "Article",
//   "headline": "Your title",
//   ...
// }} />