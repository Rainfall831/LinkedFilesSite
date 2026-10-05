import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const out = join(root, "dist");

mkdirSync(out, { recursive: true });

const paths = [
  "index.html",
  "404.html",
  "styles.css",
  "download.js",
  "favicon.ico",
  "og-image.png",
  "robots.txt",
  "sitemap.xml",
  "public",
  "contact",
  "product",
  "documentation",
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
