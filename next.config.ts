import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const securityHeaders = [
  {key: 'X-Content-Type-Options', value: 'nosniff'},
  {key: 'X-Frame-Options', value: 'DENY'},
  {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
  {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'},
  {key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload'},
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; form-action 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://siaodieqxzlarnvfppox.supabase.co https://veglohnmofzkgovedxkb.supabase.co; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; media-src 'self' blob: https://siaodieqxzlarnvfppox.supabase.co https://veglohnmofzkgovedxkb.supabase.co; worker-src 'self' blob:; manifest-src 'self'"
  }
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/en/about',
        destination: '/en/about-nupsbox',
        permanent: true
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
