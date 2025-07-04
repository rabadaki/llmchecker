/**
 * Centralized Recommendation Configuration
 * Single source of truth for all recommendation templates, impact/effort scoring
 */

export interface RecommendationTemplate {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  category: 'ai_access' | 'structured_data' | 'content_structure' | 'technical_infrastructure';
  triggers: {
    checkId: string;
    scoreThreshold: number; // Show if score is below this
  }[];
  implementation: {
    steps: string[];
    codeExample?: string;
    estimatedTime: string;
  };
}

export const RECOMMENDATION_TEMPLATES: RecommendationTemplate[] = [
  // AI Access Control - High Impact
  {
    id: 'robots_txt_missing',
    title: 'Add robots.txt with AI crawler access',
    description: 'Enable ChatGPT, Claude, and Perplexity to access your content',
    impact: 'high',
    effort: 'easy',
    category: 'ai_access',
    triggers: [{ checkId: 'robots_txt', scoreThreshold: 40 }],
    implementation: {
      steps: [
        'Create /robots.txt file in your website root',
        'Add AI crawler permissions',
        'Test with robots.txt validator'
      ],
      codeExample: `# Allow AI crawlers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: *
Allow: /`,
      estimatedTime: '15 minutes'
    }
  },
  {
    id: 'robots_txt_blocks_ai',
    title: 'Update robots.txt to allow blocked AI crawlers',
    description: 'Remove restrictions preventing AI systems from accessing your content',
    impact: 'high',
    effort: 'easy',
    category: 'ai_access',
    triggers: [{ checkId: 'robots_txt', scoreThreshold: 80 }],
    implementation: {
      steps: [
        'Review current robots.txt file',
        'Remove Disallow rules for AI crawlers',
        'Add explicit Allow rules'
      ],
      estimatedTime: '10 minutes'
    }
  },
  {
    id: 'enable_https',
    title: 'Enable HTTPS encryption',
    description: 'Secure connection required for modern AI crawlers',
    impact: 'high',
    effort: 'easy',
    category: 'ai_access',
    triggers: [{ checkId: 'https', scoreThreshold: 50 }],
    implementation: {
      steps: [
        'Get SSL certificate (Let\'s Encrypt is free)',
        'Configure web server for HTTPS',
        'Redirect HTTP to HTTPS'
      ],
      estimatedTime: '30 minutes'
    }
  },

  // Structured Data - High Impact for AI
  {
    id: 'add_faq_schema',
    title: 'Add FAQ schema for AI Q&A optimization',
    description: 'Critical for ChatGPT and Claude to understand your Q&A content',
    impact: 'high',
    effort: 'medium',
    category: 'structured_data',
    triggers: [{ checkId: 'schema_coverage', scoreThreshold: 60 }],
    implementation: {
      steps: [
        'Identify FAQ content on your site',
        'Structure questions and answers',
        'Add FAQ schema markup'
      ],
      codeExample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Your question here?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Your comprehensive answer here"
    }
  }]
}
</script>`,
      estimatedTime: '45 minutes'
    }
  },
  {
    id: 'add_howto_schema',
    title: 'Add HowTo schema for instruction content',
    description: 'AI systems prioritize step-by-step instructional content',
    impact: 'high',
    effort: 'medium',
    category: 'structured_data',
    triggers: [{ checkId: 'schema_coverage', scoreThreshold: 70 }],
    implementation: {
      steps: [
        'Identify instructional content',
        'Break down into clear steps',
        'Add HowTo schema markup'
      ],
      codeExample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to...",
  "description": "Step by step guide to...",
  "step": [{
    "@type": "HowToStep",
    "name": "Step 1",
    "text": "First, do this..."
  }]
}
</script>`,
      estimatedTime: '60 minutes'
    }
  },
  {
    id: 'fix_schema_errors',
    title: 'Fix JSON-LD syntax errors',
    description: 'Broken schema markup prevents AI understanding',
    impact: 'medium',
    effort: 'medium',
    category: 'structured_data',
    triggers: [{ checkId: 'schema_validity', scoreThreshold: 60 }],
    implementation: {
      steps: [
        'Validate schema at schema.org/validator',
        'Fix JSON syntax errors',
        'Add missing required properties'
      ],
      estimatedTime: '30 minutes'
    }
  },

  // Content Structure - Medium Impact
  {
    id: 'improve_semantic_html',
    title: 'Use semantic HTML5 elements',
    description: 'Help AI crawlers understand your content structure',
    impact: 'medium',
    effort: 'medium',
    category: 'content_structure',
    triggers: [{ checkId: 'semantic_html', scoreThreshold: 60 }],
    implementation: {
      steps: [
        'Replace generic divs with semantic elements',
        'Use main, article, section, nav, header, footer',
        'Test with accessibility tools'
      ],
      estimatedTime: '2 hours'
    }
  },
  {
    id: 'fix_heading_hierarchy',
    title: 'Fix heading structure',
    description: 'Proper H1→H2→H3 hierarchy helps AI understand content flow',
    impact: 'medium',
    effort: 'easy',
    category: 'content_structure',
    triggers: [{ checkId: 'heading_hierarchy', scoreThreshold: 70 }],
    implementation: {
      steps: [
        'Ensure single H1 per page',
        'Use logical H2→H3→H4 progression',
        'Don\'t skip heading levels'
      ],
      estimatedTime: '30 minutes'
    }
  },
  {
    id: 'enable_ssr',
    title: 'Enable server-side rendering',
    description: 'Ensure content loads without JavaScript for AI crawlers',
    impact: 'medium',
    effort: 'hard',
    category: 'content_structure',
    triggers: [{ checkId: 'ssr_content', scoreThreshold: 50 }],
    implementation: {
      steps: [
        'Implement SSR framework (Next.js, Nuxt, etc.)',
        'Move client-side content to server-side',
        'Test with JavaScript disabled'
      ],
      estimatedTime: '1-2 days'
    }
  },

  // Technical Infrastructure - Mixed Impact
  {
    id: 'create_sitemap',
    title: 'Create XML sitemap',
    description: 'Guide AI crawlers to all your important pages',
    impact: 'medium',
    effort: 'easy',
    category: 'technical_infrastructure',
    triggers: [{ checkId: 'sitemap', scoreThreshold: 50 }],
    implementation: {
      steps: [
        'Generate sitemap.xml with all pages',
        'Upload to website root',
        'Submit to search engines'
      ],
      estimatedTime: '20 minutes'
    }
  },
  {
    id: 'improve_content_clarity',
    title: 'Optimize content structure',
    description: 'Separate main content from navigation for cleaner AI extraction',
    impact: 'medium',
    effort: 'medium',
    category: 'technical_infrastructure',
    triggers: [{ checkId: 'clean_extraction', scoreThreshold: 60 }],
    implementation: {
      steps: [
        'Move main content to <main> tag',
        'Reduce navigation/ads noise',
        'Use proper semantic structure'
      ],
      estimatedTime: '1 hour'
    }
  },
  {
    id: 'add_alternative_formats',
    title: 'Add alternative content formats',
    description: 'Provide RSS, JSON feeds for easier AI content access',
    impact: 'low',
    effort: 'medium',
    category: 'technical_infrastructure',
    triggers: [{ checkId: 'alt_formats', scoreThreshold: 50 }],
    implementation: {
      steps: [
        'Create RSS feed for blog content',
        'Add JSON feed alternative',
        'Consider API endpoints'
      ],
      estimatedTime: '2 hours'
    }
  },
  {
    id: 'create_llms_txt',
    title: 'Create llms.txt file',
    description: 'Specify AI training permissions (emerging standard)',
    impact: 'low',
    effort: 'easy',
    category: 'technical_infrastructure',
    triggers: [{ checkId: 'llms_txt', scoreThreshold: 50 }],
    implementation: {
      steps: [
        'Create /llms.txt file',
        'Specify training data permissions',
        'Add contact information'
      ],
      codeExample: `# AI Training Data Permissions
# This site allows AI training on public content
User-agent: *
Allow: /

# Contact for AI training questions
Contact: amivisibleonai@pm.me`,
      estimatedTime: '10 minutes'
    }
  },

  // Performance - High Impact for Crawling
  {
    id: 'optimize_response_time',
    title: 'Optimize server response time',
    description: 'Slow sites may be skipped by AI crawlers',
    impact: 'medium',
    effort: 'hard',
    category: 'ai_access',
    triggers: [{ checkId: 'response_time', scoreThreshold: 60 }],
    implementation: {
      steps: [
        'Enable caching and compression',
        'Optimize images and assets',
        'Use CDN for faster delivery'
      ],
      estimatedTime: '4-8 hours'
    }
  }
];

/**
 * Get recommendations for a specific check result
 */
export function getRecommendationsForCheck(checkId: string, score: number): RecommendationTemplate[] {
  return RECOMMENDATION_TEMPLATES.filter(template => 
    template.triggers.some(trigger => 
      trigger.checkId === checkId && score < trigger.scoreThreshold
    )
  );
}

/**
 * Get all recommendations for analysis results
 */
export function getRecommendationsForAnalysis(categories: any[]): RecommendationTemplate[] {
  const recommendations: RecommendationTemplate[] = [];
  
  // Handle case where categories might not be an array
  if (!Array.isArray(categories)) {
    console.warn('Categories is not an array:', categories);
    return [];
  }
  
  categories.forEach(category => {
    if (category && category.checks && Array.isArray(category.checks)) {
      category.checks.forEach((check: any) => {
        if (check && check.id && typeof check.score === 'number') {
          const checkRecs = getRecommendationsForCheck(check.id, check.score);
          recommendations.push(...checkRecs);
        }
      });
    }
  });
  
  // Remove duplicates and sort by impact
  const unique = recommendations.filter((rec, index, self) => 
    index === self.findIndex(r => r.id === rec.id)
  );
  
  return sortRecommendationsByPriority(unique);
}

/**
 * Sort recommendations by priority (impact + effort)
 */
export function sortRecommendationsByPriority(recommendations: RecommendationTemplate[]): RecommendationTemplate[] {
  const priorityScore = (rec: RecommendationTemplate): number => {
    const impactScore = rec.impact === 'high' ? 3 : rec.impact === 'medium' ? 2 : 1;
    const effortScore = rec.effort === 'easy' ? 3 : rec.effort === 'medium' ? 2 : 1;
    return impactScore * 10 + effortScore; // Prioritize impact over effort
  };
  
  return recommendations.sort((a, b) => priorityScore(b) - priorityScore(a));
}

/**
 * Transform recommendations to UI format
 */
export function formatRecommendationsForUI(recommendations: RecommendationTemplate[]): Array<{
  title: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  category: string;
  description?: string;
  implementation?: any;
}> {
  return recommendations.map(rec => ({
    title: rec.title,
    impact: rec.impact,
    effort: rec.effort,
    category: rec.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: rec.description,
    implementation: rec.implementation
  }));
}