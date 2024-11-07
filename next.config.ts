import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    experimental: {
        ppr: 'incremental',  // Partial pre-rendering of components, wrapped with Suspense.
    },
};

export default nextConfig;
