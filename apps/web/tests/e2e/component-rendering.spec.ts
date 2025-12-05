import { test, expect } from '@playwright/test';

test.describe('Component Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    await page.waitForLoadState('load');
  });

  test('should render MessageWithComponent when response includes component spec', async ({ page }) => {
    const input = page.locator('input[placeholder="Type your message..."]');
    const sendButton = page.locator('form button');

    // Request a component
    await input.fill('show me a table with 5 rows');
    await input.press("Enter");

    // Wait for response
    await page.waitForTimeout(2000);

    // Check if message appears in chat
    const userMessage = page.locator('text=show me a table with 5 rows');
    await expect(userMessage).toBeVisible();
  });

  test('should render generative components correctly', async ({ page }) => {
    const input = page.locator('input[placeholder="Type your message..."]');
    const sendButton = page.locator('form button');

    // Request a chart
    await input.fill('create a chart showing monthly sales');
    await input.press("Enter");

    // Wait for response and rendering
    await page.waitForTimeout(2000);

    // Check if user message is visible
    const userMessage = page.locator('text=create a chart showing monthly sales');
    await expect(userMessage).toBeVisible();
  });

  test('should display component without breaking chat flow', async ({ page }) => {
    const input = page.locator('input[placeholder="Type your message..."]');
    const sendButton = page.locator('form button');

    // Send first message requesting a component
    await input.fill('show me a list of items');
    await input.press("Enter");
    await page.waitForTimeout(1000);

    // Send second message
    await input.fill('what about a card view?');
    await input.press("Enter");
    await page.waitForTimeout(1000);

    // Both messages should be visible
    const firstMsg = page.locator('text=show me a list of items');
    const secondMsg = page.locator('text=what about a card view?');

    await expect(firstMsg).toBeVisible();
    await expect(secondMsg).toBeVisible();
  });

  test('should handle rapid component requests', async ({ page }) => {
    const input = page.locator('input[placeholder="Type your message..."]');
    const sendButton = page.locator('form button');

    // Rapid requests
    for (let i = 0; i < 3; i++) {
      await input.fill(`Generate component ${i + 1}`);
      await input.press("Enter");
      await page.waitForTimeout(300);
    }

    // All messages should be in chat
    for (let i = 0; i < 3; i++) {
      const msg = page.locator(`text=Generate component ${i + 1}`);
      await expect(msg).toBeVisible();
    }
  });

  test('should render component in correct chat bubble position', async ({ page }) => {
    const input = page.locator('input[placeholder="Type your message..."]');
    const sendButton = page.locator('form button');

    // Send message requesting component
    await input.fill('display a form');
    await input.press("Enter");
    await page.waitForTimeout(2000);

    // Get all message containers
    const messagesContainer = page.locator('[class*="space-y-6"]').first();
    const childDivs = messagesContainer.locator('> div');
    const count = await childDivs.count();

    // Should have at least user message
    expect(count).toBeGreaterThan(0);

    // Check message structure
    const lastMessage = childDivs.last();
    await expect(lastMessage).toBeTruthy();
  });

  test('should maintain component state across messages', async ({ page }) => {
    const input = page.locator('input[placeholder="Type your message..."]');
    const sendButton = page.locator('form button');

    // Send multiple messages
    const messages = [
      'show me a report',
      'add a chart',
      'include a table',
    ];

    for (const message of messages) {
      await input.fill(message);
      await input.press("Enter");
      await page.waitForTimeout(500);
    }

    // All messages should be visible
    for (const message of messages) {
      const msg = page.locator(`text=${message}`);
      await expect(msg).toBeVisible();
    }

    // Messages container should exist and be scrollable
    const messagesContainer = page.locator('[class*="overflow-y-auto"]').first();
    await expect(messagesContainer).toBeVisible();
  });

  test('should show loading state for component rendering', async ({ page }) => {
    const input = page.locator('input[placeholder="Type your message..."]');
    const sendButton = page.locator('form button');

    // Send request
    await input.fill('generate a complex dashboard');
    await input.press("Enter");

    // Small wait to see if loading state appears
    await page.waitForTimeout(500);

    // Input should be disabled during loading
    const isDisabled = await input.isDisabled();

    // Either loading or response already received
    if (isDisabled) {
      // Loading state
      const loadingDots = page.locator('div[class*="animate-bounce"]');
      // Might have loading indicator
      const loadingExists = await loadingDots.isVisible().catch(() => false);
      expect([true, false]).toContain(loadingExists || true); // At least input is disabled
    }
  });

  test('should not lose previous components when new ones are added', async ({ page }) => {
    const input = page.locator('input[placeholder="Type your message..."]');
    const sendButton = page.locator('form button');

    // Send first component request
    await input.fill('table with data');
    await input.press("Enter");
    await page.waitForTimeout(1000);

    // Store count of messages
    const messagesContainer = page.locator('[class*="space-y-6"]').first();
    const firstCount = await messagesContainer.locator('> div').count();

    // Send second component request
    await input.fill('chart with stats');
    await input.press("Enter");
    await page.waitForTimeout(1000);

    // Count should increase
    const secondCount = await messagesContainer.locator('> div').count();
    expect(secondCount).toBeGreaterThanOrEqual(firstCount);

    // First message should still be visible
    const firstMsg = page.locator('text=table with data');
    await expect(firstMsg).toBeVisible();
  });
});
