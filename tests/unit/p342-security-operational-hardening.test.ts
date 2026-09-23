import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('P3.42 security and operational hardening', () => {
  it('ships a restrictive CSP without opening arbitrary remote origins', () => {
    const config = source('next.config.ts');

    expect(config).toContain("default-src 'self'");
    expect(config).toContain("frame-ancestors 'none'");
    expect(config).toContain("object-src 'none'");
    expect(config).toContain("connect-src 'self' https://*.supabase.co wss://*.supabase.co");
    expect(config).toContain('https://veglohnmofzkgovedxkb.supabase.co');
    expect(config).not.toContain('img-src *');
    expect(config).not.toContain('connect-src *');
  });

  it('pins the supported Node line and reviewed install-script dependencies', () => {
    const pkg = JSON.parse(source('package.json')) as {
      engines?: {node?: string};
      packageManager?: string;
      allowScripts?: Record<string, boolean>;
    };

    expect(pkg.engines?.node).toBe('>=24.21.0 <25');
    expect(pkg.packageManager).toBe('npm@11.19.0');
    expect(pkg.allowScripts).toEqual({
      '@parcel/watcher@2.6.0': true,
      '@swc/core@1.16.2': true,
      'unrs-resolver@1.12.2': true
    });
  });

  it('uses an explicit ESM Vitest config compatible with native config loading', () => {
    expect(() => source('vitest.config.mts')).not.toThrow();
    expect(() => source('vitest.config.ts')).toThrow();
    expect(source('vitest.config.mts')).toContain('import.meta.dirname');
  });
});
