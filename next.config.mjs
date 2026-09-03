/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig = {
  output: "export",
  basePath,
  reactStrictMode: true,
  trailingSlash: true,
};

export default nextConfig;
