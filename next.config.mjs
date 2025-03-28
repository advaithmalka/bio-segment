/** @type {import('next').NextConfig} */

const isGithubPages = process.env.GITHUB_PAGES === 'true';
const nextConfig = {
  basePath: isGithubPages ? '/bio_segment/' : '',
  assetPrefix: isGithubPages ? '/bio_segment/' : '',
};



export default nextConfig;

