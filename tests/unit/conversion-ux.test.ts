import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('compact conversion UX', () => {
  it('keeps the mobile quick-action bar on one row when contact is available', () => {
    const bar = source('components/marketing/mobile-action-bar.tsx');

    expect(bar).toContain("contactAction ? 'grid-cols-3' : 'grid-cols-2'");
    expect(bar).not.toContain('col-span-2');
    expect(bar).toContain("'Hành động nhanh'");
    expect(bar).toContain("'Quick actions'");
  });

  it('tracks the existing lead_submit event rather than mutating the API payload contract', () => {
    const form = source('components/forms/lead-form.tsx');

    expect(form).toContain("trackEvent('lead_submit'");
    expect(form).toContain('const formElement = event.currentTarget');
    expect(form).toContain('formElement.reset()');
    expect(form).toContain('feedbackRef.current?.focus()');
  });
});
