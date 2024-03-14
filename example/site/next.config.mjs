import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
    cacheMaxMemorySize: 0,
    cacheHandler: path.resolve(process.cwd(), 'cache-handler.js'),
    distDir: process.env.DIST_DIR || '.next',
};

export default nextConfig;
