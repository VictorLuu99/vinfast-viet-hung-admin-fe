import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
    ],
  },
  transpilePackages: [
    '@blocknote/core',
    '@blocknote/react',
    '@blocknote/mantine',
    '@handlewithcare/prosemirror-inputrules',
  ],
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@handlewithcare/prosemirror-inputrules': path.resolve(
        './node_modules/@handlewithcare/prosemirror-inputrules/dist/index.js'
      ),
    }
    return config
  },
}

export default nextConfig
