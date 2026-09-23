import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {prepareAdminUserAccessUpdate} from '@/features/admin/user-access';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.49 admin user and role management', () => {
  it('allows only admins with roles:update to prepare access changes', () => {
    expect(
      prepareAdminUserAccessUpdate('admin', {
        id: '10000000-0000-4000-8000-000000000001',
        fullName: 'Nguyen Van A',
        role: 'staff',
        active: true
      })
    ).toEqual({
      id: '10000000-0000-4000-8000-000000000001',
      changes: {
        full_name: 'Nguyen Van A',
        role: 'staff',
        active: true
      }
    });

    expect(() =>
      prepareAdminUserAccessUpdate('staff', {
        id: '10000000-0000-4000-8000-000000000001',
        fullName: '',
        role: 'admin',
        active: true
      })
    ).toThrow('forbidden');
  });

  it('normalizes blank names and rejects invalid roles', () => {
    expect(
      prepareAdminUserAccessUpdate('admin', {
        id: '10000000-0000-4000-8000-000000000001',
        fullName: '   ',
        role: 'viewer',
        active: false
      }).changes.full_name
    ).toBeNull();

    expect(() =>
      prepareAdminUserAccessUpdate('admin', {
        id: '10000000-0000-4000-8000-000000000001',
        fullName: '',
        role: 'owner',
        active: true
      })
    ).toThrow();
  });

  it('guards self-lockout, stale writes and last-admin loss in the server action', () => {
    const action = source('app/admin/users/actions.ts');
    expect(action).toContain('targetId === session.user.id');
    expect(action).toContain("requireExpectedUpdatedAt(formData.get('expectedUpdatedAt'))");
    expect(action).toContain(".eq('updated_at', expectedUpdatedAt)");
    expect(action).toContain("current.role === 'admin'");
    expect(action).toContain("eq('role', 'admin')");
    expect(action).toContain('last_active_admin_required');
  });

  it('keeps Auth Admin API server-only and degrades safely without service role', () => {
    const feature = source('features/admin/users.ts');
    expect(feature).toContain("import 'server-only'");
    expect(feature).toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(feature).toContain('auth.admin.listUsers');
    expect(feature).toContain('authDirectoryAvailable');
  });

  it('adds an admin-only users route and database defense-in-depth', () => {
    const nav = source('features/admin/navigation.ts');
    const migration = source('supabase/migrations/20260923050000_p349_admin_user_role_management.sql');
    expect(nav).toContain("'/admin/users'");
    expect(nav).toContain("'roles:update'");
    expect(migration).toContain('profiles_protect_last_active_admin');
    expect(migration).toContain('profiles_audit_access_change');
  });
});
