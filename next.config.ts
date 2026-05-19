/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
  },

  allowedDevOrigins: [
    'astrology-dupe-depraved.ngrok-free.dev'
  ],
}

module.exports = nextConfig