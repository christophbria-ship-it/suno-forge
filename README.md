# Suno Forge Tag Studio

A focused, local-first Suno style prompt builder that keeps the full 1,940-tag sound library visible and usable.

## What makes it different

- Preserves all 20 categories and every existing tag, including 569 genres and 523 instruments.
- Organizes large libraries into compact musical-family boxes instead of one long scrolling page.
- Pages through each family without removing or hiding choices from the library.
- Uses Suno-oriented main categories: Genre, Mood, Vocals, Vocal Delivery, Vocal Range, Instruments, and Production.
- Keeps all remaining categories behind the Options button.
- Defaults to two choices per category and automatically advances through the main categories.
- Includes an optional 1,000-character mode for larger prompts.
- Produces one clean, comma-separated Suno Style prompt with one-tap copying.
- Saves selections locally and works offline after the first visit.

## Verification

```bash
npm test
```

The test suite checks JavaScript syntax, all 1,940 tags, family-group completeness, focused and extended selection rules, pagination, copying, accessibility wiring, and offline assets.
