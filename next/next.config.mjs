/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;
