import { expect, test } from "@playwright/test";
import { typeTargetText } from "./helpers";

// captures key UI states for visual review. artifacts go to e2e/screenshots.

test("capture home", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/home.png", fullPage: true });
});

test("capture practice mid-run and results", async ({ page }) => {
  await page.goto("/practice?lang=javascript&diff=medium");
  const box = page.getByRole("textbox", { name: "Typing area" });
  await box.click();

  // type a few correct then one wrong char to show per-char feedback
  const text = (await box.getAttribute("data-target")) ?? "";
  const partial = [...text].slice(0, 8);
  for (const c of partial) {
    if (c === "\n") await page.keyboard.press("Enter");
    else if (c === "\t") await page.keyboard.press("Tab");
    else await page.keyboard.type(c);
  }
  await page.keyboard.type("Z"); // deliberate error
  await page.screenshot({ path: "e2e/screenshots/practice-midrun.png" });

  // finish the run for the results panel
  await page.keyboard.press("Backspace");
  await typeRest(page, text, 8);
  await expect(page.getByText("Try again")).toBeVisible();
  // let the entrance animation settle before capturing, or the shot catches
  // the results panel mid fade-in at low opacity
  await page.waitForTimeout(400);
  await page.screenshot({
    path: "e2e/screenshots/practice-results.png",
    fullPage: true,
  });
});

test("capture daily", async ({ page }) => {
  await page.goto("/daily");
  await expect(
    page.getByRole("heading", { name: "Daily Challenge" }),
  ).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/daily.png", fullPage: true });
});

test("capture stats empty and populated", async ({ page }) => {
  await page.goto("/stats");
  await page.screenshot({
    path: "e2e/screenshots/stats-empty.png",
    fullPage: true,
  });

  // populate a run then re-capture
  await page.goto("/practice?lang=prose&diff=easy");
  await typeTargetText(page);
  await expect(page.getByText("Try again")).toBeVisible();
  await page.goto("/stats");
  await expect(page.getByRole("heading", { name: "Your Stats" })).toBeVisible();
  await page.screenshot({
    path: "e2e/screenshots/stats-populated.png",
    fullPage: true,
  });
});

test("capture race lobby", async ({ page }) => {
  await page.goto("/race");
  await expect(
    page.getByRole("heading", { name: "Race", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "e2e/screenshots/race-lobby.png",
    fullPage: true,
  });
});

test("capture mobile home", async ({ page }) => {
  await page.setViewportSize({ width: 380, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.screenshot({
    path: "e2e/screenshots/home-mobile.png",
    fullPage: true,
  });
});

async function typeRest(
  page: import("@playwright/test").Page,
  text: string,
  from: number,
) {
  const rest = [...text].slice(from);
  for (const c of rest) {
    if (c === "\n") await page.keyboard.press("Enter");
    else if (c === "\t") await page.keyboard.press("Tab");
    else await page.keyboard.type(c);
  }
}
