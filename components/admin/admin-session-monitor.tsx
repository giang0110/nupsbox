'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import type {AppRole} from '@/types/database';

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

export function AdminSessionMonitor({expectedRole}: {expectedRole: AppRole}) {
  const router = useRouter();
  const checkingRef = useRef(false);
  const failuresRef = useRef(0);
  const [degraded, setDegraded] = useState(false);

  const checkSession = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;

    try {
      const response = await fetch('/api/admin/session-state', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {'accept': 'application/json'}
      });

      if (response.status === 401) {
        router.replace('/auth/login?error=session_expired');
        router.refresh();
        return;
      }

      if (response.status === 403) {
        router.replace('/auth/login?error=forbidden');
        router.refresh();
        return;
      }

      if (!response.ok) throw new Error('session_check_failed');

      const data = await response.json() as {ok?: boolean; role?: AppRole};
      failuresRef.current = 0;
      setDegraded(false);

      if (!data.ok || !data.role) throw new Error('invalid_session_response');
      if (data.role !== expectedRole) {
        router.refresh();
      }
    } catch {
      failuresRef.current += 1;
      if (failuresRef.current >= 2) setDegraded(true);
    } finally {
      checkingRef.current = false;
    }
  }, [expectedRole, router]);

  useEffect(() => {
    const interval = window.setInterval(() => void checkSession(), CHECK_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void checkSession();
    };
    const onFocus = () => void checkSession();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [checkSession]);

  if (!degraded) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-40 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-bold text-amber-900"
    >
      Kết nối xác minh phiên quản trị đang gián đoạn. Tránh thao tác quan trọng cho đến khi kết nối ổn định.
    </div>
  );
}
