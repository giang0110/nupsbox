import type {ReactNode} from 'react';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const copy = {
  vi: {title: 'Địa điểm NupsBox', description: 'Xem địa điểm kho mini NupsBox tại TP.HCM, địa chỉ và thông tin liên hệ trước khi đến xem kho.'},
  en: {title: 'NupsBox locations', description: 'View NupsBox mini storage locations in Ho Chi Minh City, addresses and contact information before visiting.'}
};

export function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  return createStaticPageMetadata(params, 'locations', copy);
}

export default function Layout({children}: {children: ReactNode}) { return children; }
