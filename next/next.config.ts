/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
    // reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/ddj6z1ptr/**',
            },
        ],
    },
    logging: {
        fetches: {
            fullUrl: true,
        }
    },

    experimental: {
        turbo: {
            resolveAlias: {
                '@public': ['./public/'],
            },
        },
        serverActions: {
            bodySizeLimit: '100mb',
        },
    },
    outputFileTracingRoot: path.join(__dirname, "../"),
};

export default nextConfig;
