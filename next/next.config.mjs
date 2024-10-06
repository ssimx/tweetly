/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3001', // Your Express server port
                pathname: '/public/**', // Path to your images on the Express server
            },
        ],
    },
};

export default nextConfig;
