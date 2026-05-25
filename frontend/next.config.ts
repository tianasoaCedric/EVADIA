import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/**' },
      { protocol: 'https', hostname: '**.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.cloudfront.net', pathname: '/**' },
    ],
  },
};
 
// Important : spécifier le chemin du fichier request.ts
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
export default withNextIntl(nextConfig);