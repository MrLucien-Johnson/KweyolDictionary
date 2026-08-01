import { expect, test } from "@playwright/test";

test("homepage presents brand, mission and both dictionary paths", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /kwéyòl dictionary dominica/i }),
  ).toBeVisible();
  await expect(
    page.getByText(/learn, preserve and celebrate the kwéyòl language of dominica/i),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /open adult dictionary/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /open children’s dictionary/i }),
  ).toBeVisible();
});

test("adult dictionary path is reachable from homepage", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /open adult dictionary/i }).click();
  await expect(page).toHaveURL(/\/dictionary/);
  await expect(
    page.getByRole("heading", { name: /adult dictionary/i }),
  ).toBeVisible();
});
