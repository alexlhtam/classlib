/** @type {import('next').NextConfig} */
const nextConfig = {
  // The legacy/ prototype is plain browser scripts, not part of the build.
  outputFileTracingExcludes: {
    '*': ['./legacy/**'],
  },
};

export default nextConfig;
