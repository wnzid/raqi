import { expect, test } from '@playwright/test';
test('storefront shell renders', async ({ page }) => { await page.goto('/'); await expect(page.getByRole('heading', { level: 1 })).toContainText('Footwear commerce'); });
