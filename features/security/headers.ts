export type SecurityResponseHeader = {
  key: string;
  value: string;
};

export const SECURITY_RESPONSE_HEADERS: SecurityResponseHeader[] = [
  {key: 'X-Content-Type-Options', value: 'nosniff'},
  {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()'
  },
  {key: 'X-Frame-Options', value: 'SAMEORIGIN'}
];
