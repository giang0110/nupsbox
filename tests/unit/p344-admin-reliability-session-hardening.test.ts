import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.44 admin reliability and session hardening', () => {
  it('checks the current auth user and active profile without caching session state', () => {
    const route = source('app/api/admin/session-state/route.ts');
    expect(route).toContain('supabase.auth.getUser()');
    expect(route).toContain("reason: 'signed_out'");
    expect(route).toContain("reason: 'forbidden'");
    expect(route).toContain("'cache-control': 'no-store, max-age=0'");
    expect(route).not.toContain('service_role');
  });

  it('revalidates admin sessions periodically and when the tab becomes active', () => {
    const monitor = source('components/admin/admin-session-monitor.tsx');
    expect(monitor).toContain('5 * 60 * 1000');
    expect(monitor).toContain("document.addEventListener('visibilitychange'");
    expect(monitor).toContain("window.addEventListener('focus'");
    expect(monitor).toContain("/auth/login?error=session_expired");
    expect(monitor).toContain("/auth/login?error=forbidden");
    expect(monitor).toContain('data.role !== expectedRole');
  });

  it('explains expired and forbidden sessions without exposing auth details', () => {
    const login = source('app/auth/login/page.tsx');
    expect(login).toContain('Phiên đăng nhập đã hết hạn');
    expect(login).toContain('không có quyền truy cập');
    expect(login).not.toContain('error.message');
  });

  it('handles transport failures in interactive CRM mutations and keeps pending guards', () => {
    for (const path of [
      'components/admin/lead-status-form.tsx',
      'components/admin/lead-assignment-form.tsx',
      'components/admin/lead-note-form.tsx'
    ]) {
      const form = source(path);
      expect(form).toContain('useTransition');
      expect(form).toContain('disabled={pending');
      expect(form).toContain('catch {');
      expect(form).toContain('Mất kết nối');
    }
  });
});
