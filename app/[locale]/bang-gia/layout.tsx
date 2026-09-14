import type {ReactNode} from 'react';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const copy = {
  vi: {title: 'Bảng giá thuê kho mini', description: 'Xem bảng giá kho mini NupsBox tại TP.HCM. Mức giá chỉ hiển thị khi được NupsBox cập nhật; trường hợp khác sẽ yêu cầu liên hệ xác nhận.'},
  en: {title: 'Mini storage pricing', description: 'View NupsBox mini storage pricing in Ho Chi Minh City. Pricing is only shown when maintained by NupsBox; otherwise please enquire.'}
};

export function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  return createStaticPageMetadata(params, 'pricing', copy);
}

export default function Layout({children}: {children: ReactNode}) { return children; }
