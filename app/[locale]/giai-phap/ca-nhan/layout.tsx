import type {ReactNode} from 'react';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const copy = {
  vi: {title: 'Kho mini cho nhu cầu cá nhân', description: 'Không gian kho mini linh hoạt cho đồ cá nhân, đồ theo mùa và nhu cầu cần giải phóng diện tích tại TP.HCM.'},
  en: {title: 'Mini storage for personal needs', description: 'Flexible mini storage for personal belongings, seasonal items and extra-space needs in Ho Chi Minh City.'}
};

export function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  return createStaticPageMetadata(params, 'solution:personal', copy);
}

export default function Layout({children}: {children: ReactNode}) { return children; }
