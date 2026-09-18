import {expect, test} from '@playwright/test';

test('mobile visitor gets an honest persistent conversion bar', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');

  const actions = page.getByRole('navigation', {name: /hành động nhanh|quick actions/i});
  await expect(actions).toBeVisible();
  await expect(actions.getByRole('link', {name: /tìm kho/i})).toBeVisible();
  await expect(actions.getByRole('link', {name: /báo giá|liên hệ/i})).toBeVisible();
  await expect(actions.getByRole('link', {name: /zalo/i})).toHaveCount(0);
  await expect(actions.getByRole('link', {name: /gọi/i})).toHaveCount(0);
});
