# Saad AR — Portfolio

A cinematic portfolio built with React, TypeScript, Vite, and Three.js.

## Development

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
```

## Validation and production

```sh
npm run type-check
npm run lint
npm run build
npm run preview
```

Deploy the generated `dist` directory. The project uses npm and `package-lock.json`.

## Structure

- `src/components/CinematicPortfolio.tsx` — portfolio content and interactions.
- `src/components/CinematicWorld.tsx` — scrolling Three.js scene.
- `src/components/cinematic-portfolio.css` — responsive layout and motion.
- `src/pages` — homepage, retained `/kage` reference page, and 404 page.
- `public/cinematic/optimized` — production scene images.
- `public/images` and `public/logo.png` — portrait, texture, and logo.
- `public/landing-pages/kage.html` — required by the `/kage` reference component.
- `assets/cinematic-source` — original supplied artwork, preserved for future edits and excluded from Vite's public build assets.

The original résumé PDF is preserved in the project root. The homepage supports reduced motion and a manual motion toggle.
