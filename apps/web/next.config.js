/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
  typescript: {
    tsconfigPath: './tsconfig.json'
  }
};

module.exports = nextConfig;
