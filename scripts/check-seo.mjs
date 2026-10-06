import { readFileSync, existsSync } from "node:fs";

const htmlFiles = [
  "dist/index.html",
  "dist/product/index.html",
  "dist/documentation/index.html",
  "dist/contact/index.html",
  "dist/privacy/index.html",
  "dist/terms/index.html",
  "dist/license/index.html",
  "dist/guides/index.html",
  "dist/guides/find-where-a-blender-asset-is-used/index.html",
  "dist/guides/find-unused-blender-assets/index.html",
  "dist/guides/blender-asset-dependencies/index.html",
  "dist/404.html",
];

const titles = new Map();
const descs = new Map();
let fail = 0;
function bad(message) {
  console.error("FAIL", message);
  fail += 1;
}

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const desc = html.match(/name="description"\s+content="([^"]+)"/)?.[1];
  const canon = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  if (!title) bad(`${file} missing title`);
  else if (titles.has(title)) bad(`duplicate title ${title}`);
  else titles.set(title, file);

  if (file.endsWith("404.html")) {
    if (canon) bad("404 should not have a canonical");
    if (!html.includes("noindex")) bad("404 missing noindex");
  } else {
    if (!desc) bad(`${file} missing description`);
    else if (descs.has(desc)) bad(`duplicate description ${desc}`);
    else descs.set(desc, file);
    if (!canon?.startsWith("https://linkedfiles.com/")) bad(`${file} bad canonical ${canon}`);
    if (!html.includes("https://linkedfiles.com/og-image.png")) bad(`${file} missing og image`);
    const twitterImage = html.match(/name="twitter:image"\s+content="([^"]+)"/)?.[1];
    if (twitterImage !== "https://linkedfiles.com/og-image.png") bad(`${file} twitter image ${twitterImage}`);
  }

  const h1s = html.match(/<h1[\s>]/g) || [];
  if (h1s.length !== 1) bad(`${file} h1 count ${h1s.length}`);

  for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(block[1]);
    } catch (error) {
      bad(`${file} invalid jsonld ${error.message}`);
    }
  }
}

const sitemap = readFileSync("dist/sitemap.xml", "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expected = [
  "https://linkedfiles.com/",
  "https://linkedfiles.com/product/",
  "https://linkedfiles.com/guides/",
  "https://linkedfiles.com/guides/find-where-a-blender-asset-is-used/",
  "https://linkedfiles.com/guides/find-unused-blender-assets/",
  "https://linkedfiles.com/guides/blender-asset-dependencies/",
  "https://linkedfiles.com/documentation/",
  "https://linkedfiles.com/contact/",
  "https://linkedfiles.com/privacy/",
  "https://linkedfiles.com/terms/",
  "https://linkedfiles.com/license/",
];
for (const url of expected) {
  if (!locs.includes(url)) bad(`sitemap missing ${url}`);
}
if (locs.some((url) => url.includes("404"))) bad("404 in sitemap");
if (locs.length !== expected.length) bad(`sitemap count ${locs.length}`);
if (!existsSync("dist/llms.txt")) bad("missing llms.txt");
if (!existsSync("dist/site.webmanifest")) bad("missing manifest");
JSON.parse(readFileSync("dist/site.webmanifest", "utf8"));
if (!readFileSync("dist/robots.txt", "utf8").includes("Sitemap: https://linkedfiles.com/sitemap.xml")) {
  bad("robots sitemap");
}

const home = readFileSync("dist/index.html", "utf8");
const data = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const faq = data["@graph"].find((node) => node["@type"] === "FAQPage");
const pairs = [...home.matchAll(/<dt>([^<]+)<\/dt>\s*<dd>([^<]+)<\/dd>/g)];
if (pairs.length !== faq.mainEntity.length) bad(`faq count ${pairs.length} vs ${faq.mainEntity.length}`);
pairs.forEach((match, index) => {
  const question = faq.mainEntity[index];
  if (match[1] !== question.name) bad(`question mismatch ${match[1]}`);
  if (match[2] !== question.acceptedAnswer.text) bad(`answer mismatch for ${match[1]}`);
});
if (home.includes("fetchpriority")) bad("fetchpriority still present");

for (const file of [
  "dist/guides/find-where-a-blender-asset-is-used/index.html",
  "dist/guides/find-unused-blender-assets/index.html",
]) {
  const html = readFileSync(file, "utf8");
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
  const howTo = graph.find((node) => node["@type"] === "HowTo");
  for (const step of howTo.step) {
    if (!html.includes(step.text)) bad(`${file} missing step text`);
  }
}

if (fail) {
  console.error(`FAILED ${fail}`);
  process.exit(1);
}
console.log(`OK ${titles.size} pages, ${locs.length} sitemap urls`);
