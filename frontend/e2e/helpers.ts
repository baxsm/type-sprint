import type { Page } from "@playwright/test";

// reads the exact target text out of the typing surface and types it.
// the surface renders one span per character, with a "↵" marker for newlines
// and a "→" marker for tabs (real indentation in code snippets).
export async function typeTargetText(page: Page): Promise<void> {
  const box = page.getByRole("textbox", { name: "Typing area" });
  await box.click();

  // pull the target from the data attribute we expose for testing
  const text = await box.getAttribute("data-target");
  if (!text) throw new Error("typing surface has no data-target");

  for (const char of text) {
    if (char === "\n") {
      await page.keyboard.press("Enter");
    } else if (char === "\t") {
      await page.keyboard.press("Tab");
    } else {
      await page.keyboard.type(char);
    }
  }
}
