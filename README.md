# Phone Mockup Builder

Vite + React + TypeScript implementation of the Claude Design "Phone Mockup Builder" handoff.

```sh
npm install
npm run dev      # local dev server
npm run build    # static build in dist/
```

- `src/lib/model.ts`: frame geometry, export sizes and state shape
- `src/lib/render.ts`: canvas layout and compositing (screenshot, status bar, home indicator, mask and frame), plus WebP export
- `src/lib/image.ts`: edge-colour sampling, stepped downscaling and the export sharpen pass
- `src/components/`: sidebar phone cards and preview stage
- `public/assets/`: phone frame and screen mask

Pushes to `main` build and deploy to GitHub Pages via `.github/workflows/deploy.yml`.
