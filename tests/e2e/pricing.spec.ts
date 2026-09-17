import {expect, test} from '@playwright/test';

test('pricing page explains uncertainty and keeps finder primary', async ({page}) => {
  await page.goto('/bang-gia');
  await expect(page.getByRole('heading', {level: 1, name: /bảng giá kho mini/i})).toBeVisible();
  await expect(page.getByText(/liên hệ báo giá/i).first()).toBeVisible();
  await expect(page.getByRole('link', {name: /tìm kho phù hợp/i}).first()).toBeVisible();
  await expect(page.getByText(/yếu tố ảnh hưởng đến giá/i)).toBeVisible();
});
