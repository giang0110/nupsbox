import {expect, test} from '@playwright/test';

test('general contact form hides storage questions until storage advice is selected', async ({page}) => {
  await page.goto('/lien-he');
  await expect(page.getByLabel(/bạn muốn liên hệ về/i)).toBeVisible();
  await expect(page.getByLabel(/bạn cần kho cho/i)).toHaveCount(0);
  await expect(page.getByLabel(/lượng hàng ước tính/i)).toHaveCount(0);

  await page.getByLabel(/bạn muốn liên hệ về/i).selectOption('storage');
  await expect(page.getByLabel(/bạn cần kho cho/i)).toBeVisible();
  await expect(page.getByLabel(/lượng hàng ước tính/i)).toBeVisible();
});

test('quote context preserves selected unit without exposing storage-volume questions', async ({page}) => {
  await page.goto('/lien-he?unit=s&inquiry=quote');
  await expect(page.getByText(/Kho S/i)).toBeVisible();
  await expect(page.getByLabel(/bạn muốn liên hệ về/i)).toHaveValue('quote');
  await expect(page.getByLabel(/bạn cần kho cho/i)).toHaveCount(0);
  await expect(page.getByLabel(/lượng hàng ước tính/i)).toHaveCount(0);
  await expect(page.getByLabel(/tên/i)).toHaveAttribute('required', '');
  await expect(page.getByLabel(/số điện thoại/i)).toHaveAttribute('required', '');
  await expect(page.getByLabel(/^Email/)).not.toHaveAttribute('required', '');
});

test('viewing flow clearly says the requested time is not a reservation', async ({page}) => {
  await page.goto('/dat-kho?unit=s&location=tan-phu');
  await expect(page.getByText(/Kho S/i)).toBeVisible();
  await page.getByLabel(/đề xuất thời gian xem kho/i).check();
  await expect(page.getByText(/Thời gian này là đề xuất.*không phải giữ chỗ|This time is a request.*not a storage reservation/i)).toBeVisible();
});
