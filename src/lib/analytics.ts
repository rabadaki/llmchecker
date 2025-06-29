// Google Analytics event tracking utilities

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = (action: string, parameters?: {
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: parameters?.event_category,
      event_label: parameters?.event_label,
      value: parameters?.value,
      ...parameters?.custom_parameters,
    });
  }
};

// Predefined events for our app
export const trackAnalysisStart = (url: string, isMultiSite: boolean = false) => {
  event('analysis_start', {
    event_category: 'engagement',
    event_label: isMultiSite ? 'multi_site' : 'single_site',
    custom_parameters: {
      analyzed_url: url,
      analysis_type: isMultiSite ? 'multi_site' : 'single_site',
    },
  });
};

export const trackAnalysisComplete = (url: string, score: number, isMultiSite: boolean = false) => {
  event('analysis_complete', {
    event_category: 'engagement',
    event_label: isMultiSite ? 'multi_site' : 'single_site',
    value: score,
    custom_parameters: {
      analyzed_url: url,
      overall_score: score,
      analysis_type: isMultiSite ? 'multi_site' : 'single_site',
    },
  });
};

export const trackRecommendationClick = (recommendationTitle: string, impact: string) => {
  event('recommendation_click', {
    event_category: 'engagement',
    event_label: recommendationTitle,
    custom_parameters: {
      recommendation_impact: impact,
    },
  });
};

export const trackShareResults = (method: string) => {
  event('share_results', {
    event_category: 'engagement',
    event_label: method, // 'link_copy', 'native_share', etc.
  });
};

export const trackEmailReport = () => {
  event('email_report', {
    event_category: 'engagement',
    event_label: 'email_click',
  });
};

export const trackNewAnalysis = () => {
  event('new_analysis', {
    event_category: 'engagement',
    event_label: 'new_analysis_click',
  });
};

export const trackBlogVisit = (blogSlug: string) => {
  event('blog_visit', {
    event_category: 'content',
    event_label: blogSlug,
  });
};

export const trackSuggestionClick = (suggestion: string) => {
  event('suggestion_click', {
    event_category: 'engagement',
    event_label: suggestion,
  });
};