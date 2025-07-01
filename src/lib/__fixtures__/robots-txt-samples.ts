/**
 * Test fixtures for various robots.txt configurations
 */

export const ROBOTS_TXT_SAMPLES = {
  // Allows all AI crawlers
  allowAll: `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://example.com/sitemap.xml`,

  // Blocks all AI crawlers
  blockAll: `User-agent: *
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: PerplexityBot
Disallow: /`,

  // Blocks only GPTBot (like some news sites)
  blockGPTOnly: `User-agent: *
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /`,

  // Mixed permissions (realistic scenario)
  mixedPermissions: `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Disallow: /private/
Allow: /

User-agent: PerplexityBot
Disallow: /`,

  // No AI-specific rules (default behavior)
  genericOnly: `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

Crawl-delay: 1
Sitemap: https://example.com/sitemap.xml`,

  // Empty robots.txt
  empty: '',

  // Malformed robots.txt
  malformed: `User-agent
Allow /
Disallow

Random text here
User-agent: GPTBot
Invalid syntax`,

  // Case-insensitive test
  mixedCase: `USER-AGENT: *
ALLOW: /

User-Agent: GPTBOT
Allow: /

user-agent: claudebot
allow: /`
};

export const EXPECTED_CRAWLER_RESULTS = {
  allowAll: {
    score: 100,
    details: 'AI crawler access: ChatGPT ✓, Claude ✓, Perplexity ✓, Bard ✓, Google ✓'
  },
  blockAll: {
    score: 0,
    details: 'AI crawler access: ChatGPT ✗, Claude ✗, Perplexity ✗, Bard ✗, Google ✗'
  },
  blockGPTOnly: {
    score: 65, // Harsh penalty: 80 base - 15 for blocking critical crawler
    details: 'AI crawler access: ChatGPT ✗, Claude ✓, Perplexity ✓, Bard ✓, Google ✓'
  }
};