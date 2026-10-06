import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const out = join(root, "dist");

mkdirSync(out, { recursive: true });

const pages = [
  { loc: "https://linkedfiles.com/", changefreq: "weekly", priority: "1.0" },
  { loc: "https://linkedfiles.com/product/", changefreq: "monthly", priority: "0.9" },
  { loc: "https://linkedfiles.com/guides/", changefreq: "monthly", priority: "0.8" },
  { loc: "https://linkedfiles.com/guides/find-where-a-blender-asset-is-used/", changefreq: "monthly", priority: "0.8" },
  { loc: "https://linkedfiles.com/guides/find-unused-blender-assets/", changefreq: "monthly", priority: "0.8" },
  { loc: "https://linkedfiles.com/guides/blender-asset-dependencies/", changefreq: "monthly", priority: "0.8" },
  { loc: "https://linkedfiles.com/documentation/", changefreq: "monthly", priority: "0.8" },
  { loc: "https://linkedfiles.com/contact/", changefreq: "yearly", priority: "0.5" },
  { loc: "https://linkedfiles.com/privacy/", changefreq: "yearly", priority: "0.3" },
  { loc: "https://linkedfiles.com/terms/", changefreq: "yearly", priority: "0.3" },
  { loc: "https://linkedfiles.com/license/", changefreq: "yearly", priority: "0.3" },
];

const urls = pages
  .map(
    (page) => `  <url>
    <loc>${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(join(root, "sitemap.xml"), sitemap);

const paths = [
  "index.html",
  "404.html",
  "styles.css",
  "download.js",
  "favicon.ico",
  "og-image.png",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "site.webmanifest",
  "public",
  "contact",
  "product",
  "documentation",
  "guides",
  "privacy",
  "terms",
  "license",
];

for (const rel of paths) {
  const src = join(root, rel);
  if (!existsSync(src)) continue;
  cpSync(src, join(out, rel), { recursive: true });
}

console.log("Static build written to dist/");
