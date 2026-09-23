import {z} from 'zod';
import {requirePermission} from '@/features/admin/mutation-guard';
import type {AppRole} from '@/types/database';

export const adminUserRoles = ['admin', 'staff', 'viewer'] as const;

const UserAccessInputSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().trim().max(120),
  role: z.enum(adminUserRoles),
  active: z.boolean()
});

export function prepareAdminUserAccessUpdate(
  actorRole: AppRole,
  input: {
    id: unknown;
    fullName: unknown;
    role: unknown;
    active: boolean;
  }
) {
  requirePermission(actorRole, 'roles:update');
  const parsed = UserAccessInputSchema.parse(input);

  return {
    id: parsed.id,
    changes: {
      full_name: parsed.fullName || null,
      role: parsed.role as AppRole,
      active: parsed.active
    }
  };
}
