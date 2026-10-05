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
npm run check:seo
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

The original résumé PDF is preserved in the project root. Its public copy at `public/Saad_Resume.pdf` is linked in the desktop and mobile navigation menus for viewing without authentication. Replace both copies when updating the résumé.

The opening screen displays Saad AR while the page loads, with a short minimum introduction and a 4.5-second maximum wait, followed by a 450ms fade. It supports skipping and reduced motion. The homepage also supports a manual motion toggle.


## Search visibility

The production build pre-renders the actual homepage content into `dist/index.html`, so the portfolio and resume link are available without JavaScript. `src/seo.ts` defines the canonical domain (`https://saadar.dev/`) and factual ProfilePage/Person structured data. `scripts/prerender.mjs` generates the sitemap, robots.txt, and noindex reference/error pages. Always deploy the complete output of `npm run build`, not the source `index.html`.

After deployment:

1. Redirect HTTP and alternate hostnames to `https://saadar.dev/` using permanent redirects in your hosting dashboard.
2. Serve `dist/404.html` with HTTP 404 for unknown URLs. Avoid a blanket HTTP 200 fallback to the homepage. Serve `/kage` from its generated directory page.
3. Verify the domain in Google Search Console, submit `https://saadar.dev/sitemap.xml`, and inspect the homepage URL to request indexing.
4. Check the live page with Google's Rich Results Test and PageSpeed Insights. Search indexing and ranking are Google's decisions; local checks cannot confirm either.

The decorative introduction remains enabled. Its duration and the WebGL scene may affect real-user performance; measure the deployed site before claiming Core Web Vitals improvements.
