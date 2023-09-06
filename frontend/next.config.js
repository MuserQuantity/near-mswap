/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',//静态部署
  output: 'standalone', //SSR部署
  env: {
    walletConnectProjectId: process.env.WALLET_CONNECT_PROJECT_ID,
  },

  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  swcMinify: true,
  // eslint-disable-next-line no-empty-pattern
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    return {
      // '': { page: '/index' },
    }
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Disable console.log() statements in production
    if (!isServer && process.env.NODE_ENV === 'production') {
      // Use terser-webpack-plugin to minify the JS code
      const TerserPlugin = require('terser-webpack-plugin')
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ]
    }

    return config
  },
  // rewrites: async () => [
  //   { source: '/api/:path*', destination: 'http://10.252.92.17:35588/:path*' },
  // ],
}

module.exports = nextConfig
