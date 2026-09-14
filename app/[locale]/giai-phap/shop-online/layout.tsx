import type {ReactNode} from 'react';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const copy = {
  vi: {title: 'Kho mini cho shop online', description: 'Không gian kho mini cho shop online cần tách hàng khỏi nhà ở, lưu mẫu và quản lý lượng hàng gọn hơn tại TP.HCM.'},
  en: {title: 'Mini storage for online sellers', description: 'Mini storage for online sellers who need dedicated space for stock, samples and growing inventory in Ho Chi Minh City.'}
};

export function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  return createStaticPageMetadata(params, 'solution:shop-online', copy);
}

export default function Layout({children}: {children: ReactNode}) { return children; }
