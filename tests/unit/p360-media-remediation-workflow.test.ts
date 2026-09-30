import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  getMediaIdsForRemediation,
  parseMediaRemediationIssue,
  type MediaReadinessSummary
} from '@/features/admin/media-readiness';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

const summary: MediaReadinessSummary = {
  totalContexts: 4,
  coveredContexts: 2,
  missingContexts: 2,
  score: 50,
  weakAltCount: 1,
  brokenMappingCount: 2,
  overusedMediaCount: 1,
  weakAltMediaIds: ['weak'],
  brokenMappingIds: ['link-private', 'link-missing'],
  brokenMappingMediaIds: ['private'],
  items: [],
  overusedMedia: [{mediaId: 'shared', label: 'Shared image', usageCount: 4}]
};

describe('P3.60 media remediation workflow', () => {
  it('validates supported remediation queue names', () => {
    expect(parseMediaRemediationIssue('weak-alt')).toBe('weak-alt');
    expect(parseMediaRemediationIssue('broken-mapping')).toBe('broken-mapping');
    expect(parseMediaRemediationIssue('overused')).toBe('overused');
    expect(parseMediaRemediationIssue('anything-else')).toBeNull();
  });

  it('resolves exact media ids for each remediation queue', () => {
    expect([...getMediaIdsForRemediation(summary, 'weak-alt')!]).toEqual(['weak']);
    expect([...getMediaIdsForRemediation(summary, 'broken-mapping')!]).toEqual(['private']);
    expect([...getMediaIdsForRemediation(summary, 'overused')!]).toEqual(['shared']);
    expect(getMediaIdsForRemediation(summary, null)).toBeNull();
  });

  it('wires query-driven queues and deep-link anchors into Admin Media', () => {
    const page = source('app/admin/content/media/page.tsx');
    const dashboard = source('components/admin/media-readiness-dashboard.tsx');

    expect(page).toContain('parseMediaRemediationIssue');
    expect(page).toContain('getMediaIdsForRemediation');
    expect(page).toContain('id="media-upload"');
    expect(page).toContain('id="media-library"');
    expect(page).toContain("linkFilter={activeIssue === 'broken-mapping' ? 'broken' : 'all'}");

    expect(dashboard).toContain('?issue=weak-alt#media-library');
    expect(dashboard).toContain('?issue=broken-mapping#editorial-media-mapping');
    expect(dashboard).toContain('?issue=overused#media-library');
  });

  it('preselects editorial remediation targets and blocks new private mappings', () => {
    const readiness = source('features/admin/media-readiness.ts');
    const editorial = source('components/admin/media-editorial-manager.tsx');

    expect(readiness).toContain('encodeURIComponent');
    expect(readiness).toContain('solution:');
    expect(readiness).toContain('blog:');
    expect(editorial).toContain("media.filter(item => item.isPublic && item.publicUrl)");
    expect(editorial).toContain("defaultValue={defaultContext ?? ''}");
    expect(editorial).toContain("linkFilter === 'broken'");
  });

  it('opens highlighted remediation cards with issue-specific guidance', () => {
    const card = source('components/admin/media-metadata-form.tsx');

    expect(card).toContain('data-remediation={remediationIssue ?? undefined}');
    expect(card).toContain('open={Boolean(remediationIssue)}');
    expect(card).toContain("remediationIssue === 'weak-alt'");
    expect(card).toContain("remediationIssue === 'broken-mapping'");
    expect(card).toContain("remediationIssue === 'overused'");
  });

  it('does not add an automatic mutation or schema change', () => {
    const remediation = source('docs/superpowers/specs/2026-09-30-p360-media-remediation-workflow.md');

    expect(remediation).toContain('No automatic publish, delete, remap or metadata rewrite');
    expect(remediation).toContain('No database migration');
  });
});