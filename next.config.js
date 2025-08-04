const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {


  // disable ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    // alias @ → src
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

module.exports = nextConfig;