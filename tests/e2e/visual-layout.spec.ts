import {expect, test} from '@playwright/test';

const desktopViewports = [
  {width: 1366, height: 768},
  {width: 1440, height: 900},
  {width: 1536, height: 864}
];

for (const viewport of desktopViewports) {
  test(`homepage hero completes its narrative at ${viewport.width}x${viewport.height}`, async ({page}) => {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const hero = page.getByRole('region', {name: /thêm không gian|more room/i});
    const header = page.locator('header').first();
    const heading = hero.getByRole('heading', {level: 1});
    const primary = hero.getByRole('link', {name: /tìm kho phù hợp/i});
    const secondary = hero.getByRole('link', {name: /xem bảng giá/i});
    const trust = hero.getByText(/kho riêng/i);

    const headerBox = await header.boundingBox();
    const headingBox = await heading.boundingBox();
    const primaryBox = await primary.boundingBox();
    const secondaryBox = await secondary.boundingBox();
    const trustBox = await trust.boundingBox();

    expect(headerBox?.height ?? 999).toBeLessThanOrEqual(68);
    expect(headingBox?.y ?? 999).toBeGreaterThanOrEqual(headerBox?.height ?? 0);
    expect(primaryBox?.y ?? 999).toBeLessThan(viewport.height);
    expect(secondaryBox?.y ?? 999).toBeLessThan(viewport.height);
    expect((trustBox?.y ?? 999) + (trustBox?.height ?? 999)).toBeLessThanOrEqual(viewport.height);
  });
}

test('homepage reserves black weight for the primary display hierarchy', async ({page}) => {
  await page.setViewportSize({width: 1440, height: 900});
  await page.goto('/');

  const legacyHeavySectionHeadings = await page.locator('main h2.font-black:visible').evaluateAll(
    (headings) => headings.filter((heading) => !heading.closest('article') && !heading.closest('#storage-finder')).length
  );
  expect(legacyHeavySectionHeadings).toBe(0);
});

test('homepage stays free of horizontal overflow on desktop', async ({page}) => {
  await page.setViewportSize({width: 1366, height: 768});
  await page.goto('/');

  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});
