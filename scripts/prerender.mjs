import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createServer } from "vite";

// Render the actual React content for every visitor, not a crawler-only copy.
const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { render, siteUrl, profileSchema } = await server.ssrLoadModule("/src/entry-prerender.tsx");
  const template = await readFile("dist/index.html", "utf8");
  const head = `<link rel="canonical" href="${siteUrl}" />
    <meta property="og:url" content="${siteUrl}" />
    <script id="profile-schema" type="application/ld+json">${JSON.stringify(profileSchema).replaceAll("<", "\\u003c")}</script>`;
  const absoluteImages = template.replaceAll('content="/cinematic/', `content="${siteUrl}cinematic/`);
  const homepage = absoluteImages.replace("<!-- seo:head -->", head).replace('<div id="root"></div>', `<div id="root">${render()}</div>`);
  await writeFile("dist/index.html", homepage);
  await writeFile("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}</loc></url></urlset>\n`);
  await writeFile("dist/robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`);

  const noindex = template.replace('content="index, follow, max-image-preview:large"', 'content="noindex, follow"');
  await mkdir("dist/kage", { recursive: true });
  await writeFile("dist/kage/index.html", noindex.replace(/<title>.*?<\/title>/, "<title>Design reference — Saad AR</title>"));
  await writeFile("dist/404.html", noindex.replace(/<title>.*?<\/title>/, "<title>Page not found — Saad AR</title>").replace('<div id="root"></div>', '<div id="root"><main><h1>Page not found</h1><p>This address does not exist.</p><a href="/">Return to Saad AR’s portfolio</a></main></div>'));
  console.log("Pre-rendered homepage, profile data, sitemap, robots.txt, reference route, and 404 page.");
} finally {
  await server.close();
}
