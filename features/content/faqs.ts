import 'server-only';

import {createSupabaseServerClient} from '@/lib/supabase/server';
import {projectActiveFaqs, type MarketingFaq} from '@/features/home/content';
import type {AppLocale} from '@/i18n/routing';

const fallbackFaqRows = [
  {
    id: 'sizes',
    question_vi: 'NupsBox hiện có những kích thước nào?',
    answer_vi: 'Website hiện giới thiệu Kho S 1,64 m² và Kho M 5,43 m². Tình trạng phù hợp với nhu cầu của bạn được xác nhận khi liên hệ.',
    question_en: 'Which unit sizes are currently listed?',
    answer_en: 'The website currently lists 1.64 m² Storage S and 5.43 m² Storage M. Suitability and current status are confirmed when you enquire.',
    active: true,
    sort_order: 10
  },
  {
    id: 'price',
    question_vi: 'Giá thuê kho là bao nhiêu?',
    answer_vi: 'Website chỉ hiển thị mức giá do NupsBox cập nhật. Khi chưa có giá công khai, hệ thống hiển thị “Liên hệ báo giá”.',
    question_en: 'How much does storage cost?',
    answer_en: 'The website only publishes pricing maintained by NupsBox. When public pricing is unavailable it displays “Contact for pricing”.',
    active: true,
    sort_order: 20
  },
  {
    id: 'sizing',
    question_vi: 'Tôi chưa biết cần bao nhiêu m² thì sao?',
    answer_vi: 'Bạn có thể dùng Storage Finder để có gợi ý ban đầu hoặc gửi nhu cầu để NupsBox tư vấn trực tiếp.',
    question_en: 'What if I do not know how much space I need?',
    answer_en: 'Use Storage Finder for a starting suggestion or send your needs to NupsBox for direct advice.',
    active: true,
    sort_order: 30
  }
];

function shouldUseFallback() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return !url || url.includes('example.supabase.co');
}

export async function getMarketingFaqs(locale: AppLocale): Promise<MarketingFaq[]> {
  if (shouldUseFallback()) return projectActiveFaqs(fallbackFaqRows, locale);

  try {
    const supabase = await createSupabaseServerClient();
    const {data, error} = await supabase
      .from('faqs')
      .select('id, question_vi, answer_vi, question_en, answer_en, active, sort_order')
      .eq('active', true)
      .order('sort_order', {ascending: true});
    if (error) throw error;
    const projected = projectActiveFaqs((data ?? []) as Array<Record<string, unknown>>, locale);
    return projected.length ? projected : projectActiveFaqs(fallbackFaqRows, locale);
  } catch {
    return projectActiveFaqs(fallbackFaqRows, locale);
  }
}
