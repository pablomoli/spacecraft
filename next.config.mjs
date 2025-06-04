/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Remove assetPrefix and basePath for custom domain
  // GitHub Pages with custom domain doesn't need these
}

export default nextConfig
