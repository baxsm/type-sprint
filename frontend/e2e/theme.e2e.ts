import { expect, test } from "@playwright/test";

test("toggling theme changes the dark class and persists across reload", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).not.toHaveClass(/dark/);

  const toggle = page.getByRole("button", { name: "Switch to dark theme" });
  await toggle.click();
  await expect(html).toHaveClass(/dark/);

  await page.reload();
  await expect(html).toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
});
