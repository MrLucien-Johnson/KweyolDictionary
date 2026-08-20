# Practice games vetting prompt

Use this checklist whenever someone reports game bugs, when adding a new practice
mode, or when an agent is asked to “vet / fix practice games.” Prefer small,
continuous fixes over big rewrites.

## Goal

Learners should **earn** the answer. Before a round is checked:

- Do not show the target Kwéyòl headword, English gloss of that headword, or
  dictionary link for the target word.
- Do not put the correct option first every time.
- Do not leave picture / match / spelling options in source order if that order
  reveals the answer.
- Do reveal the answer clearly **after** check, timeout, or results review.

Synthetic TTS and browser speech remain practice aids, not native authority.

## Surfaces to inspect

| Surface | Path |
|---------|------|
| Arcade UI | `src/components/practice/PracticeArcade.tsx` |
| Round builders | `src/lib/practice/games.ts` |
| Difficulty | `src/lib/practice/difficulty.ts` |
| Anti-spoiler helpers | `src/lib/practice/anti-spoiler.ts` |
| Child activities | `src/components/children/ChildActivityPlayer.tsx` |
| Quizzes | `src/components/learning/QuizPlayer.tsx` |
| Automated checks | `tests/unit/practice-anti-spoiler.test.ts`, e2e practice cases |

## Pre-answer checklist (must pass)

1. **Cloze** — Stage does not show Focus headword / gloss / target audio / “Open word”
   until the round is checked. Prompt uses `______` and must not still contain the
   answer token.
2. **Tiles** — Tokens are shuffled (not already the correct sentence). Focus /
   dictionary link stay hidden until checked. URL-boot (`?difficulty=`) must build
   the game **once** so UI tiles match grading tokens.
3. **Hard mode** — English sentence hint stays hidden.
4. **Token caps** — Kids decks and difficulty `maxTokens` both apply (use the tighter
   cap for cloze and tiles).
5. **Child tap-picture** — Correct card is not always first; compare against a
   stable target id after shuffling display options.
6. **Child match-pairs** — English column order differs from Kwéyòl column order;
   selected Kwéyòl shows a pressed/selected state.
7. **Child spelling** — Letter tiles are shuffled and consumed; listing/description
   must not print the target word; prefer neutral slugs.
8. **Quizzes** — Client payload must not expose `isCorrect` before submit; after
   submit wrong answers should show the correct answer text.
9. **Accessibility** — Audio / button labels must not embed the answer before
   resolve (e.g. avoid `Play {headword}` until checked).
10. **Timer** — Pausing after check must not remount/refill the timer bar.

## After-answer checklist

1. Correct option / sentence is shown in feedback.
2. Wrong picks are marked without trapping the player (lives / next round).
3. Results review can deep-link to dictionary entries.
4. Favourites / save flows still work from results.

## Continuous fix loop (agent prompt)

Copy this when asking an agent to keep improving games:

> Vet practice and children’s games against `docs/PRACTICE_GAMES_VET.md`. Play or
> read each mode for answer leakage before check. Fix every leak found. Extend
> `tests/unit/practice-anti-spoiler.test.ts` (and e2e if needed) so the same
> class of bug cannot return. Keep difficulty behaviour intact. Commit and open
> a focused PR.

## Known intentional behaviours

- Easy / Medium show the **English example sentence** as a hint (not the Kwéyòl blank).
- Client-side games can still hold answers in React state (GitHub Pages has no
  secret answer API). Secrecy target is **visible UI / labels / option order**.
- Memory child activities that openly list pairs are review sheets, not scored
  recall games — do not treat that list as an arcade spoiler unless the activity
  is later turned into a hidden-card memory game.
