import {expect, test} from '@playwright/test';

const routes = [
  '/', '/kho-mini', '/bang-gia', '/dia-diem', '/giai-phap/shop-online',
  '/giai-phap/doanh-nghiep-nho', '/giai-phap/chua-hang', '/giai-phap/ca-nhan',
  '/cach-thue', '/ve-nupsbox', '/cau-hoi-thuong-gap', '/lien-he'
];

for (const route of routes) {
  test(`${route} renders one primary heading without mobile horizontal overflow`, async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('h1:visible')).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });
}

test('header exposes the finder as the primary public action', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('link', {name: /tìm kho phù hợp/i}).first()).toHaveAttribute('href', /#storage-finder$/);
});

test('solution page keeps one clear finder next action', async ({page}) => {
  await page.goto('/giai-phap/shop-online');
  await expect(page.getByRole('heading', {level: 1})).toHaveCount(1);
  await expect(page.getByRole('link', {name: /tìm kho phù hợp/i}).last()).toBeVisible();
});

test('English pricing route renders localized heading', async ({page}) => {
  await page.goto('/en/pricing');
  await expect(page.getByRole('heading', {level: 1, name: 'Mini storage pricing'})).toBeVisible();
});
