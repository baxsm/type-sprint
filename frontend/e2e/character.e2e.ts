import { expect, test } from "@playwright/test";

test("pick a character, shuffle, save, and it persists across reload", async ({ page }) => {
  await page.goto("/character");
  await expect(page.getByRole("heading", { name: "Character" })).toBeVisible();

  await page.getByRole("button", { name: /bottts/i }).click();

  const seedInput = page.getByLabel("Seed");
  const before = await seedInput.inputValue();
  await page.getByRole("button", { name: "Shuffle" }).click();
  await expect(seedInput).not.toHaveValue(before);

  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Saved.")).toBeVisible();

  const savedSeed = await seedInput.inputValue();

  await page.goto("/");
  const topbarAvatar = page.locator("header img");
  await expect(topbarAvatar).toBeVisible();
  const topbarSrc = await topbarAvatar.getAttribute("src");

  await page.reload();
  await expect(topbarAvatar).toHaveAttribute("src", topbarSrc ?? "");

  await page.goto("/character");
  await expect(page.getByLabel("Seed")).toHaveValue(savedSeed);
});
