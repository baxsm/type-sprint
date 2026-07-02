import { expect, test } from "@playwright/test";

test("landing page loads and scrolls through every section", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const headings = [
    "How it works",
    /pick a face for your speed/i,
    /ready to see your number/i,
  ];

  for (const name of headings) {
    const heading = page.getByRole("heading", { name });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
  }
});

test("hero CTA navigates into the app", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /open the app/i }).first().click();
  await expect(page).toHaveURL(/\/app$/);
});

test("header CTA navigates into the app", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("banner").getByRole("link", { name: "Open app" }).click();
  await expect(page).toHaveURL(/\/app$/);
});

test("closing cta navigates into the app", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("heading", { name: /ready to see your number/i }).scrollIntoViewIfNeeded();
  await page.getByRole("link", { name: /open the app/i }).last().click();
  await expect(page).toHaveURL(/\/app$/);
});

test("character showcase cta navigates to the character picker", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /try the character picker/i }).scrollIntoViewIfNeeded();
  await page.getByRole("link", { name: /try the character picker/i }).click();
  await expect(page).toHaveURL(/\/app\/character/);
});
