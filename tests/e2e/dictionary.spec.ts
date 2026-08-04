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

test("dictionary filters search without requiring apply click", async ({
  page,
}) => {
  await page.goto("/dictionary");
  await expect(page.getByRole("search")).toBeVisible();
  const search = page.getByRole("searchbox", { name: /search kwéyòl or english/i });
  await search.click();
  await search.pressSequentially("bonjou", { delay: 15 });
  await page.getByRole("search").getByRole("button", { name: /^search$/i }).click();
  await expect(page).toHaveURL(/q=bonjou/, { timeout: 5000 });
  await expect(page.getByRole("link", { name: /^bonjou$/i }).first()).toBeVisible();
  await page.getByRole("button", { name: /^featured$/i }).click();
  await expect(page).toHaveURL(/featured=1/);
});

test("letter filter chip and All clear the letter", async ({ page }) => {
  await page.goto("/dictionary/?letter=s");
  const chip = page.getByRole("button", { name: /letter:\s*s/i });
  await expect(chip).toBeVisible();
  await chip.click();
  await expect(page).not.toHaveURL(/letter=s/, { timeout: 5000 });
  await expect(page.getByRole("button", { name: /letter:\s*s/i })).toHaveCount(0);

  await page.goto("/dictionary/?letter=s");
  await expect(page.getByRole("button", { name: /letter:\s*s/i })).toBeVisible();
  await page
    .getByRole("navigation", { name: /browse by letter/i })
    .getByRole("link", { name: /^all$/i })
    .click();
  await expect(page).not.toHaveURL(/letter=s/, { timeout: 5000 });
  await expect(page.getByRole("button", { name: /letter:\s*s/i })).toHaveCount(0);
});

test("practice hub opens arcade lobby and starts a game", async ({ page }) => {
  await page.goto("/practice");
  await expect(page.getByRole("heading", { name: /practice games/i })).toBeVisible();
  await expect(page.getByText(/easy/i).first()).toBeVisible();
  await page.getByRole("link", { name: /open lobby/i }).first().click();
  await expect(page).toHaveURL(/\/practice\//);
  await expect(page.getByRole("button", { name: /start/i })).toBeVisible();
  await page.getByRole("button", { name: /start/i }).click();
  await expect(page.getByText(/score/i).first()).toBeVisible();
  await expect(page.getByText(/focus/i).first()).toBeVisible();
});
