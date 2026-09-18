import {describe, expect, it} from 'vitest';
import {
  isAllowedPublicSettingKey,
  preparePublicSiteSettingUpdate
} from '@/features/admin/settings';

const validContact = {
  key: 'public_contact',
  value: {
    phone: '0901234567',
    zalo_url: 'https://zalo.me/0901234567',
    email: 'hello@nupsbox.vn',
    facebook_url: 'https://www.facebook.com/share/1L3q7bDAfp/',
    opening_hours: {monday: '09:00-18:00'}
  },
  isPublic: true
};

describe('admin site settings CMS contracts', () => {
  it('allows only approved public business setting keys', () => {
    expect(isAllowedPublicSettingKey('public_contact')).toBe(true);
    expect(isAllowedPublicSettingKey('homepage_banner')).toBe(false);
    expect(isAllowedPublicSettingKey('service_role_key')).toBe(false);
    expect(isAllowedPublicSettingKey('api_token')).toBe(false);
  });

  it('denies staff and viewer setting updates', () => {
    expect(() => preparePublicSiteSettingUpdate('staff', validContact)).toThrow('forbidden');
    expect(() => preparePublicSiteSettingUpdate('viewer', validContact)).toThrow('forbidden');
  });

  it('accepts Facebook/email contact fields and preserves opening hours', () => {
    expect(preparePublicSiteSettingUpdate('admin', validContact)).toEqual({
      key: 'public_contact',
      value: validContact.value,
      is_public: true
    });
  });

  it('normalizes missing optional contact fields without inventing values', () => {
    expect(
      preparePublicSiteSettingUpdate('admin', {
        key: 'public_contact',
        value: {phone: '   ', zalo_url: ''},
        isPublic: true
      })
    ).toEqual({
      key: 'public_contact',
      value: {
        phone: null,
        zalo_url: null,
        email: null,
        facebook_url: null,
        opening_hours: {}
      },
      is_public: true
    });
  });

  it('rejects non-allowlisted keys, private mutation and unsafe contact URLs', () => {
    expect(() =>
      preparePublicSiteSettingUpdate('admin', {
        key: 'homepage_banner',
        value: {},
        isPublic: true
      })
    ).toThrow('setting_not_allowed');

    expect(() =>
      preparePublicSiteSettingUpdate('admin', {
        ...validContact,
        isPublic: false
      })
    ).toThrow('public_setting_required');

    expect(() =>
      preparePublicSiteSettingUpdate('admin', {
        key: 'public_contact',
        value: {facebook_url: 'javascript:alert(1)'},
        isPublic: true
      })
    ).toThrow();
  });
});
