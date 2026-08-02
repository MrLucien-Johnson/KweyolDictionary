# Editor guide (plain language)

This guide is for teachers, language reviewers and community editors. You do not need to be a programmer.

## What this project is

A Dominican Kwéyòl–English learning platform with:

- an Adult Dictionary
- a Children’s Dictionary
- lessons and quizzes
- an admin area for editors

Only **Dominica’s Kwéyòl** should be added.

## Sign in

1. Open `/admin/login`
2. Use the email and password given to you by the project owner
3. You will see the administration dashboard

## Add an adult word

1. Go to **Manage entries**
2. Choose **Add word**
3. Fill in:
   - Kwéyòl word
   - English translation
   - part of speech
   - pronunciation guide
   - simple and detailed definitions
   - example sentence (add after save in a later edit if needed)
   - cultural notes when useful
4. Set status to **Draft** or **Needs review**
5. Save

Do **not** set a **new** word to **Approved** unless a language reviewer has checked it.

The current beginner curriculum was published for product density as provisional public content. It remains open to correction and is labelled on the public site (see Content disclaimer). Prefer improving examples and notes over quietly inventing new “approved” glosses.

## Add children’s content

When editing a word, fill in the **Child-friendly meaning**.  
Children’s wording must be simpler than the adult definition. Do not just copy the adult text.

Also make sure:

- the category is suitable for children
- the example is short
- any fun fact is gentle and accurate

## Add an image

1. Prepare a child-friendly illustration (no copyrighted cartoon characters)
2. Name it like: `animals-chat-kid-0042.webp`
3. Upload or place it in the media folder used by editors
4. Mark the image as:
   - **Placeholder** while temporary
   - **Confirmed** only when final
5. Write clear alt text

## Add audio

1. Record clear Dominican Kwéyòl pronunciation
2. Name it like: `bonjou-kid-0042.mp3`
3. Do **not** mark audio as verified native pronunciation until a reviewer confirms it
4. If audio is missing, leave it unavailable so learners see an honest state

## Review and approval

Statuses:

- Draft
- Needs review
- Linguist reviewed
- Community reviewed
- Approved
- Rejected
- Archived

Public visitors normally see **Approved** only.

## Create a grammar lesson / quiz / children’s activity

These are managed in the database/admin tools. Keep quiz answers inside the quiz only. Never publish answer keys on ordinary information pages.

## Import and export

Use **Import / export** in admin to download JSON backups or upload reviewed batches. New imports default to Draft unless a status is included.

## Important reminders

- Do not invent translations
- Do not copy from other Creole languages without a labelled comparison and approval
- Language varies by community and generation — note this when needed
- Children’s progress should not require personal accounts
- The public site is an as-is learning aid, not certified curriculum — keep disclaimer links intact
- See `docs/CONTENT_APPROVAL.md` for review tiers and priority lists
