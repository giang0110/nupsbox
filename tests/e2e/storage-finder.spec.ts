import {expect, test} from '@playwright/test';

test('guides a small online shop from need to recommendation and conversion', async ({page}) => {
  await page.goto('/');
  const finder = page.getByRole('region', {name: /kho nào phù hợp/i});

  await expect(finder.getByText(/bước 1/i)).toBeVisible();
  await finder.getByRole('button', {name: 'Shop online'}).click();
  await expect(finder.getByText(/bước 2/i)).toBeVisible();
  await finder.getByRole('button', {name: '≤ 20 thùng'}).click();
  await expect(finder.getByRole('heading', {name: 'Kho S'})).toBeVisible();
  await expect(finder.getByRole('link', {name: /nhận báo giá/i})).toHaveAttribute('href', /unit=s/);
  await expect(finder.getByRole('link', {name: /đặt lịch xem kho/i})).toHaveAttribute('href', /unit=s/);
});
