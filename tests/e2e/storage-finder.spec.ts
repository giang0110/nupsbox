import {expect, test} from '@playwright/test';

test('guides a small online shop from need to recommendation and conversion', async ({page}) => {
  await page.goto('/');
  await expect(page.getByText(/bước 1/i)).toBeVisible();
  await page.getByRole('button', {name: 'Shop online'}).click();
  await expect(page.getByText(/bước 2/i)).toBeVisible();
  await page.getByRole('button', {name: '≤ 20 thùng'}).click();
  await expect(page.getByRole('heading', {name: 'Kho S'})).toBeVisible();
  await expect(page.getByRole('link', {name: /nhận báo giá/i})).toHaveAttribute('href', /unit=s/);
  await expect(page.getByRole('link', {name: /đặt lịch xem kho/i})).toHaveAttribute('href', /unit=s/);
});
