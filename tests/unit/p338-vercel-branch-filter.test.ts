import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

describe('P3.38 Vercel branch deployment filter', () => {
  it('disables every preview branch including slash-named branches while keeping main enabled', () => {
    const config = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8'));
    expect(config.git?.deploymentEnabled?.['**']).toBe(false);
    expect(config.git?.deploymentEnabled?.main).toBe(true);
    expect(config.git?.deploymentEnabled?.['*']).toBeUndefined();
  });
});
