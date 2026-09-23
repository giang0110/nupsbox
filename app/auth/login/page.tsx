import {PRIVATE_AREA_METADATA} from '@/features/seo/private-metadata';
import {LoginForm} from './login-form';

export const metadata = PRIVATE_AREA_METADATA;

const errorCopy: Record<string, string> = {
  session_expired: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.',
  forbidden: 'Tài khoản hiện không có quyền truy cập khu vực quản trị.'
};

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{error?: string | string[]}>;
}) {
  const params = await searchParams;
  const code = Array.isArray(params.error) ? params.error[0] : params.error;
  const message = code ? errorCopy[code] : undefined;

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--nupsbox-surface)] px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[var(--nupsbox-border)] bg-white p-7 shadow-[var(--nupsbox-shadow)] sm:p-10">
        <p className="text-sm font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">NUPSBOX ADMIN</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[var(--nupsbox-navy)]">Đăng nhập quản trị</h1>
        {message ? (
          <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900">
            {message}
          </p>
        ) : null}
        <LoginForm />
      </section>
    </main>
  );
}
