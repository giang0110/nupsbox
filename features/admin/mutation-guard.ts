import {can, type AppAction} from '@/features/auth/permissions';
import type {AppRole} from '@/types/database';

export function requirePermission(role: AppRole, action: AppAction): void {
  if (!can(role, action)) {
    throw new Error('forbidden');
  }
}
