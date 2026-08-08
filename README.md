# The Simplest Prompt Builder

A fast, local-first AI music prompt studio for Suno and other generative music tools.

## What it does

- Guides a song idea through four focused steps: Brief, Sound, Shape, and Export.
- Searches a large sound library without rendering every option at once.
- Builds the original Forge production brief, six organized Suno fields, or one short GMIV line.
- Keeps compact, balanced, and detailed controls for longer formats without filling the character limit unnecessarily.
- Keeps Exclude Styles separate for direct use in Suno.
- Supports keyboard navigation, mobile layouts, reduced motion, strong focus states, and screen-reader-friendly controls.
- Saves the current project, presets, and prompt history on the device.
- Works offline after the first visit and can be installed as a PWA.
- Optionally refines an existing production prompt through the server-side Prompt AI endpoint.

## Privacy

The local generator, projects, presets, and prompt history stay in browser storage. Prompt AI sends only the finished prompt and optional refinement direction when the user explicitly selects that feature.

## Verification

```bash
npm test
```

The test suite checks JavaScript syntax, UI/JavaScript wiring, asset integrity, manifest and service-worker consistency, accessibility essentials, and sound-library loading.

