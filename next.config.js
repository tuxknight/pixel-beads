/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/pixel-beads',
  assetPrefix: '/pixel-beads',
  images: { unoptimized: true },
}

module.exports = nextConfig
