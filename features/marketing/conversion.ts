export type ConversionIntent = 'finder' | 'quote' | 'viewing';

export type ConversionContext = {
  unitSlug?: string;
  unitId?: string;
  locationSlug?: string;
  locationId?: string;
  need?: string;
  volume?: string;
};

export function buildConversionHref(
  locale: 'vi' | 'en',
  intent: ConversionIntent,
  context: ConversionContext = {}
): string {
  if (intent === 'finder') {
    return locale === 'vi' ? '/#storage-finder' : '/en#storage-finder';
  }

  const base = intent === 'quote'
    ? (locale === 'vi' ? '/lien-he' : '/en/contact')
    : (locale === 'vi' ? '/dat-kho' : '/en/book-storage');

  const params = new URLSearchParams();
  if (context.unitSlug) params.set('unit', context.unitSlug);
  if (context.locationSlug) params.set('location', context.locationSlug);
  if (context.unitId) params.set('unitId', context.unitId);
  if (context.locationId) params.set('locationId', context.locationId);
  if (context.need) params.set('need', context.need);
  if (context.volume) params.set('volume', context.volume);

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}
