import {expect, test} from '@playwright/test';

test('single-location page does not pretend multiple branches exist', async ({page}) => {
  await page.goto('/dia-diem');
  await expect(page.getByRole('heading', {level: 1})).toBeVisible();
  await expect(page.getByRole('link', {name: /đặt lịch xem kho/i})).toHaveAttribute('href', /location=tan-phu/);
  await expect(page.getByText(/chi nhánh 2|branch 2/i)).toHaveCount(0);
});

test('location detail keeps viewing context explicit', async ({page}) => {
  await page.goto('/dia-diem/tan-phu');
  await expect(page.getByRole('heading', {level: 1, name: /NupsBox Tân Phú/i})).toBeVisible();
  await expect(page.getByRole('link', {name: /đặt lịch xem kho/i})).toHaveAttribute('href', /location=tan-phu/);
});
