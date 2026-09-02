/** @type {import('next').NextConfig} */
const githubPagesBasePath =
  process.env.GITHUB_PAGES === "1" ? "/tts-football-dashboard" : "";

const nextConfig = {
  output: "export",
  reactStrictMode: true,
  basePath: githubPagesBasePath,
  assetPrefix: githubPagesBasePath,
};

export default nextConfig;
