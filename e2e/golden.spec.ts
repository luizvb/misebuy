import { expect, test } from "@playwright/test";

test("guest reaches the plan, exports, then sees pricing", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.screenshot({ path: `docs/screenshots/${testInfo.project.name}-landing.png`, fullPage: true });
  await page.getByRole("button", { name: "Load sample" }).click();
  await expect(page.getByText("Buying plan")).toBeVisible();
  await expect(page.getByRole("button", { name: "Export plan" })).toBeVisible();
  await expect(page.getByText("Keep the plan free. Pay for the memory.")).toBeVisible();
  await page.screenshot({ path: `docs/screenshots/${testInfo.project.name}-result.png`, fullPage: true });
});

test("invalid input has a recoverable error state", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Supplier offers").fill("bad,data");
  await page.getByRole("button", { name: "Compare list" }).click();
  await expect(page.getByText("Check the list format.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Use sample instead" })).toBeVisible();
});

test("dark theme and reduced motion remain usable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "single visual theme smoke");
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Try the sample" })).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/desktop-dark.png", fullPage: true });
});
