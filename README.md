# Forge Studio

Mobile-first AI songwriting and music prompt workstation built for Android, Acode, and modern browsers.

## Forge Studio v3

- Five AI writing actions: **Generate**, **Regenerate**, **Polish**, **Continue**, and **Hook Ideas**.
- Advanced controls for perspective, rhyme style, lyric density, language, tempo, energy, and length.
- Mobile structure editor with move, duplicate, rename, and remove controls.
- Live lyric statistics for sections, lines, words, and estimated performance duration.
- Detailed, compact, and lyrics-only prompt formats.
- Searchable history, favorites filtering, preset updating, and duplicate-history prevention.
- Debounced autosave with visible save status.
- Offline fallback writer, installable PWA support, undo/redo, import/export, copy, and share.
- Secure server-side OpenAI route with validation and rate limiting.

## Local Acode use

Open `index.html` with Acode Preview. Manual tools and offline lyric generation work locally. Live AI requires deployment because `OPENAI_API_KEY` must never be placed in browser code.

## Deploy on Vercel

1. Import this GitHub repository into Vercel.
2. Add `OPENAI_API_KEY` under Project Settings → Environment Variables.
3. Optionally add `OPENAI_MODEL`. It defaults to `gpt-5-mini`.
4. Redeploy after changing environment variables.

Required:

```text
OPENAI_API_KEY=your secret OpenAI API key
```

Optional:

```text
OPENAI_MODEL=gpt-5-mini
```

Never commit a real API key. `.env` files are ignored.

## Test

```bash
npm test
```

The test command performs JavaScript syntax checks on the frontend modules and serverless API route.
