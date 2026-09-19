import {expect, test} from '@playwright/test';

test('mobile visitor gets a compact two-action conversion bar', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');

  const actions = page.getByRole('navigation', {name: /hành động nhanh|quick actions/i});
  await expect(actions).toBeVisible();
  await expect(actions.getByRole('link', {name: /tìm kho/i})).toBeVisible();

  const contact = actions.locator('summary').filter({hasText: /liên hệ|contact/i});
  if (await contact.count()) {
    await expect(contact).toBeVisible();
    await contact.click();
    await expect(actions.getByText(/báo giá|quote|viewing/i).first()).toBeVisible();
  } else {
    await expect(actions.getByRole('link', {name: /báo giá|quote|viewing/i})).toBeVisible();
  }
});
