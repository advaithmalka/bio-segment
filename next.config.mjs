/** @type {import('next').NextConfig} */

const isGithubPages = process.env.GITHUB_PAGES === 'true';
const nextConfig = {
  basePath: isGithubPages ? '/bio-segment/' : '',
  assetPrefix: isGithubPages ? '/bio-segment/' : '',
  output: 'export', // Required for static GitHub Pages deployment
  images: {
    unoptimized: true // Required for static exports
  }
};



export default nextConfig;

