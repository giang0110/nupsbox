'use client';

import {useState, type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {createSupabaseBrowserClient} from '@/lib/supabase/browser';
import {Button} from '@/components/ui/button';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    const supabase = createSupabaseBrowserClient();
    const {error: signInError} = await supabase.auth.signInWithPassword({email, password});
    if (signInError) {
      setError('Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.');
      setLoading(false);
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-5">
      <label className="grid gap-2 text-sm font-semibold">
        Email
        <input name="email" type="email" autoComplete="email" required className="min-h-12 rounded-xl border border-[var(--nupsbox-border)] px-4" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Mật khẩu
        <input name="password" type="password" autoComplete="current-password" required className="min-h-12 rounded-xl border border-[var(--nupsbox-border)] px-4" />
      </label>
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" size="lg" disabled={loading}>{loading ? 'Đang đăng nhập…' : 'Đăng nhập'}</Button>
    </form>
  );
}
