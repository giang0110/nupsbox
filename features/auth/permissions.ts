import type {AppRole} from '@/types/database';

export type AppAction =
  | 'dashboard:read'
  | 'leads:read'
  | 'leads:update'
  | 'catalog:read'
  | 'catalog:update'
  | 'content:read'
  | 'content:update'
  | 'settings:read'
  | 'settings:update'
  | 'roles:update';

const permissions: Record<AppRole, ReadonlySet<AppAction>> = {
  admin: new Set<AppAction>([
    'dashboard:read',
    'leads:read',
    'leads:update',
    'catalog:read',
    'catalog:update',
    'content:read',
    'content:update',
    'settings:read',
    'settings:update',
    'roles:update'
  ]),
  staff: new Set<AppAction>([
    'dashboard:read',
    'leads:read',
    'leads:update',
    'catalog:read',
    'catalog:update',
    'content:read',
    'content:update',
    'settings:read'
  ]),
  viewer: new Set<AppAction>(['dashboard:read', 'catalog:read', 'content:read'])
};

export function can(role: AppRole, action: AppAction): boolean {
  return permissions[role].has(action);
}
