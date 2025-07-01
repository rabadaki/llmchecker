# LLM Checker - AI Visibility Tool

[![CI](https://github.com/yourusername/llm-checker/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/llm-checker/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/yourusername/llm-checker/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/llm-checker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive tool for analyzing website AI discoverability and LLM visibility. Check how well AI systems like ChatGPT, Claude, and Gemini can understand and reference your website.

## Features

- 🤖 **AI Crawler Analysis** - Check robots.txt permissions for major AI crawlers
- 📊 **Schema Markup Detection** - Analyze structured data implementation
- 🏗️ **Content Structure** - Evaluate semantic HTML and content organization
- ⚡ **Performance Metrics** - Measure site speed and technical health
- 🔍 **Multi-Site Analysis** - Analyze multiple related sites simultaneously
- 📈 **Context-Aware Scoring** - Adaptive scoring based on site type
- 💡 **Actionable Recommendations** - Get specific improvement suggestions

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/llm-checker.git
cd llm-checker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Development

```bash
# Run development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint
```

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Core services and utilities
- **Integration Tests**: API endpoints and service integration
- **Coverage Requirements**: Minimum 70% code coverage

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run CI tests
npm run test:ci
```

### Test Coverage Goals

- Overall: 70%+ coverage
- Core Services:
  - AnalysisService: 85%+ (critical path)
  - RecommendationService: 80%+
  - HttpService: 70%+
  - ContextAwareScoringService: 70%+

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration:

- **Automated Testing**: Runs on all PRs and pushes to main
- **Coverage Reporting**: Automatic coverage reports on PRs
- **Build Verification**: Ensures successful Next.js builds
- **Code Quality**: Linting and formatting checks

## API Documentation

### POST /api/analyze
Analyze a single website for AI visibility.

```json
{
  "url": "https://example.com"
}
```

### POST /api/multi-analyze
Analyze multiple related sites with discovery.

```json
{
  "inputUrl": "https://example.com",
  "discoveryEnabled": true,
  "analysisOptions": {
    "maxSites": 5
  }
}
```

### POST /api/discover-sites
Discover related sites without full analysis.

```json
{
  "inputUrl": "https://example.com"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Ensure tests pass and coverage meets thresholds
- Follow existing code style and conventions
- Update documentation as needed
- Add tests for new functionality

## Architecture

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with service layer architecture
- **Testing**: Jest with TypeScript support
- **Database**: Supabase for storing analysis results
- **Deployment**: Optimized for Vercel deployment

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js, React, and TypeScript
- Styled with Tailwind CSS
- Icons from Lucide React
- Analytics by Google Analytics

---

For more information, visit [llm-checker.com](https://llm-checker.com)
