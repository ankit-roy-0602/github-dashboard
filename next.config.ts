const nextConfig = {
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
  },
  experimental: {
    serverActions: true,
  },
  // Ensure API routes work on Vercel
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Headers for webhook endpoint
  async headers() {
    return [
      {
        source: '/api/webhook',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, x-github-event, x-github-delivery, x-hub-signature-256',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig