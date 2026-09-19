import {describe, expect, it} from 'vitest';
import {
  buildAdminQualityIssues,
  type AdminQualitySnapshot
} from '@/features/admin/quality';

function snapshot(overrides: Partial<AdminQualitySnapshot> = {}): AdminQualitySnapshot {
  return {
    catalog: {
      totalLocations: 1,
      activeLocations: 1,
      totalUnitTypes: 2,
      activeUnitTypes: 2,
      pricingRows: 2,
      pricingMissingMonthly: 0
    },
    media: {
      total: 3,
      publicCount: 3,
      missingAlt: 0,
      unmappedLocation: 0
    },
    blog: {
      drafts: 0,
      published: 1,
      draftWithoutCover: 0,
      draftWithoutSource: 0
    },
    contact: {
      phone: true,
      email: true,
      zalo: true,
      facebook: true
    },
    crm: {
      newOver4h: 0,
      unassignedOpen: 0,
      staleOpen: 0
    },
    ...overrides
  };
}

describe('admin quality rules', () => {
  it('returns no issues for a complete operational snapshot', () => {
    expect(buildAdminQualityIssues(snapshot())).toEqual([]);
  });

  it('prioritizes missing public catalog before lower-severity content gaps', () => {
    const issues = buildAdminQualityIssues(snapshot({
      catalog: {
        totalLocations: 0,
        activeLocations: 0,
        totalUnitTypes: 0,
        activeUnitTypes: 0,
        pricingRows: 0,
        pricingMissingMonthly: 0
      },
      media: {
        total: 0,
        publicCount: 0,
        missingAlt: 0,
        unmappedLocation: 0
      },
      blog: {
        drafts: 0,
        published: 0,
        draftWithoutCover: 0,
        draftWithoutSource: 0
      },
      contact: {
        phone: false,
        email: false,
        zalo: false,
        facebook: true
      }
    }));

    expect(issues.slice(0, 2).map(issue => issue.id)).toEqual([
      'active-location-missing',
      'active-unit-type-missing'
    ]);
    expect(issues.map(issue => issue.id)).toContain('media-empty');
    expect(issues.map(issue => issue.id)).toContain('direct-contact-missing');
    expect(issues.map(issue => issue.id)).toContain('published-blog-empty');
  });

  it('flags CRM follow-up thresholds without changing the seven-status model', () => {
    const issues = buildAdminQualityIssues(snapshot({
      crm: {
        newOver4h: 2,
        unassignedOpen: 3,
        staleOpen: 4
      }
    }));

    expect(issues.map(issue => [issue.id, issue.count])).toEqual([
      ['new-leads-over-4h', 2],
      ['open-leads-unassigned', 3],
      ['stale-open-leads', 4]
    ]);
  });

  it('marks blog drafts for review when cover or source metadata is incomplete', () => {
    const issues = buildAdminQualityIssues(snapshot({
      blog: {
        drafts: 2,
        published: 1,
        draftWithoutCover: 1,
        draftWithoutSource: 2
      }
    }));

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      id: 'blog-drafts',
      tone: 'warning',
      count: 2
    });
    expect(issues[0].detail).toContain('1 thiếu cover');
    expect(issues[0].detail).toContain('2 chưa có source URL');
  });

  it('surfaces media quality defects only when media exists', () => {
    const issues = buildAdminQualityIssues(snapshot({
      media: {
        total: 5,
        publicCount: 0,
        missingAlt: 2,
        unmappedLocation: 3
      }
    }));

    expect(issues.map(issue => issue.id)).toEqual([
      'public-media-empty',
      'media-alt-incomplete',
      'media-location-unmapped'
    ]);
  });
});
