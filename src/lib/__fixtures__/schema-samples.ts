/**
 * Test fixtures for JSON-LD schema markup
 */

export const SCHEMA_SAMPLES = {
  // Valid FAQ schema
  faqSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is AI visibility?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI visibility refers to how easily AI systems can find and understand your content."
      }
    },
    {
      "@type": "Question", 
      "name": "How do I improve my AI visibility?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can improve AI visibility by optimizing your robots.txt, adding structured data, and improving content structure."
      }
    }
  ]
}
</script>`,

  // Valid HowTo schema
  howToSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to optimize for AI crawlers",
  "description": "Step-by-step guide to improve AI discoverability",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Check robots.txt",
      "text": "Ensure AI crawlers are not blocked"
    },
    {
      "@type": "HowToStep", 
      "name": "Add structured data",
      "text": "Implement JSON-LD markup"
    }
  ]
}
</script>`,

  // Valid Article schema
  articleSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Complete Guide to AI SEO",
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "datePublished": "2024-01-01",
  "dateModified": "2024-01-15",
  "image": "https://example.com/image.jpg",
  "description": "Learn how to optimize your website for AI systems"
}
</script>`,

  // Multiple schemas
  multipleSchemas: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AI Visibility Checker",
  "url": "https://example.com"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AI Visibility Tool",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>`,

  // Invalid JSON syntax
  invalidJson: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Missing closing quote
  "author": {
    "@type": "Person"
    "name": "John Doe"
  }
}
</script>`,

  // Missing required fields
  incompleteSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage"
}
</script>`,

  // No schema markup
  noSchema: '<div>Regular HTML content with no schema</div>',

  // FAQ content without schema (should be detected)
  faqContentNoSchema: `
    <h1>Frequently Asked Questions</h1>
    <h2>What is AI visibility?</h2>
    <p>AI visibility refers to how easily AI systems can find your content.</p>
    <h2>How do I improve my ranking?</h2>
    <p>You can improve by optimizing robots.txt and adding structured data.</p>
  `
};

export const EXPECTED_SCHEMA_RESULTS = {
  faqSchema: {
    score: 25, // Conservative scoring - FAQ gets base points only
    hasValidFAQ: true,
    schemaCount: 1
  },
  multipleSchemas: {
    score: 35, // Conservative scoring with small diversity bonus
    schemaCount: 2,
    diversityBonus: true
  },
  invalidJson: {
    score: 0, // No score for invalid JSON
    schemaCount: 0
  },
  faqContentNoSchema: {
    score: 0, // No points without proper schema implementation
    hasValidFAQ: false,
    hasFAQContent: true
  }
};