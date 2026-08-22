/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip linting during builds — we lint separately
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds with type errors for hackathon speed
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
