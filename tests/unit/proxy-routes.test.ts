import {describe, expect, it} from 'vitest';
import {shouldUseI18nRouting} from '@/lib/routing/i18n-route';

describe('proxy route classification', () => {
  it('bypasses locale routing for auth and admin routes', () => {
    expect(shouldUseI18nRouting('/auth/login')).toBe(false);
    expect(shouldUseI18nRouting('/auth/callback')).toBe(false);
    expect(shouldUseI18nRouting('/admin')).toBe(false);
    expect(shouldUseI18nRouting('/admin/leads')).toBe(false);
  });

  it('keeps locale routing for public marketing routes', () => {
    expect(shouldUseI18nRouting('/')).toBe(true);
    expect(shouldUseI18nRouting('/kho-mini')).toBe(true);
    expect(shouldUseI18nRouting('/en/pricing')).toBe(true);
  });
});
