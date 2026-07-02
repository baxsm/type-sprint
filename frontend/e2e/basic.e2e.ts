import { expect, test } from "@playwright/test";

test("landing page loads and Open app CTA goes to the game shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("banner").getByRole("link", { name: "Open app" }).click();
  await expect(page).toHaveURL(/\/app$/);
});

test("app home navigates to each app route", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const nav = page.getByRole("banner");

  await nav.getByRole("link", { name: "Practice" }).click();
  await expect(page).toHaveURL(/\/app\/practice/);

  await nav.getByRole("link", { name: "Daily" }).click();
  await expect(page).toHaveURL(/\/app\/daily/);

  await nav.getByRole("link", { name: "Stats" }).click();
  await expect(page).toHaveURL(/\/app\/stats/);

  await nav.getByRole("link", { name: "Race" }).click();
  await expect(page).toHaveURL(/\/app\/race/);
});

test("start typing button goes to practice", async ({ page }) => {
  await page.goto("/app");
  await page.getByRole("button", { name: "Start typing" }).click();
  await expect(page).toHaveURL(/\/app\/practice/);
  await expect(page.getByRole("textbox", { name: "Typing area" })).toBeVisible();
});

test("every app page has exactly one top-level heading", async ({ page }) => {
  for (const path of ["/", "/app", "/app/daily", "/app/race", "/app/stats"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  }
});

test("old top-level game routes no longer resolve", async ({ page }) => {
  for (const path of ["/practice", "/daily", "/race", "/stats", "/character"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
  }
});
