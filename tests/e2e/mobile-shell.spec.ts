import {expect, test} from '@playwright/test';

test('mobile visitor sees persistent conversion actions', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');
  await expect(page.getByRole('navigation', {name: /quick actions/i})).toBeVisible();
  await expect(page.getByRole('link', {name: /zalo/i})).toBeVisible();
  await expect(page.getByRole('link', {name: /tìm kho/i})).toBeVisible();
});
