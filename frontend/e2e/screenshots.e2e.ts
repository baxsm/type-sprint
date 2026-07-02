import { expect, test } from "@playwright/test";
import { typeTargetText } from "./helpers";

// captures key UI states for visual review. artifacts go to e2e/screenshots.

// motion's whileInView reveals only fire once an element actually crosses into
// the viewport. a single scrollIntoViewIfNeeded jump skips past content between
// the old and new scroll position without ever putting it in view, so below-fold
// sections stay at opacity 0 in a fullPage screenshot. walk the page in steps so
// every section's reveal genuinely fires, the same way a real visitor scrolling
// down would trigger it.
async function scrollThrough(page: import("@playwright/test").Page): Promise<void> {
  const total = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= total; y += 300) {
    await page.evaluate((offset) => window.scrollTo(0, offset), y);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

test("capture landing page, light and dark, desktop and mobile", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await scrollThrough(page);

  const startedDark = await page.locator("html").evaluate((el) => el.classList.contains("dark"));
  await page.screenshot({
    path: `e2e/screenshots/landing-${startedDark ? "dark" : "light"}.png`,
    fullPage: true,
  });

  await page.getByRole("button", { name: /switch to/i }).click();
  await page.screenshot({
    path: `e2e/screenshots/landing-${startedDark ? "light" : "dark"}.png`,
    fullPage: true,
  });

  await page.setViewportSize({ width: 380, height: 800 });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await scrollThrough(page);
  await page.screenshot({ path: "e2e/screenshots/landing-mobile.png", fullPage: true });
});

test("capture landing sections individually", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await scrollThrough(page);

  const sections = [
    { name: "hero", heading: /type faster/i },
    { name: "feature-sequence", heading: /everything you need to get faster/i },
    { name: "how-it-works", heading: "How it works" },
    { name: "character-showcase", heading: /pick a face for your speed/i },
    { name: "closing-cta", heading: /ready to see your number/i },
  ];

  for (const section of sections) {
    const heading = page.getByRole("heading", { name: section.heading });
    await heading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `e2e/screenshots/landing-${section.name}.png` });
  }
});

test("capture practice mid-run and results", async ({ page }) => {
  await page.goto("/app/practice?lang=javascript&diff=medium");
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

test("capture daily empty history", async ({ page }) => {
  await page.goto("/app/daily");
  await expect(
    page.getByRole("heading", { name: "Daily Challenge" }),
  ).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/daily-empty.png", fullPage: true });
});

test("capture daily short streak", async ({ page }) => {
  await page.goto("/app/daily");
  await seedDailyStreak(page, [-1, -2, -3]);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Daily Challenge" }),
  ).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/daily-short-streak.png", fullPage: true });
});

test("capture daily broken streak", async ({ page }) => {
  await page.goto("/app/daily");
  await seedDailyStreak(page, [-2, -3, -4, -10, -11]);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Daily Challenge" }),
  ).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/daily-broken-streak.png", fullPage: true });
});

test("capture stats empty and populated", async ({ page }) => {
  await page.goto("/app/stats");
  await page.screenshot({
    path: "e2e/screenshots/stats-empty.png",
    fullPage: true,
  });

  // populate two runs across languages so both charts have something to draw
  await page.goto("/app/practice?lang=prose&diff=easy");
  await typeTargetText(page);
  await expect(page.getByText("Try again")).toBeVisible();

  await page.goto("/app/practice?lang=javascript&diff=easy");
  await typeTargetText(page);
  await expect(page.getByText("Try again")).toBeVisible();

  await page.goto("/app/stats");
  await expect(page.getByRole("heading", { name: "Your Stats" })).toBeVisible();
  await expect(page.getByTestId("wpm-chart")).toBeVisible();
  // recharts animates bars/lines growing in on mount, let it settle before capturing
  await page.waitForTimeout(500);
  await page.screenshot({
    path: "e2e/screenshots/stats-populated.png",
    fullPage: true,
  });
});

test("capture race lobby", async ({ page }) => {
  await page.goto("/app/race");
  await expect(
    page.getByRole("heading", { name: "Race", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "e2e/screenshots/race-lobby.png",
    fullPage: true,
  });
});

test("capture mobile app home", async ({ page }) => {
  await page.setViewportSize({ width: 380, height: 800 });
  await page.goto("/app");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.screenshot({
    path: "e2e/screenshots/app-home-mobile.png",
    fullPage: true,
  });
});

// seeds localStorage daily results for the given day offsets from today (e.g. -1 = yesterday)
async function seedDailyStreak(
  page: import("@playwright/test").Page,
  offsets: number[],
): Promise<void> {
  await page.evaluate((dayOffsets: number[]) => {
    const store: Record<string, unknown> = {};
    for (const offset of dayOffsets) {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      store[dateStr] = {
        date: dateStr,
        snippetId: "js-easy-001",
        bestWpm: 60 + Math.abs(offset) * 3,
        bestAccuracy: 95,
        attempts: 1,
        updatedAt: Date.now(),
      };
    }
    window.localStorage.setItem("type-sprint:daily", JSON.stringify(store));
  }, offsets);
}

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
