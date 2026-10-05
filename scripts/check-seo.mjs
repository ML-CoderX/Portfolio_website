import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile("dist/index.html", "utf8");
assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
assert.match(html, /rel="canonical" href="https:\/\/saadar\.dev\/"/);
assert.match(html, /name="robots" content="index, follow, max-image-preview:large"/);
assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
for (const content of ["Cashlio", "DocuAI", "IPL Win Predictor", "Laptop Price Predictor", "Machine Learning Intern", 'href="/Saad_Resume.pdf"']) {
  assert.ok(html.includes(content), `Initial HTML must contain ${content}`);
}
assert.ok(!html.includes('class="opening-loader'), "Static content must not be blocked by an introduction");
assert.ok(!html.includes("<!-- seo:head -->"));
const schema = JSON.parse(html.match(/<script id="profile-schema" type="application\/ld\+json">(.*?)<\/script>/s)[1]);
assert.equal(schema.mainEntity.name, "Saad AR");
assert.equal(schema.url, "https://saadar.dev/");
assert.match(html, /property="og:image" content="https:\/\/saadar\.dev\//);
const sitemap = await readFile("dist/sitemap.xml", "utf8");
assert.match(sitemap, /<loc>https:\/\/saadar\.dev\/<\/loc>/);
assert.ok(!sitemap.includes("kage"));
assert.match(await readFile("dist/robots.txt", "utf8"), /Sitemap: https:\/\/saadar\.dev\/sitemap.xml/);
for (const path of ["dist/kage/index.html", "dist/404.html", "dist/landing-pages/kage.html"]) {
  const page = await readFile(path, "utf8");
  assert.match(page, /name="robots" content="noindex, follow"/);
  assert.ok(!page.includes('rel="canonical"'));
}
assert.deepEqual(await readFile("dist/Saad_Resume.pdf"), await readFile("Saad_Resume.pdf"));
console.log("SEO checks passed: initial content, canonical, profile schema, social image, sitemap, robots, excluded routes, and resume.");
