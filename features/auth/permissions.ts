import type {AppRole} from '@/types/database';

export type AppAction =
  | 'dashboard:read'
  | 'audit:read'
  | 'leads:read'
  | 'leads:update'
  | 'leads:assign'
  | 'leads:note'
  | 'leads:export'
  | 'catalog:read'
  | 'catalog:create'
  | 'catalog:update'
  | 'catalog:publish'
  | 'content:read'
  | 'content:create'
  | 'content:update'
  | 'content:publish'
  | 'media:read'
  | 'media:create'
  | 'media:update'
  | 'media:delete'
  | 'settings:read'
  | 'settings:update'
  | 'roles:update';

const permissions: Record<AppRole, ReadonlySet<AppAction>> = {
  admin: new Set<AppAction>([
    'dashboard:read',
    'audit:read',
    'leads:read',
    'leads:update',
    'leads:assign',
    'leads:note',
    'leads:export',
    'catalog:read',
    'catalog:create',
    'catalog:update',
    'catalog:publish',
    'content:read',
    'content:create',
    'content:update',
    'content:publish',
    'media:read',
    'media:create',
    'media:update',
    'media:delete',
    'settings:read',
    'settings:update',
    'roles:update'
  ]),
  staff: new Set<AppAction>([
    'dashboard:read',
    'leads:read',
    'leads:update',
    'leads:assign',
    'leads:note',
    'catalog:read',
    'catalog:create',
    'catalog:update',
    'catalog:publish',
    'content:read',
    'content:create',
    'content:update',
    'content:publish',
    'media:read',
    'media:create',
    'media:update',
    'settings:read'
  ]),
  viewer: new Set<AppAction>([
    'dashboard:read',
    'leads:read',
    'catalog:read',
    'content:read',
    'media:read',
    'settings:read'
  ])
};

export function can(role: AppRole, action: AppAction): boolean {
  return permissions[role].has(action);
}
