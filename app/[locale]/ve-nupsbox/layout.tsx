import type {ReactNode} from 'react';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const copy = {
  vi: {title: 'Về NupsBox', description: 'Tìm hiểu NupsBox và định hướng cung cấp kho mini linh hoạt cho nhu cầu kinh doanh và lưu trữ tại TP.HCM.'},
  en: {title: 'About NupsBox', description: 'Learn about NupsBox and its focus on flexible mini storage for business and storage needs in Ho Chi Minh City.'}
};

export function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  return createStaticPageMetadata(params, 'about', copy);
}

export default function Layout({children}: {children: ReactNode}) { return children; }
