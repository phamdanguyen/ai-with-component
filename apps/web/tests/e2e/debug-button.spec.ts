import { test, expect } from '@playwright/test';

test.describe('Debug: Button Enable Issue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    await page.waitForLoadState('load');
  });

  test('diagnose button enable with fill()', async ({ page }) => {
    const input = page.locator('input[placeholder="Type your message..."]');
    const sendButton = page.locator('button:has-text("Send")');

    console.log('1. Initial state:');
    console.log('  Input value:', await input.inputValue());
    console.log('  Button disabled:', await sendButton.isDisabled());

    console.log('\n2. Using fill() method:');
    await input.fill('test message');
    console.log('  Input value after fill():', await input.inputValue());
    await page.waitForTimeout(100);
    console.log('  Button disabled after fill():', await sendButton.isDisabled());

    console.log('\n3. Checking if onChange was triggered:');
    const inputValue = await input.inputValue();
    console.log('  Input value check:', inputValue);

    console.log('\n4. Try typing instead of fill():');
    await input.clear();
    await input.type('another test', { delay: 50 });
    console.log('  Input value after type():', await input.inputValue());
    console.log('  Button disabled after type():', await sendButton.isDisabled());

    console.log('\n5. Try fill() with explicit change event:');
    await input.clear();
    await input.fill('fill with event');
    // Dispatch change event manually
    await input.evaluate((el: HTMLInputElement) => {
      const event = new Event('change', { bubbles: true });
      el.dispatchEvent(event);
    });
    await page.waitForTimeout(100);
    console.log('  Input value after fill() + dispatch:', await input.inputValue());
    console.log('  Button disabled after dispatch:', await sendButton.isDisabled());
  });
});
