import {expect, test} from '@playwright/test';

test('homepage exposes a clear discovery-to-finder funnel', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {level: 1})).toContainText(/không gian|space/i);
  const primary = page.getByRole('link', {name: /tìm kho phù hợp/i}).first();
  await expect(primary).toHaveAttribute('href', /#storage-finder$/);
  await primary.click();
  await expect(page.locator('#storage-finder')).toBeInViewport();
  await expect(page.getByRole('heading', {name: /kho nào phù hợp/i})).toBeVisible();
});
