import { expect, test } from "@playwright/test";
import { typeTargetText } from "./helpers";

test("complete a full practice run and see results", async ({ page }) => {
  await page.goto("/practice?lang=javascript&diff=easy");
  await expect(page.getByRole("textbox", { name: "Typing area" })).toBeVisible();

  await typeTargetText(page);

  // results panel appears with a wpm number and try again
  await expect(page.getByText("Try again")).toBeVisible();
  await expect(page.getByText("WPM").first()).toBeVisible();
});

test("run is saved to stats after completion", async ({ page }) => {
  await page.goto("/practice?lang=javascript&diff=easy");
  await typeTargetText(page);
  await expect(page.getByText("Try again")).toBeVisible();

  await page.goto("/stats");
  await expect(page.getByRole("heading", { name: "Your Stats" })).toBeVisible();
  // the runs table should have at least one row
  await expect(page.getByRole("cell", { name: "practice" }).first()).toBeVisible();
});

test("new snippet button loads a different snippet", async ({ page }) => {
  await page.goto("/practice?lang=javascript&diff=medium");
  const box = page.getByRole("textbox", { name: "Typing area" });
  const first = await box.getAttribute("data-target");
  await page.getByRole("button", { name: "New snippet" }).click();
  // give the state a tick to update
  await page.waitForTimeout(100);
  const second = await box.getAttribute("data-target");
  // with multiple medium js snippets, exclusion should change the text
  expect(second).not.toBe(first);
});

test("daily persists a personal best across reloads", async ({ page }) => {
  await page.goto("/daily");
  await expect(page.getByRole("heading", { name: "Daily Challenge" })).toBeVisible();
  await typeTargetText(page);
  await expect(page.getByText("Try again")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Your best today")).toBeVisible();
});

test("completes a snippet with a real Tab keypress for indentation", async ({ page }) => {
  await page.goto("/practice?lang=javascript&diff=medium");
  const box = page.getByRole("textbox", { name: "Typing area" });

  // js-medium snippets include one with a tab indent - cycle until we get it
  let target = await box.getAttribute("data-target");
  for (let i = 0; i < 10 && !target?.includes("\t"); i++) {
    await page.getByRole("button", { name: "New snippet" }).click();
    await page.waitForTimeout(50);
    target = await box.getAttribute("data-target");
  }
  expect(target).toContain("\t");

  await typeTargetText(page);
  await expect(page.getByText("Try again")).toBeVisible();
});
