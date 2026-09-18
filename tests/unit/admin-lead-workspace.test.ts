import {describe, expect, it} from 'vitest';
import {
  buildLeadWorkspaceHref,
  groupLeadsByStatus,
  normalizeLeadWorkspaceQuery
} from '@/features/admin/lead-workspace';

describe('lead workspace URL model', () => {
  it('normalizes view, status, assignee, source and search without inventing values', () => {
    expect(normalizeLeadWorkspaceQuery({
      view: 'pipeline',
      status: 'viewing',
      assignee: '51af3597-3eef-47a2-a008-2399be9ac8f6',
      source: 'website',
      q: '  Nguyễn An  '
    })).toEqual({
      view: 'pipeline',
      status: 'viewing',
      assignee: '51af3597-3eef-47a2-a008-2399be9ac8f6',
      source: 'website',
      q: 'Nguyễn An'
    });
  });

  it('falls back to table and drops invalid filter values', () => {
    expect(normalizeLeadWorkspaceQuery({
      view: 'grid',
      status: 'deleted',
      assignee: 'not-a-uuid',
      source: '   ',
      q: '   '
    })).toEqual({view: 'table'});
  });

  it('builds a shareable URL and omits the default table view', () => {
    expect(buildLeadWorkspaceHref(
      {view: 'pipeline', status: 'new', q: 'An'},
      {status: 'qualified'}
    )).toBe('/admin/leads?view=pipeline&status=qualified&q=An');

    expect(buildLeadWorkspaceHref(
      {view: 'table', status: 'new'},
      {status: undefined}
    )).toBe('/admin/leads');
  });
});

describe('lead pipeline grouping', () => {
  it('always exposes all seven columns in operational order', () => {
    const grouped = groupLeadsByStatus([
      {id: '1', status: 'viewing'},
      {id: '2', status: 'new'}
    ] as never);

    expect(Object.keys(grouped)).toEqual([
      'new',
      'contacted',
      'qualified',
      'viewing',
      'negotiating',
      'won',
      'lost'
    ]);
    expect(grouped.new.map((lead) => lead.id)).toEqual(['2']);
    expect(grouped.viewing.map((lead) => lead.id)).toEqual(['1']);
  });
});
