/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://madbus.in/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
