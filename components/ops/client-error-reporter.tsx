'use client';

import {useEffect} from 'react';

export function ClientErrorReporter({
  scope,
  digest
}: {
  scope: 'public' | 'admin' | 'global';
  digest?: string;
}) {
  useEffect(() => {
    const path = window.location.pathname;
    void fetch('/api/telemetry/client-errors', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({scope, digest: digest ?? null, path}),
      credentials: 'omit',
      keepalive: true
    }).catch(() => {
      // Error telemetry must never interfere with recovery UI.
    });
  }, [scope, digest]);

  return null;
}
