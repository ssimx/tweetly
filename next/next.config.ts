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
                pathname: '/ddj6z1ptr/**', // Path to your images on the Express server
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
                '@public/': ['./public/'],
            },
        },
    },
    outputFileTracingRoot: path.join(__dirname, "../"),
    devIndicators: {
        appIsrStatus: true,
        buildActivity: true,
        buildActivityPosition: 'bottom-left',
    },
};

export default nextConfig;
