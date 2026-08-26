import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://jobs.hoberg.com.ng'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/jobs',
          '/categories',
          '/premium',
          '/premium/waitlist',
          '/signup',
          '/login',
          '/privacy_policy',
          '/terms_of_service',
          '/llms.txt',
          '/sitemap.xml',
        ],
        disallow: ['/dashboard', '/profile', '/api/', '/auth/', '/aadminn'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Google-Extended',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Applebot-Extended',
        ],
        allow: [
          '/',
          '/jobs',
          '/categories',
          '/premium',
          '/premium/waitlist',
          '/signup',
          '/login',
          '/privacy_policy',
          '/terms_of_service',
          '/llms.txt',
          '/llms-full.txt',
          '/sitemap.xml',
        ],
        disallow: ['/dashboard', '/profile', '/api/', '/auth/', '/aadminn'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
