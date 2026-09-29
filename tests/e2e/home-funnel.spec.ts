import {expect, test} from '@playwright/test';

test('homepage exposes a clear commercial-information discovery flow', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {level: 1})).toContainText(/NupsBox|dịch vụ|service/i);

  const primary = page.getByRole('link', {name: /khám phá dịch vụ|explore services/i}).first();
  await expect(primary).toHaveAttribute('href', /\/giai-phap$|\/solutions$/);

  await primary.click();
  await expect(page.getByRole('heading', {level: 1})).toContainText(/dịch vụ|services|storage solutions/i);
});
