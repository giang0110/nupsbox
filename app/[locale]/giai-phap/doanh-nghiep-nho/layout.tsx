import type {ReactNode} from 'react';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const copy = {
  vi: {title: 'Kho mini cho doanh nghiệp nhỏ', description: 'Giải pháp kho mini cho doanh nghiệp nhỏ cần thêm không gian lưu hàng linh hoạt tại TP.HCM mà chưa cần thuê kho lớn.'},
  en: {title: 'Mini storage for small businesses', description: 'Flexible mini storage for small businesses in Ho Chi Minh City that need extra inventory space without a large warehouse.'}
};

export function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  return createStaticPageMetadata(params, 'solution:small-business', copy);
}

export default function Layout({children}: {children: ReactNode}) { return children; }
