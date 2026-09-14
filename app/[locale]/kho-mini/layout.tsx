import type {ReactNode} from 'react';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const copy = {
  vi: {title: 'Các loại kho mini', description: 'Khám phá các loại kho mini NupsBox, diện tích, gợi ý nhu cầu và mức giá được công khai khi có dữ liệu xác thực.'},
  en: {title: 'Mini storage unit sizes', description: 'Explore NupsBox mini storage unit sizes, use guidance and pricing when maintained in the public catalog.'}
};

export function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  return createStaticPageMetadata(params, 'units', copy);
}

export default function Layout({children}: {children: ReactNode}) { return children; }
