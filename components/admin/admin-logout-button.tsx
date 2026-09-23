'use client';

import {LogOut} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import clsx from 'clsx';
import {createSupabaseBrowserClient} from '@/lib/supabase/browser';

export function AdminLogoutButton({collapsed = false}: {collapsed?: boolean}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function logout() {
    if (pending) return;
    setPending(true);
    setError(false);

    const supabase = createSupabaseBrowserClient();
    const {error: signOutError} = await supabase.auth.signOut();

    if (signOutError) {
      setError(true);
      setPending(false);
      return;
    }

    router.replace('/auth/login');
    router.refresh();
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={logout}
        disabled={pending}
        title={collapsed ? 'Đăng xuất' : undefined}
        aria-label={collapsed ? 'Đăng xuất' : undefined}
        className={clsx(
          'flex min-h-11 w-full items-center rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm font-bold text-[var(--nupsbox-navy)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nupsbox-blue)]',
          collapsed && 'justify-center px-2'
        )}
      >
        <LogOut className={clsx('size-[17px] shrink-0', !collapsed && 'mr-3')} aria-hidden="true" />
        <span className={clsx(collapsed && 'sr-only')}>
          {pending ? 'Đang đăng xuất…' : 'Đăng xuất'}
        </span>
      </button>
      {error ? (
        <p role="alert" className={clsx('mt-2 text-xs font-semibold text-red-700', collapsed && 'sr-only')}>
          Không thể đăng xuất. Vui lòng thử lại.
        </p>
      ) : null}
    </div>
  );
}
