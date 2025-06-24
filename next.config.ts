const nextConfig = {
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
  },
  images: {
    domains: ["avatars.githubusercontent.com", "github.com"],
  },
  experimental: {
    serverActions: true,
  },
  // Ensure CSS is properly processed
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
