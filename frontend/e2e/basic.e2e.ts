import { expect, test } from "@playwright/test";

test("home loads and navigates to each route", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // use the topbar nav specifically, since mode cards also link to these routes
  const nav = page.getByRole("banner");

  await nav.getByRole("link", { name: "Practice" }).click();
  await expect(page).toHaveURL(/\/practice/);

  await nav.getByRole("link", { name: "Daily" }).click();
  await expect(page).toHaveURL(/\/daily/);

  await nav.getByRole("link", { name: "Stats" }).click();
  await expect(page).toHaveURL(/\/stats/);

  await nav.getByRole("link", { name: "Race" }).click();
  await expect(page).toHaveURL(/\/race/);
});

test("start typing button goes to practice", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start typing" }).click();
  await expect(page).toHaveURL(/\/practice/);
  await expect(page.getByRole("textbox", { name: "Typing area" })).toBeVisible();
});
