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
const head = html.match(/<head>(.*?)<\/head>/s)[1];
const schema = JSON.parse(head.match(/<script id="profile-schema" type="application\/ld\+json">(.*?)<\/script>/s)[1]);
assert.deepEqual(schema, {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Saad AR",
  alternateName: ["Saadar", "ML-CoderX"],
  url: "https://saadar.dev/",
  image: "https://saadar.dev/images/saadar-saad-ar-portrait.png",
  jobTitle: "Machine Learning & Full-Stack Developer",
  alumniOf: "Anjuman Institute of Technology and Management",
  sameAs: ["https://github.com/ML-CoderX", "https://www.linkedin.com/in/saadar"],
});
const meta = (key) => {
  const tags = [...head.matchAll(/<meta\s+[^>]*>/g)].map(([tag]) => tag)
    .filter((tag) => tag.includes(`name="${key}"`) || tag.includes(`property="${key}"`));
  assert.equal(tags.length, 1, `Expected one ${key} tag`);
  return tags[0].match(/content="([^"]*)"/)[1];
};
const title = "Saad AR | AI, Web & Mobile Developer";
assert.equal(head.match(/<title>(.*?)<\/title>/s)[1], title);
for (const key of ["og:title", "twitter:title"]) assert.equal(meta(key), title);
for (const key of ["description", "og:description", "twitter:description"]) {
  const description = meta(key);
  assert.ok(description.length < 160);
  assert.match(description.split(".")[0], /Saad AR.*Computer Science student and developer/);
}
for (const key of ["og:image", "twitter:image"]) assert.equal(meta(key), schema.image);
for (const key of ["og:image:alt", "twitter:image:alt"]) assert.equal(meta(key), "Portrait of Saad AR, developer");
assert.equal(meta("og:image:width"), "1254");
assert.equal(meta("og:image:height"), "1254");
assert.equal(meta("twitter:card"), "summary_large_image");
assert.equal(meta("og:site_name"), "Saad AR Portfolio");
const contact = html.match(/<section id="contact".*?<\/section>/s)[0];
for (const url of schema.sameAs) {
  assert.ok(contact.includes(`href="${url}" target="_blank" rel="me noreferrer"`));
}
assert.ok(html.includes('alt="Portrait of Saad AR (developer)"'));
const sitemap = await readFile("dist/sitemap.xml", "utf8");
assert.match(sitemap, /<loc>https:\/\/saadar\.dev\/<\/loc>/);
assert.ok(!sitemap.includes("kage"));
const robots = await readFile("dist/robots.txt", "utf8");
assert.match(robots, /User-agent: \*\nAllow: \//);
assert.match(robots, /Sitemap: https:\/\/saadar\.dev\/sitemap.xml/);
for (const path of ["dist/kage/index.html", "dist/404.html", "dist/landing-pages/kage.html"]) {
  const page = await readFile(path, "utf8");
  assert.match(page, /name="robots" content="noindex, follow"/);
  assert.ok(!page.includes('rel="canonical"'));
}
assert.deepEqual(await readFile("dist/Saad_Resume.pdf"), await readFile("Saad_Resume.pdf"));
console.log("SEO checks passed: initial content, canonical, profile schema, social image, sitemap, robots, excluded routes, and resume.");
