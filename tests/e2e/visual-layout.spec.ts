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

    const hero = page.getByRole('region', {name: /không gian vừa đủ|right amount of space/i});
    const header = page.locator('header').first();
    const heading = hero.getByRole('heading', {level: 1});
    const primary = hero.getByRole('link', {name: /tìm kho phù hợp/i});
    const secondary = hero.getByRole('link', {name: /xem bảng giá|xem hình ảnh thực tế|view pricing|view real facility photos/i});
    const trust = hero.getByText(/ảnh thực tế|real photos/i);

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


test('finder keeps a lighter hierarchy and practical desktop footprint', async ({page}) => {
  await page.setViewportSize({width: 1366, height: 768});
  await page.goto('/');

  const finder = page.getByRole('region', {name: /kho nào phù hợp/i});
  const heading = finder.getByRole('heading', {name: /kho nào phù hợp/i});
  const finderBox = await finder.boundingBox();

  await expect(heading).not.toHaveClass(/font-black/);
  expect(finderBox?.height ?? 9999).toBeLessThan(720);

  const firstChoice = finder.getByRole('button', {name: /shop online/i});
  await firstChoice.focus();
  await page.keyboard.press('Enter');
  await expect(firstChoice).toHaveAttribute('aria-pressed', 'true');
});


for (const route of ['/kho-mini', '/bang-gia', '/dia-diem']) {
  test(`${route} uses the compact premium page-intro hierarchy`, async ({page}) => {
    await page.setViewportSize({width: 1366, height: 768});
    await page.goto(route);

    const heading = page.locator('h1:visible');
    const box = await heading.boundingBox();

    await expect(heading).not.toHaveClass(/font-black/);
    expect(box?.y ?? 999).toBeLessThan(250);
  });
}


for (const route of ['/lien-he', '/dat-kho']) {
  test(`${route} keeps its conversion intro compact on laptop viewports`, async ({page}) => {
    await page.setViewportSize({width: 1366, height: 768});
    await page.goto(route);

    const heading = page.locator('h1:visible');
    const firstField = page.getByLabel(/tên/i);
    const headingBox = await heading.boundingBox();
    const fieldBox = await firstField.boundingBox();

    await expect(heading).not.toHaveClass(/font-black/);
    expect(headingBox?.y ?? 999).toBeLessThan(260);
    expect(fieldBox?.y ?? 999).toBeLessThan(760);
  });
}


for (const route of ['/lien-he', '/dat-kho']) {
  test(`${route} keeps the conversion form within the first desktop viewport`, async ({page}) => {
    await page.setViewportSize({width: 1366, height: 768});
    await page.goto(route);

    const heading = page.locator('h1:visible');
    const firstField = page.getByLabel(/tên/i);
    const headingBox = await heading.boundingBox();
    const fieldBox = await firstField.boundingBox();

    expect(headingBox?.y ?? 999).toBeLessThan(300);
    expect(fieldBox?.y ?? 999).toBeLessThan(760);
  });
}


test('mobile sticky chrome does not cover the homepage content', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');

  const header = page.locator('header').first();
  const heading = page.getByRole('heading', {level: 1});
  const actionBar = page.getByRole('navigation', {name: /hành động nhanh|quick actions/i});

  const headerBox = await header.boundingBox();
  const headingBox = await heading.boundingBox();
  const actionBox = await actionBar.boundingBox();

  expect(headerBox?.height ?? 999).toBeLessThanOrEqual(68);
  expect(headingBox?.y ?? 0).toBeGreaterThanOrEqual((headerBox?.height ?? 0) - 2);
  expect((actionBox?.y ?? 0) + (actionBox?.height ?? 0)).toBeLessThanOrEqual(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});

test('tablet homepage remains overflow-free with readable hierarchy', async ({page}) => {
  await page.setViewportSize({width: 768, height: 1024});
  await page.goto('/');

  await expect(page.getByRole('heading', {level: 1})).toBeVisible();
  await expect(page.getByRole('link', {name: /tìm kho phù hợp/i}).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});


test('homepage hero stays complete in a low-height desktop viewport', async ({page}) => {
  const viewport = {width: 1536, height: 670};
  await page.setViewportSize(viewport);
  await page.goto('/');

  const hero = page.getByRole('region', {name: /không gian vừa đủ|right amount of space/i});
  const heading = hero.getByRole('heading', {level: 1});
  const description = hero.locator('p').filter({hasText: /Kho mini linh hoạt|Flexible mini storage/i}).first();
  const primary = hero.getByRole('link', {name: /tìm kho phù hợp/i});
  const secondary = hero.getByRole('link', {name: /xem bảng giá|xem hình ảnh thực tế|view pricing|view real facility photos/i});
  const trust = hero.getByText(/ảnh thực tế|real photos/i);

  const headingBox = await heading.boundingBox();
  const descriptionBox = await description.boundingBox();
  const primaryBox = await primary.boundingBox();
  const secondaryBox = await secondary.boundingBox();
  const trustBox = await trust.boundingBox();

  expect(headingBox?.height ?? 999).toBeLessThan(260);
  expect((descriptionBox?.y ?? 999) + (descriptionBox?.height ?? 999)).toBeLessThan(viewport.height);
  expect((primaryBox?.y ?? 999) + (primaryBox?.height ?? 999)).toBeLessThan(viewport.height);
  expect((secondaryBox?.y ?? 999) + (secondaryBox?.height ?? 999)).toBeLessThan(viewport.height);
  expect((trustBox?.y ?? 999) + (trustBox?.height ?? 999)).toBeLessThanOrEqual(viewport.height);
});
