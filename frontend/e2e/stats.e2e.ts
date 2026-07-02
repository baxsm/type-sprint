import { expect, test } from "@playwright/test";
import { typeTargetText } from "./helpers";

test("hovering the wpm chart shows a tooltip with real run detail", async ({ page }) => {
  await page.goto("/practice?lang=javascript&diff=easy");
  await typeTargetText(page);
  await expect(page.getByText("Try again")).toBeVisible();

  await page.goto("/practice?lang=python&diff=easy");
  await typeTargetText(page);
  await expect(page.getByText("Try again")).toBeVisible();

  await page.goto("/stats");
  const chart = page.getByTestId("wpm-chart").locator(".recharts-wrapper");
  await expect(chart).toBeVisible();

  const box = await chart.boundingBox();
  if (!box) throw new Error("chart has no bounding box");
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5);

  const tooltip = page.getByTestId("wpm-chart").locator(".recharts-tooltip-wrapper");
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toContainText(/\d+ WPM/);
});

test("language breakdown chart renders a bar per language played", async ({ page }) => {
  await page.goto("/practice?lang=javascript&diff=easy");
  await typeTargetText(page);
  await expect(page.getByText("Try again")).toBeVisible();

  await page.goto("/practice?lang=python&diff=easy");
  await typeTargetText(page);
  await expect(page.getByText("Try again")).toBeVisible();

  await page.goto("/stats");
  const chart = page.getByTestId("language-breakdown-chart");
  await expect(chart).toBeVisible();
  await expect(chart.locator(".recharts-bar-rectangle")).toHaveCount(2);
});
