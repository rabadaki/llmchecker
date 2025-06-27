/**
 * Scoring configuration and structure
 */

import { ScoringStructure } from '../types/analysis';

export const scoringStructure: ScoringStructure = {
  scoring_categories: [
    {
      id: 'crawlability_access',
      name: 'AI Access Control',
      weight: 50,
      icon: '🔍',
      description: 'How easily AI bots can access your content',
      checks: [
        {
          id: 'robots_txt',
          name: 'AI Bot Access',
          description: 'Robots.txt permissions for AI crawlers',
          scoring: {
            '0': {
              criteria: 'AI bots blocked or robots.txt missing',
              details: 'No access for GPTBot, ChatGPT-User, Claude-Web, etc.'
            },
            '50': {
              criteria: 'Some AI bots allowed',
              details: 'Partial access or unclear robots.txt rules'
            },
            '100': {
              criteria: 'AI bots explicitly allowed',
              details: 'Clear access granted for major AI crawlers'
            }
          }
        },
        {
          id: 'response_time',
          name: 'Site Speed',
          description: 'How quickly your site responds to requests',
          scoring: {
            '0': {
              criteria: 'Very slow response (>3 seconds)',
              details: 'AI crawlers may timeout or skip slow sites'
            },
            '50': {
              criteria: 'Moderate speed (1-3 seconds)',
              details: 'Acceptable but could be faster'
            },
            '100': {
              criteria: 'Fast response (<1 second)',
              details: 'Optimal speed for AI crawler efficiency'
            }
          }
        },
        {
          id: 'https',
          name: 'Secure Connection',
          description: 'HTTPS encryption for secure data transfer',
          scoring: {
            '0': {
              criteria: 'HTTP only',
              details: 'Insecure connection may block AI crawlers'
            },
            '100': {
              criteria: 'HTTPS enabled',
              details: 'Secure connection meets modern standards'
            }
          }
        }
      ]
    },
    {
      id: 'structured_data',
      name: 'Structured Data',
      weight: 0,
      icon: '📊',
      description: 'Machine-readable data about your content',
      checks: [
        {
          id: 'schema_coverage',
          name: 'Schema Types',
          description: 'Variety of structured data schemas present',
          scoring: {
            '0': {
              criteria: 'No structured data found',
              details: 'Missing JSON-LD, microdata, or schema markup'
            },
            '50': {
              criteria: 'Basic schema present',
              details: 'One schema type found but limited coverage'
            },
            '100': {
              criteria: 'Comprehensive schema coverage',
              details: 'Multiple relevant schema types implemented'
            }
          }
        },
        {
          id: 'schema_validity',
          name: 'Schema Quality',
          description: 'Correctness of structured data implementation',
          scoring: {
            '0': {
              criteria: 'Invalid or broken schemas',
              details: 'JSON-LD syntax errors or malformed data'
            },
            '50': {
              criteria: 'Valid but incomplete schemas',
              details: 'Proper syntax but missing key properties'
            },
            '100': {
              criteria: 'Valid and complete schemas',
              details: 'Well-formed with all required properties'
            }
          }
        },
        {
          id: 'rich_results',
          name: 'Rich Results Ready',
          description: 'Schema completeness for Google rich snippets',
          scoring: {
            '0': {
              criteria: 'No rich results potential',
              details: 'Missing schemas or required properties'
            },
            '50': {
              criteria: 'Partial rich results readiness',
              details: 'Some required properties present'
            },
            '100': {
              criteria: 'Full rich results readiness',
              details: 'Complete schema for rich snippet display'
            }
          }
        }
      ]
    },
    {
      id: 'content_structure',
      name: 'Content Structure',
      weight: 25,
      icon: '📝',
      description: 'How well your content is organized for AI understanding',
      checks: [
        {
          id: 'semantic_html',
          name: 'Semantic Elements',
          description: 'Use of meaningful HTML5 structural elements',
          scoring: {
            '0': {
              criteria: 'No semantic HTML',
              details: 'Generic divs and spans only'
            },
            '50': {
              criteria: 'Some semantic elements',
              details: 'Basic structure with article, section, or nav'
            },
            '100': {
              criteria: 'Rich semantic structure',
              details: 'Comprehensive use of main, article, section, nav, header, footer'
            }
          }
        },
        {
          id: 'heading_hierarchy',
          name: 'Heading Structure',
          description: 'Proper hierarchical organization of headings',
          scoring: {
            '0': {
              criteria: 'Poor heading structure',
              details: 'Missing H1, skipped levels, or no hierarchy'
            },
            '50': {
              criteria: 'Basic heading structure',
              details: 'H1 present but some hierarchy issues'
            },
            '100': {
              criteria: 'Perfect heading hierarchy',
              details: 'Clear H1 → H2 → H3 progression'
            }
          }
        },
        {
          id: 'ssr_content',
          name: 'Server-Side Content',
          description: 'Content visible without JavaScript execution',
          scoring: {
            '0': {
              criteria: 'Client-side only content',
              details: 'Requires JavaScript to display content'
            },
            '50': {
              criteria: 'Partial server-side rendering',
              details: 'Some content visible, some requires JS'
            },
            '100': {
              criteria: 'Full server-side rendering',
              details: 'All content accessible without JavaScript'
            }
          }
        }
      ]
    },
    {
      id: 'technical_infrastructure',
      name: 'Technical Infrastructure',
      weight: 25,
      icon: '⚙️',
      description: 'Technical foundations supporting content discovery',
      checks: [
        {
          id: 'sitemap',
          name: 'XML Sitemap',
          description: 'Machine-readable site structure guide',
          scoring: {
            '0': {
              criteria: 'No sitemap found',
              details: 'Missing sitemap.xml file'
            },
            '50': {
              criteria: 'Basic sitemap present',
              details: 'Sitemap exists but may be incomplete'
            },
            '100': {
              criteria: 'Comprehensive sitemap',
              details: 'Well-structured XML sitemap with all pages'
            }
          }
        },
        {
          id: 'clean_extraction',
          name: 'Content Clarity',
          description: 'Clean content extraction without noise',
          scoring: {
            '0': {
              criteria: 'High noise-to-signal ratio',
              details: 'Difficult to extract main content from page'
            },
            '50': {
              criteria: 'Moderate content clarity',
              details: 'Some navigation or ads mixed with content'
            },
            '100': {
              criteria: 'Clean content extraction',
              details: 'Clear separation of main content from navigation'
            }
          }
        },
        {
          id: 'alt_formats',
          name: 'Alternative Formats',
          description: 'Content available in multiple formats',
          scoring: {
            '0': {
              criteria: 'Single format only',
              details: 'No alternative content formats available'
            },
            '50': {
              criteria: 'Some alternatives',
              details: 'Basic alternatives like RSS or mobile version'
            },
            '100': {
              criteria: 'Multiple formats',
              details: 'Rich alternatives: RSS, JSON, AMP, etc.'
            }
          }
        },
        {
          id: 'llms_txt',
          name: 'LLMs.txt',
          description: 'Dedicated AI training data permissions file',
          scoring: {
            '0': {
              criteria: 'No llms.txt file',
              details: 'Missing AI-specific permissions file'
            },
            '100': {
              criteria: 'LLMs.txt present',
              details: 'Clear AI training data usage guidelines'
            }
          }
        }
      ]
    }
  ],
  overall_scoring: {
    excellent: {
      min_score: 85,
      description: 'Outstanding AI discoverability - your content is highly optimized for LLM training and retrieval'
    },
    good: {
      min_score: 70,
      description: 'Good AI discoverability - solid foundation with room for optimization'
    },
    fair: {
      min_score: 50,
      description: 'Fair AI discoverability - basic structure present but needs improvement'
    },
    poor: {
      min_score: 0,
      description: 'Poor AI discoverability - significant barriers to AI content access and understanding'
    }
  }
};