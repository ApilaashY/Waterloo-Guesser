import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Waterloo Guesser/i);
});

test("renders logo", async ({ page }) => {
  await page.goto("/");

  // Check if logo is visible
  const logo = page.locator("text=WATGUESSER");
  await expect(logo).toBeVisible();
});
