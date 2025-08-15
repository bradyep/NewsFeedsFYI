import { test, expect } from '@playwright/test';

test.describe('Example E2E Tests', () => {
  test('should load the application', async ({ page }) => {
    // This test will only work if your client is running on localhost:3030
    await page.goto('/');
    
    // Basic check that the page loads
    await expect(page).toHaveTitle(/newsfeeds/i);
  });
  
  test('should display some basic UI elements', async ({ page }) => {
    await page.goto('/');
    
    // Check for some basic elements that should exist
    // Update these selectors based on your actual application
    await expect(page.locator('body')).toBeVisible();
  });
});
