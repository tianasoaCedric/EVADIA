import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  images: {
    qualities: [100, 80, 75, 70],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd192qcvfzzi3wf.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'evadia-demo.s3.eu-north-1.amazonaws.com',
      },
    ],
  },
};
 
// Important : spécifier le chemin du fichier request.ts
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
export default withNextIntl(nextConfig);