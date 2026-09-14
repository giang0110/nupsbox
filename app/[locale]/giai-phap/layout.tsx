import type {ReactNode} from 'react';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const copy = {
  vi: {title: 'Giải pháp kho mini theo nhu cầu', description: 'Giải pháp kho mini NupsBox cho shop online, doanh nghiệp nhỏ, lưu hàng và nhu cầu cá nhân tại TP.HCM.'},
  en: {title: 'Mini storage solutions by need', description: 'NupsBox mini storage solutions for online sellers, small businesses, inventory storage and personal needs in Ho Chi Minh City.'}
};

export function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  return createStaticPageMetadata(params, 'solutions', copy);
}

export default function Layout({children}: {children: ReactNode}) { return children; }
