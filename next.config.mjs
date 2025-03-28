/** @type {import('next').NextConfig} */

const isGithubPages = process.env.GITHUB_PAGES === 'true';
const nextConfig = {
  basePath: isGithubPages ? '/bio_segment/mito_detect' : '',
  assetPrefix: isGithubPages ? '/bio_segment/mito_detect/' : '',
};



export default nextConfig;

