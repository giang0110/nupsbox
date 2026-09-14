import type {ReactNode} from 'react';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const copy = {
  vi: {title: 'Blog NupsBox', description: 'Kiến thức và hướng dẫn về kho mini, sắp xếp hàng hóa và tối ưu không gian lưu trữ cho kinh doanh.'},
  en: {title: 'NupsBox blog', description: 'Guides and practical information about mini storage, inventory organization and making better use of storage space.'}
};

export function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  return createStaticPageMetadata(params, 'blog', copy);
}

export default function Layout({children}: {children: ReactNode}) { return children; }
