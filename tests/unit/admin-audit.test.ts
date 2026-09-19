import {describe, expect, it} from 'vitest';
import {
  auditTargetHref,
  normalizeAuditQuery,
  summarizeAuditMetadata
} from '@/features/admin/audit';

describe('admin audit contracts', () => {
  it('normalizes only safe exact filter tokens', () => {
    expect(normalizeAuditQuery({
      action: 'lead.status_changed',
      table: 'leads'
    })).toEqual({
      action: 'lead.status_changed',
      table: 'leads'
    });

    expect(normalizeAuditQuery({
      action: 'invalid token!',
      table: 'invalid table name'
    })).toEqual({});
  });

  it('summarizes only allowlisted audit metadata fields', () => {
    expect(summarizeAuditMetadata({
      from: 'new',
      to: 'contacted',
      private_field: 'must-not-render'
    })).toBe('new → contacted');

    expect(summarizeAuditMetadata({
      key: 'public_contact'
    })).toBe('key: public_contact');

    expect(summarizeAuditMetadata({
      arbitrary: 'hidden'
    })).toBeNull();
  });

  it('routes known audit targets back to their admin workspace', () => {
    const leadId = 'a8ba1e58-ece7-4a8a-844c-3b5edcbf8ab0';
    expect(auditTargetHref('leads', leadId)).toBe('/admin/leads/' + leadId);
    expect(auditTargetHref('media_assets', null)).toBe('/admin/content/media');
    expect(auditTargetHref('blog_translations', null)).toBe('/admin/content/blog');
    expect(auditTargetHref('unknown_table', null)).toBeNull();
  });
});
