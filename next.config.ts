import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import {SECURITY_RESPONSE_HEADERS} from './features/security/headers';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_RESPONSE_HEADERS
      }
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'siaodieqxzlarnvfppox.supabase.co',
        pathname: '/storage/v1/object/public/onboarding-photos/**'
      }
    ]
  }
};

export default withNextIntl(nextConfig);
