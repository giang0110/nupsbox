import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'siaodieqxzlarnvfppox.supabase.co',
        pathname: '/storage/v1/object/public/onboarding-photos/**'
      },
      {
        protocol: 'https',
        hostname: 'veglohnmofzkgovedxkb.supabase.co',
        pathname: '/storage/v1/object/public/nupsbox-media/**'
      }
    ]
  }
};

export default withNextIntl(nextConfig);
