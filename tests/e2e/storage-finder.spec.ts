import {expect, test} from '@playwright/test';

test('keeps the legacy finder as a supporting tool on the unit-information page', async ({page}) => {
  await page.goto('/kho-mini');
  const finder = page.getByRole('region', {name: /kho nào phù hợp/i});

  await expect(finder.getByText(/bước 1/i)).toBeVisible();
  await finder.getByRole('button', {name: 'Shop online'}).click();
  await expect(finder.getByText(/bước 2/i)).toBeVisible();
  await finder.getByRole('button', {name: '≤ 20 thùng'}).click();
  await expect(finder.getByRole('heading', {name: 'Kho S'})).toBeVisible();
  await expect(finder.getByRole('link', {name: /nhận báo giá/i})).toHaveAttribute('href', /unit=s/);
  await expect(finder.getByRole('link', {name: /đặt lịch xem kho/i})).toHaveAttribute('href', /unit=s/);
});
