# Phone Mockup Builder

Vite + React + TypeScript implementation of the `project/Phone Mockup Builder.dc.html` design.

```sh
npm install
npm run dev      # local dev server
npm run build    # static build in dist/
```

- `src/lib/model.ts`: frame geometry, export sizes and state shape
- `src/lib/render.ts`: canvas layout and compositing (screenshot, status bar, home indicator, mask and frame), plus WebP export
- `src/lib/image.ts`: edge-colour sampling, stepped downscaling and the export sharpen pass
- `src/components/`: sidebar phone cards, preview stage and a local port of the Covers `Button`
- `public/assets/`: phone frame and screen mask

The original design handoff is kept below and in `project/` for reference.

---

# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read the chat transcripts first.** There are 2 chat transcript(s) in `chats/`. The transcripts show the full back-and-forth between the user and the design assistant — they tell you **what the user actually wants** and **where they landed** after iterating. Don't skip them. The final HTML files are the output, but the chat is where the intent lives.

**Read `project/Phone Mockup Builder.dc.html` in full.** The user had this file open when they triggered the handoff, so it's almost certainly the primary design they want built. Read it top to bottom — don't skim. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `README.md` — this file
- `chats/` — conversation transcripts (read these!)
- `project/` — the `Phone Mockup Builder` project files (HTML prototypes, assets, components)
