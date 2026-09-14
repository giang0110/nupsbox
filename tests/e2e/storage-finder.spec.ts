import {expect, test} from '@playwright/test';

test('recommends Kho S for a small online shop need', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Shop online'}).click();
  await page.getByRole('button', {name: '≤ 20 thùng'}).click();
  await expect(page.getByRole('heading', {name: 'Kho S'})).toBeVisible();
  await expect(page.getByRole('link', {name: /Xem Kho S/i})).toHaveAttribute('href', '/kho-mini/s');
});
