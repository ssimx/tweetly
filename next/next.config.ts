/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next';

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
            root: '.', // root folder which is /next
            resolveAlias: {
                '@public/': ['./public/'], // public folder inside /next
            }
        },
    },
    devIndicators: {
        appIsrStatus: true,
        buildActivity: true,
        buildActivityPosition: 'bottom-left',
    },
};

export default nextConfig;
