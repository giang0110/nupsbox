import type {ReactNode} from 'react';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const copy = {
  vi: {title: 'Kho mini để chứa hàng', description: 'Kho mini NupsBox cho nhu cầu chứa hàng, hàng dự phòng và tồn kho cần thêm không gian tại TP.HCM.'},
  en: {title: 'Mini storage for inventory', description: 'NupsBox mini storage for stock, overflow inventory and goods that need extra space in Ho Chi Minh City.'}
};

export function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  return createStaticPageMetadata(params, 'solution:inventory', copy);
}

export default function Layout({children}: {children: ReactNode}) { return children; }
