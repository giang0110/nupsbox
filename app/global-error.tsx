'use client';

import Link from 'next/link';
import {ClientErrorReporter} from '@/components/ops/client-error-reporter';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body>
        <main style={{fontFamily: 'system-ui, sans-serif', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: '#f8fafc'}}>
          <section style={{maxWidth: '640px', width: '100%', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '28px', background: '#fff', textAlign: 'center'}}>
            <ClientErrorReporter scope="global" digest={error.digest} />
            <p style={{fontSize: '12px', fontWeight: 800, letterSpacing: '0.14em', color: '#1d4ed8'}}>NUPSBOX</p>
            <h1 style={{marginTop: '12px', fontSize: '28px', lineHeight: 1.2, color: '#0f172a'}}>Hệ thống gặp sự cố tạm thời.</h1>
            <p style={{marginTop: '12px', color: '#475569', lineHeight: 1.6}}>
              Bạn có thể thử tải lại. Nếu sự cố tiếp diễn, hãy quay lại trang chủ.
            </p>
            <div style={{marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
              <button
                type="button"
                onClick={reset}
                style={{minHeight: '44px', border: 0, borderRadius: '999px', padding: '0 20px', fontWeight: 700, background: '#1d4ed8', color: '#fff', cursor: 'pointer'}}
              >
                Thử lại
              </button>
              <Link
                href="/"
                style={{minHeight: '44px', display: 'inline-flex', alignItems: 'center', borderRadius: '999px', padding: '0 20px', fontWeight: 700, border: '1px solid #cbd5e1', color: '#0f172a', textDecoration: 'none'}}
              >
                Về trang chủ
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
