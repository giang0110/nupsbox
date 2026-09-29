export type LeadNeedType = 'shop_online' | 'sme' | 'inventory' | 'personal' | 'documents' | 'other';
export type LeadEstimatedVolume = 'under_20_boxes' | 'boxes_20_50' | 'over_50_boxes' | 'unknown';
export type LeadInquiryType =
  | 'service_advice'
  | 'quote'
  | 'partnership'
  | 'facility_info'
  | 'storage'
  | 'other';

export function normalizeLeadInquiryType(value: string | undefined): LeadInquiryType {
  switch (value) {
    case 'service_advice':
    case 'quote':
    case 'partnership':
    case 'facility_info':
    case 'storage':
      return value;
    default:
      return 'service_advice';
  }
}

export function normalizeLeadNeed(value: string | undefined): LeadNeedType {
  switch (value) {
    case 'shop_online':
      return 'shop_online';
    case 'business':
    case 'sme':
      return 'sme';
    case 'inventory':
      return 'inventory';
    case 'personal':
      return 'personal';
    case 'documents':
      return 'documents';
    default:
      return 'other';
  }
}

export function normalizeLeadVolume(value: string | undefined): LeadEstimatedVolume {
  switch (value) {
    case 'under_20':
    case 'under_20_boxes':
      return 'under_20_boxes';
    case '20_50':
    case 'boxes_20_50':
      return 'boxes_20_50';
    case 'over_50':
    case 'over_50_boxes':
      return 'over_50_boxes';
    default:
      return 'unknown';
  }
}
