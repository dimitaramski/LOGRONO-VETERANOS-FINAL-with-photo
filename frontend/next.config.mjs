/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',            // build static files
  images: { unoptimized: true },
  trailingSlash: true
};
export default nextConfig;
