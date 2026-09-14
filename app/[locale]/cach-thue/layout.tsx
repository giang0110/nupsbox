import type {ReactNode} from 'react';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const copy = {
  vi: {title: 'Cách thuê kho NupsBox', description: 'Quy trình tìm loại kho, gửi nhu cầu, xác nhận thông tin và bắt đầu thuê kho mini NupsBox tại TP.HCM.'},
  en: {title: 'How to rent NupsBox storage', description: 'How to choose a unit, send your needs, confirm details and start renting NupsBox mini storage in Ho Chi Minh City.'}
};

export function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  return createStaticPageMetadata(params, 'how-it-works', copy);
}

export default function Layout({children}: {children: ReactNode}) { return children; }
