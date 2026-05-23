import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  images: {
    // Images externes sur CloudFront/S3 : servies directement sans traitement Next.js
    unoptimized: true,
  },
};
 
// Important : spécifier le chemin du fichier request.ts
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
export default withNextIntl(nextConfig);