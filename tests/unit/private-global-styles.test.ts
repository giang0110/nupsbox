import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('private route global styles', () => {
  it('loads the shared Tailwind/global stylesheet for admin routes', () => {
    expect(source('app/admin/layout.tsx')).toContain("import '../globals.css';");
  });

  it('loads the shared Tailwind/global stylesheet for auth routes', () => {
    expect(source('app/auth/layout.tsx')).toContain("import '../globals.css';");
  });
});
