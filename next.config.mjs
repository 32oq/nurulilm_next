/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:6001';
    return [
      // Safeguard against accidental /api/api double-prefixing
      {
        source: '/api/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
      // Primary API Proxy: all frontend data requests route cleanly under /api/*
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
      // Direct backend fallbacks for compatibility
      {
        source: '/user/:path*',
        destination: `${backendUrl}/user/:path*`,
      },
      {
        source: '/dashboard/library/:path*',
        destination: `${backendUrl}/dashboard/library/:path*`,
      },
      {
        source: '/dashboard/package/:path*',
        destination: `${backendUrl}/dashboard/package/:path*`,
      },
      {
        source: '/dashboard/pending/:path*',
        destination: `${backendUrl}/dashboard/pending/:path*`,
      },
      {
        source: '/dashboard/payments/:path*',
        destination: `${backendUrl}/dashboard/payments/:path*`,
      },
      {
        source: '/dashboard/resources/:path*',
        destination: `${backendUrl}/dashboard/resources/:path*`,
      },
      {
        source: '/dashboard/loans/:path*',
        destination: `${backendUrl}/dashboard/loans/:path*`,
      },
      {
        source: '/dashboard/users/:path*',
        destination: `${backendUrl}/dashboard/users/:path*`,
      },
      {
        source: '/payments/:path*',
        destination: `${backendUrl}/payments/:path*`,
      },
      {
        source: '/game/:path*',
        destination: `${backendUrl}/game/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
