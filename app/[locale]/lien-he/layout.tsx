import type {ReactNode} from 'react';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const copy = {
  vi: {
    title: 'Liên hệ NupsBox',
    description: 'Gửi nhu cầu kho mini để NupsBox tư vấn loại kho phù hợp, xác nhận giá và thông tin địa điểm tại TP.HCM.'
  },
  en: {
    title: 'Contact NupsBox',
    description: 'Send your mini storage requirements so NupsBox can help confirm a suitable unit, current pricing and location details in Ho Chi Minh City.'
  }
};

export function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  return createStaticPageMetadata(params, 'contact', copy);
}

export default function Layout({children}: {children: ReactNode}) {
  return children;
}
