import { type ChildProcess, spawn } from "node:child_process";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { typeTargetText } from "./helpers";

// boots the real ws-server for the duration of this file, then drives two
// browser contexts through a full race. this is the showcase demo flow.
// the client defaults to ws://localhost:3001, so the test server uses that port.

let server: ChildProcess;
const WS_PORT = 3001;

test.beforeAll(async () => {
  const serverDir = path.resolve(__dirname, "../../ws-server");
  server = spawn("bun", ["run", "src/index.ts"], {
    cwd: serverDir,
    env: { ...process.env, PORT: String(WS_PORT) },
    stdio: "ignore",
    shell: process.platform === "win32",
  });

  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://localhost:${WS_PORT}/health`);
      if (res.ok) break;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 100));
  }
});

test.afterAll(() => {
  server?.kill();
});

test("two windows race in real time", async ({ browser }) => {
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  await pageA.goto("/race");
  await pageB.goto("/race");

  await pageA.getByRole("button", { name: "Create race" }).click();
  const code = await pageA
    .locator("div.font-mono.tracking-\\[0\\.3em\\]")
    .innerText();
  expect(code).toHaveLength(4);

  await pageB.getByPlaceholder("Enter code").fill(code);
  await pageB.getByRole("button", { name: "Join race" }).click();

  await pageA.getByRole("button", { name: "I'm ready" }).click();
  await pageB.getByRole("button", { name: "I'm ready" }).click();

  // the typing surface renders (disabled, with a "Get ready..." overlay)
  // during the countdown too. wait for that overlay to appear then clear
  // before typing, or keystrokes sent during the countdown get silently dropped.
  await expect(pageA.getByRole("textbox", { name: "Typing area" })).toBeVisible({
    timeout: 10000,
  });
  await expect(pageA.getByText("Get ready...")).toBeVisible({ timeout: 10000 });
  await expect(pageA.getByText("Get ready...")).not.toBeVisible({ timeout: 10000 });

  // A types the whole snippet and should win
  await typeTargetText(pageA);
  await expect(pageA.getByText("You win")).toBeVisible({ timeout: 10000 });

  // B should see the race is over too
  await expect(pageB.getByText("Race over")).toBeVisible({ timeout: 10000 });

  await ctxA.close();
  await ctxB.close();
});
