# Forge Studio

Mobile-first music prompt and lyric workstation built for Android, Acode, and modern browsers.

## What changed in v2

- Separate **Generate Lyrics**, **Regenerate**, and **Forge Prompt** actions.
- Lyrics textarea is always editable.
- Clear reliably removes the song idea, lyrics, and generated output.
- AI lyric generation uses a secure server-side route; the API key never enters browser code.
- Varied offline lyric fallback when the backend is unavailable.
- Improved tags, selected-tag chips, songwriting styles, mobile layout, presets, history, favorites, undo/redo, import/export, copy, and share.
- Diagnostics only open when a real error occurs.

## Local Acode use

Open `index.html` with Acode Preview. All manual features and the offline lyric generator work locally. The secure AI route requires deployment because a browser must never contain `OPENAI_API_KEY`.

## Deploy on Vercel

1. Import this GitHub repository into Vercel.
2. Add the environment variable `OPENAI_API_KEY` in the Vercel project settings.
3. Optionally add `OPENAI_MODEL`. It defaults to `gpt-5-mini`.
4. Deploy.

Required environment variable:

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

This performs JavaScript syntax checks on the frontend data, application logic, and serverless API route.
