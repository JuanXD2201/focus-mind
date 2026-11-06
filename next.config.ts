import type {NextConfig} from 'next';
import('dotenv/config');

const nextConfig: NextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
       {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ],
  },
};

export default nextConfig;
