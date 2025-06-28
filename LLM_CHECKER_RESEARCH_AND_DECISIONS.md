# LLM Checker: Research-Based Implementation Strategy

**🚀 LATEST UPDATE: Schema Validation Implementation**  
*June 28, 2025* - Completed Priority 5: Implemented comprehensive JSON-LD schema validation replacing random scoring. Now validates actual schema structure, required fields, and quality metrics.

**Schema Validation Scoring (0-100 points):**
- Basic JSON-LD Requirements: @context (20pts) + @type (20pts) = 40pts
- Type-Specific Properties: Article needs headline/author (up to 20pts)
- Required Fields Completeness: Based on schema type requirements (30pts)
- Rich Properties Bonus: image, datePublished, description, etc. (10pts)
- Real-world results: schema.org = 96pts, incomplete schemas = 76pts

**Previous Updates:**
- Progressive scoring system (0-100) replacing arbitrary 0/50/100 thresholds
- Semantic HTML now requires `<main>` or `<article>` (60 points) - reflects AI crawler needs
- Clean extraction measures content in proper containers vs scattered in divs
- All scoring backed by research from content extraction algorithms

## Executive Summary

This document outlines our evidence-based approach to building an LLM discoverability checker, distinguishing between proven factors and speculative assumptions. We prioritize technical infrastructure checks with solid evidence over theoretical content quality metrics.

---

## Evidence Classification

### 🟢 PROVEN CRITICAL FACTORS (High Confidence)
**These have direct evidence from AI companies or established web standards**

| Factor | Evidence Source | Impact | Implementation Priority |
|--------|----------------|---------|----------------------|
| **robots.txt** | OpenAI, Anthropic, Google confirmed they respect it | Direct access control - blocked = no crawling | **Priority 1** |
| **Response Time** | Google crawl budget research, site speed studies | Slow sites get reduced crawl frequency | **Priority 2** |
| **HTTPS** | Universal web security standard | Required by all modern crawlers | **Priority 3** |
| **JSON-LD Schema** | Google Rich Results, Microsoft Graph | Structured data directly feeds AI understanding | **Priority 4** |

### 🟡 LIKELY IMPORTANT (Medium Confidence)
**Based on web standards and accessibility research**

| Factor | Evidence Source | Reasoning | Implementation Priority |
|--------|----------------|-----------|----------------------|
| **Semantic HTML** | W3C accessibility standards, SEO research | AI needs structure to parse content hierarchy | **Priority 5** |
| **Heading Hierarchy** | Document structure standards | Helps AI understand content organization | **Priority 6** |
| **SSR Content** | Crawler behavior patterns | Many bots don't execute JavaScript | **Priority 7** |

### 🟠 SPECULATIVE FACTORS (Low Confidence - KIV)
**Assumptions without solid evidence for AI discoverability**

| Factor | Why Speculative | Our Assumption | Reality Check |
|--------|----------------|----------------|---------------|
| **Content Freshness** | No AI company published freshness preferences | Recent = better for training | Wikipedia's old articles rank highly |
| **Content Completeness** | Subjective quality metric | More comprehensive = better | What's "complete" varies by use case |
| **Content Clarity** | Based on human readability research | Simple language = better for AI | AI may handle complexity better than humans |
| **llms.txt** | Theoretical standard, minimal adoption | Shows AI-friendly intent | No major sites or AI companies use it |

---

## Current Implementation Status

### ✅ FULLY WORKING (Real API Calls)
| Check | Current Quality | Evidence Level | Keep/Improve |
|-------|----------------|----------------|--------------|
| `robots_txt` | Excellent - handles redirects, parses correctly | 🟢 Proven | **Keep** |
| `response_time` | Good - measures actual TTFB | 🟢 Proven | **Keep** |
| `https` | Basic but effective - URL prefix check | 🟢 Proven | **Keep** |
| `sitemap` | Good - checks XML sitemap presence | 🟡 Likely Important | **Keep** |
| `semantic_html` | Basic - counts semantic elements | 🟡 Likely Important | **Improve** |
| `heading_hierarchy` | Basic - checks H1-H6 structure | 🟡 Likely Important | **Improve** |
| `schema_coverage` | Basic - detects JSON-LD presence | 🟢 Proven | **Improve** |
| `schema_validity` | ✅ Working - validates JSON-LD structure and quality | 🟢 Proven | **Keep** |
| `llms_txt` | Working - checks file existence | 🟠 Speculative | **KIV** |
| `alt_formats` | Working - checks RSS/JSON feeds | 🟡 Likely Important | **Keep** |
| `clean_extraction` | Working - text extraction analysis | 🟡 Likely Important | **Keep** |

### 🔧 PARTIALLY WORKING (Need Improvement)
| Check | Current Issue | Evidence Level | Action |
|-------|---------------|----------------|--------|
| `freshness` | Only checks current year | 🟠 Speculative | **KIV - Implement later** |
| `completeness` | Basic word count | 🟠 Speculative | **KIV - Implement later** |
| `clarity` | Simple structure check | 🟠 Speculative | **KIV - Implement later** |
| `ssr_content` | Incomplete implementation | 🟡 Likely Important | **Improve Now** |

### ❌ NOT WORKING (Random/Fallback Scoring)
| Check | Current Issue | Evidence Level | Action |
|-------|---------------|----------------|--------|
| `rich_results` | Random scoring | 🟡 Likely Important | **Implement Later** |
| `quality_backlinks` | Random scoring | 🟠 Speculative | **KIV** |
| `entity_presence` | Random scoring | 🟠 Speculative | **KIV** |
| `indexing_speed` | Random scoring | 🟠 Speculative | **KIV** |
| `error_rate` | Random scoring | 🟡 Likely Important | **Implement Later** |

---

## Detailed Scoring Methodology (Current Implementation)

### Overall Scoring System (0-100 Progressive Scale)

**Category Weights:**
- **AI Access Control**: 40-50% (varies by page type)
- **Structured Data**: 0% base weight + bonus points (up to +10)
- **Content Structure**: 20-35% (varies by page type)
- **Technical Infrastructure**: 10-30% (varies by page type)

**Final Score Calculation:**
1. Calculate weighted average of categories (excluding structured data)
2. Add structured data bonus points (0-10)
3. Apply context-aware adjustments based on page type
4. Cap final score at 100

### Individual Check Scoring (0-100 Points Each)

#### **AI Access Control Category**

**🔍 Robots.txt Check (`robots_txt`)**
- **85-100 points**: AI bots explicitly allowed, comprehensive robots.txt
- **60-84 points**: Basic robots.txt present, some AI access
- **20-59 points**: Robots.txt exists but may have issues
- **0-19 points**: No robots.txt or blocks AI crawlers

**⚡ Response Time Check (`response_time`)**
- **100 points**: < 500ms (optimal for AI crawlers)
- **75 points**: 500ms - 1000ms (good)
- **50 points**: 1000ms - 2000ms (acceptable)
- **25 points**: > 2000ms (poor)

**🔒 HTTPS Check (`https`)**
- **100 points**: HTTPS enabled
- **0 points**: HTTP only (insecure)

#### **Structured Data Category**

**📊 Schema Coverage (`schema_coverage`)**
- **75-100 points**: Multiple relevant schema types
- **50-74 points**: 1-2 schema types present
- **25-49 points**: Basic schema present
- **0-24 points**: No structured data

**✅ Schema Validity (`schema_validity`) - NEW IMPLEMENTATION**
- **Basic JSON-LD Requirements (40 points)**:
  - @context property: +20 points
  - @type property: +20 points
- **Type-Specific Properties (up to 20 points)**:
  - Article/BlogPosting: headline (+5), author (+5), datePublished (+5), image (+5)
  - Organization: name (+5), url (+5), logo (+5), contactPoint/address (+5)
  - WebSite: name (+5), url (+5), description (+5), potentialAction (+5)
  - Product: name (+5), description (+5), image (+5), offers (+5)
  - Person: name (+5), jobTitle/worksFor (+5), image (+5), url/sameAs (+5)
- **Required Fields Completeness (30 points)**:
  - Based on schema type requirements (Article needs headline + author)
  - Score = (present fields / required fields) × 30
- **Rich Properties Bonus (10 points)**:
  - +2 points each for: image, author, datePublished, dateModified, description, url
- **Final Validation**: Must score ≥40 points to be considered "valid"

**⭐ Rich Results (`rich_results`)**
- **80-100 points**: Schema ready for Google rich snippets
- **60-79 points**: Most required properties present
- **40-59 points**: Some rich result properties
- **0-39 points**: Not rich-result ready

#### **Content Structure Category**

**🏗️ Semantic HTML (`semantic_html`)**
- **85-100 points**: Comprehensive semantic structure (main, article, section, nav, header, footer)
- **60-84 points**: Good semantic elements present
- **40-59 points**: Some semantic elements
- **0-39 points**: Generic divs/spans only

**📋 Heading Hierarchy (`heading_hierarchy`)**
- **90-100 points**: Perfect H1→H2→H3 progression, single H1
- **75-89 points**: Good structure with single H1
- **50-74 points**: Has headings but some issues
- **0-49 points**: No clear heading structure

**🖥️ Server-Side Rendering (`ssr_content`)**
- **85-100 points**: All content accessible without JavaScript
- **60-84 points**: Most content server-side rendered
- **30-59 points**: Some content requires JavaScript
- **0-29 points**: Heavy JavaScript dependency

#### **Technical Infrastructure Category**

**🗺️ XML Sitemap (`sitemap`)**
- **90-100 points**: Comprehensive sitemap with all pages
- **60-89 points**: Basic sitemap present
- **20-59 points**: Sitemap exists but incomplete
- **0-19 points**: No sitemap

**🧹 Content Extraction (`clean_extraction`)**
- **80-100 points**: Clean content in semantic containers
- **60-79 points**: Mostly clean content structure
- **40-59 points**: Some navigation/ads mixed with content
- **0-39 points**: Difficult to extract main content

**📄 Alternative Formats (`alt_formats`)**
- **70-100 points**: RSS/JSON feeds or API endpoints
- **30-69 points**: Some alternative access methods
- **0-29 points**: Single format only

**🤖 LLMs.txt (`llms_txt`)**
- **100 points**: LLMs.txt file present (emerging standard)
- **0 points**: No LLMs.txt file

### Context-Aware Scoring Adjustments

**Page Type Detection:**
- **Homepage**: Higher weight on structured data and access control
- **Article/Blog**: Higher weight on content structure and semantic HTML
- **Product**: Higher weight on structured data (Product schema)
- **Organization**: Balanced scoring across all categories

**Real-World Validation Results:**
- **schema.org**: 96/100 schema validity (complete schemas)
- **schema.org/status**: 76/100 schema validity (incomplete schemas)
- **Anthropic.com**: 100/100 robots.txt score
- **Wikipedia**: 100/100 robots.txt score (complex but correct)

---

## Phase 1 Implementation Plan (Evidence-Based Core)

### Focus: Proven + Likely Important Factors Only

**Category Weights (Revised for Evidence-Based Approach):**
| Category | Weight | Reasoning |
|----------|--------|-----------|
| **AI Access Control** | 40% | Direct evidence from AI companies |
| **Structured Data** | 30% | Proven impact on AI understanding |
| **Content Structure** | 20% | Web standards + accessibility research |
| **Technical Infrastructure** | 10% | Supporting factors |

**Specific Checks to Implement/Improve:**

| Priority | Check | Current Status | Action Needed |
|----------|-------|----------------|---------------|
| **P1** | `robots_txt` | ✅ Working | Keep as-is |
| **P2** | `response_time` | ✅ Working | Keep as-is |
| **P3** | `https` | ✅ Working | Keep as-is |
| **P4** | `schema_coverage` | 🔧 Basic | Improve: Check schema types, nesting |
| **P5** | `schema_validity` | ✅ Working | ✅ Complete: Validates JSON-LD structure and quality |
| **P6** | `semantic_html` | 🔧 Basic | Improve: Weight by importance |
| **P7** | `heading_hierarchy` | 🔧 Basic | Improve: Check proper nesting |
| **P8** | `ssr_content` | 🔧 Incomplete | Implement: JS dependency analysis |

---

## Perplexity Decision

### Do We Need Perplexity for Phase 1? **NO**

**Reasoning:**
- All Phase 1 factors are technically measurable
- No subjective content quality assessment needed
- Perplexity would be useful for speculative factors (freshness, completeness, clarity)
- We're KIV'ing speculative factors for now

**When to Revisit Perplexity:**
- Phase 2: If we want to add content quality factors
- After validating Phase 1 with real-world testing
- If we find evidence that content quality actually matters for AI discoverability

---

## Research Sources and Evidence

### AI Company Statements
- **OpenAI**: Confirmed GPTBot respects robots.txt
- **Anthropic**: Claude-Web follows robots.txt directives  
- **Google**: Confirmed crawl budget affected by site speed
- **Microsoft**: Uses structured data for Bing Chat responses

### Web Standards Research
- **W3C Accessibility Guidelines**: Semantic HTML importance
- **Google SEO Research**: Page speed impact on crawling
- **Schema.org Documentation**: Structured data benefits

### Real-World Testing Results
- **Anthropic.com**: Perfect robots.txt = 100/100 score
- **Wikipedia**: Complex robots.txt correctly parsed = 100/100 score
- **Sites without HTTPS**: Often blocked by modern crawlers

---

## Future Research Questions (Phase 2)

### Content Quality Factors to Investigate
1. **Do AI companies prefer recent content over comprehensive old content?**
2. **Is there evidence that simple language improves AI understanding?**
3. **Do comprehensive articles get cited more in AI responses?**
4. **What role does content freshness play in AI training data selection?**

### Methodology for Phase 2
1. **Survey AI company documentation** for content quality preferences
2. **Analyze which content gets cited** in AI responses
3. **Test content variations** to see ranking differences
4. **Implement Perplexity analysis** for subjective quality factors

---

## Implementation Decisions Summary

### ✅ Implement Now (Phase 1)
- Improve existing proven factors
- Add missing technical infrastructure checks
- Focus on measurable, evidence-based factors

### ⏸️ Keep in View (Phase 2)
- Content quality factors (freshness, completeness, clarity)
- Perplexity integration for semantic analysis
- Authority signals and backlink analysis

### ❌ Deprioritize
- Speculative factors without evidence
- Complex content analysis without proven ROI
- Features that add complexity without clear benefit

This approach ensures we build a solid, evidence-based foundation before exploring theoretical improvements. 