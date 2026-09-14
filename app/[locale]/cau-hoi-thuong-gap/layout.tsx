import type {ReactNode} from 'react';
import {createStaticPageMetadata} from '@/features/seo/static-page';

const copy = {
  vi: {title: 'Câu hỏi thường gặp về kho mini', description: 'Giải đáp các câu hỏi thường gặp về kích thước kho, giá thuê, chọn diện tích và quy trình liên hệ NupsBox.'},
  en: {title: 'Mini storage frequently asked questions', description: 'Answers to common questions about unit sizes, pricing, choosing space and contacting NupsBox.'}
};

export function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  return createStaticPageMetadata(params, 'faq', copy);
}

export default function Layout({children}: {children: ReactNode}) { return children; }
