import { expect, test } from "@playwright/test";
import { typeTargetText } from "./helpers";

test("completing today's daily updates the calendar and streak on reload", async ({ page }) => {
  await page.goto("/daily");
  await expect(page.getByRole("heading", { name: "Daily Challenge" })).toBeVisible();

  await expect(page.getByText("Current streak")).toBeVisible();
  const todayCell = page.locator('[data-state="today"]');
  await expect(todayCell).toHaveCount(1);

  await typeTargetText(page);
  await expect(page.getByText("Try again")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Daily Challenge" })).toBeVisible();

  // today's cell stays visually "today" but now shows the wpm from the completed run
  await expect(page.locator('[data-state="today"]')).toHaveCount(1);
  await expect(page.getByText("Your best today")).toBeVisible();

  const streakValues = page.locator("text=Current streak").locator("..").getByText("1");
  await expect(streakValues.first()).toBeVisible();
});

test("future days are not playable", async ({ page }) => {
  await page.goto("/daily");
  const futureCell = page.locator('[data-state="future"]').first();
  await expect(futureCell).toBeVisible();
  await expect(futureCell.getByRole("textbox")).toHaveCount(0);
});
