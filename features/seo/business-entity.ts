import type {PublicLocation} from '@/features/catalog/types';

type PublicContactSettings = {
  phone: string | null;
  email: string | null;
};

export function buildPublicBusinessEntity({
  origin,
  locale,
  location,
  settings
}: {
  origin: string;
  locale: 'vi' | 'en';
  location: PublicLocation | null;
  settings: PublicContactSettings;
}): Record<string, unknown> {
  const shared = {
    '@context': 'https://schema.org',
    '@id': `${origin}/#nupsbox`,
    name: 'NupsBox',
    url: locale === 'vi' ? origin : `${origin}/en`,
    ...(settings.phone ? {telephone: settings.phone} : {}),
    ...(settings.email ? {email: settings.email} : {})
  };

  if (!location) {
    return {
      ...shared,
      '@type': 'Organization'
    };
  }

  return {
    ...shared,
    '@type': 'LocalBusiness',
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.address,
      addressLocality: location.district,
      addressRegion: location.city,
      addressCountry: 'VN'
    }
  };
}
