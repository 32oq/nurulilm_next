/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:6001';
    return [
      {
        source: '/user/:path*',
        destination: `${backendUrl}/user/:path*`,
      },
      {
        source: '/dashboard/:path*',
        destination: `${backendUrl}/dashboard/:path*`,
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
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
