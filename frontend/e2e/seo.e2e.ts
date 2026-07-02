import { expect, test } from "@playwright/test";

test("landing page has a favicon link and correct title/description", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("type-sprint");

  const iconLink = page.locator('link[rel="icon"][type="image/svg+xml"]');
  await expect(iconLink).toHaveAttribute("href", /icon\.svg/);

  const description = page.locator('meta[name="description"]');
  await expect(description).toHaveAttribute("content", /typing speed game/i);
});

test("open graph and twitter card metadata are present", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "type-sprint");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image\.png/);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
});

test("favicon, apple icon, og image, robots, and sitemap all resolve", async ({ page }) => {
  await page.goto("/");
  for (const path of [
    "/favicon.ico",
    "/icon.svg",
    "/apple-icon.png",
    "/opengraph-image.png",
    "/robots.txt",
    "/sitemap.xml",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
  }
});

test("landing page includes valid SoftwareApplication structured data", async ({ page }) => {
  await page.goto("/");
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(jsonLd).toBeTruthy();
  const data = JSON.parse(jsonLd ?? "{}");
  expect(data["@type"]).toBe("SoftwareApplication");
  expect(data.name).toBe("type-sprint");
});
