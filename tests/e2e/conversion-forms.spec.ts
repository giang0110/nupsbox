import {expect, test} from '@playwright/test';

test('quote flow shows selected context without adding required fields', async ({page}) => {
  await page.goto('/lien-he?unit=s');
  await expect(page.getByText(/Kho S/i)).toBeVisible();
  await expect(page.getByLabel(/tên/i)).toHaveAttribute('required', '');
  await expect(page.getByLabel(/số điện thoại/i)).toHaveAttribute('required', '');
  await expect(page.getByLabel(/^Email/)).not.toHaveAttribute('required', '');
});

test('viewing flow clearly says the requested time is not a reservation', async ({page}) => {
  await page.goto('/dat-kho?unit=s&location=tan-phu');
  await expect(page.getByText(/Kho S/i)).toBeVisible();
  await page.getByLabel(/đề xuất thời gian xem kho/i).check();
  await expect(page.getByText(/không phải giữ chỗ|not a reservation/i)).toBeVisible();
});
