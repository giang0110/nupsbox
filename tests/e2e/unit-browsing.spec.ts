import {expect, test} from '@playwright/test';

test('unit browsing can compare listed storage types without inventing data', async ({page}) => {
  await page.goto('/kho-mini');
  const compareChoices = page.getByLabel(/thêm vào so sánh/i);
  await expect(compareChoices).toHaveCount(2);
  await compareChoices.nth(0).check();
  await compareChoices.nth(1).check();
  await expect(page.getByRole('heading', {name: /đặt các lựa chọn cạnh nhau/i})).toBeVisible();
  await expect(page.getByText('Kho S').last()).toBeVisible();
  await expect(page.getByText('Kho M').last()).toBeVisible();
  await expect(page.getByText(/liên hệ báo giá/i).first()).toBeVisible();
});
