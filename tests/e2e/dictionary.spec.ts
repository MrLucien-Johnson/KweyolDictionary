import { expect, test } from "@playwright/test";

test("adult dictionary lists approved words and opens a detail page", async ({
  page,
}) => {
  await page.goto("/dictionary");
  await expect(page.getByRole("heading", { name: /adult dictionary/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /bonjou/i }).first()).toBeVisible();
  await page.getByRole("link", { name: /^bonjou$/i }).first().click();
  await expect(page).toHaveURL(/\/dictionary\/bonjou/);
  await expect(page.getByRole("heading", { name: /^bonjou$/i })).toBeVisible();
  await expect(page.getByText(/good morning/i).first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: /play pronunciation of bonjou/i }),
  ).toBeVisible();
});

test("quiz page does not expose correct answers before submit", async ({ page }) => {
  await page.goto("/learn/quizzes/greetings-multiple-choice");
  await expect(page.getByRole("heading", { name: /greetings/i })).toBeVisible();
  await expect(page.getByText(/correct answers are checked only after/i)).toBeVisible();
  await expect(page.getByText(/isCorrect/i)).toHaveCount(0);
});

test("children can open a category and word card", async ({ page }) => {
  await page.goto("/children");
  await expect(
    page.getByRole("heading", { name: /children’s kwéyòl dictionary/i }),
  ).toBeVisible();
  await page.getByRole("link", { name: /colours/i }).first().click();
  await expect(page).toHaveURL(/\/children\/categories\/colours/);
  await expect(page.getByRole("link", { name: /wouj/i }).first()).toBeVisible();
});

test("verified speech contribute flow requires pre-checks", async ({ page }) => {
  await page.goto("/contribute?type=AUDIO&entry=bonjou&word=bonjou&english=good%20morning");
  await expect(
    page.getByRole("heading", { name: /contribute verified speech/i }),
  ).toBeVisible();
  await expect(page.getByText(/pre-verification checklist/i)).toBeVisible();
  await page.getByRole("button", { name: /download recording|submit for local review/i }).click();
  await expect(page.getByText(/add a recording|choose an audio file|listen/i).first()).toBeVisible();
});
