import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (name.endsWith(".html")) out.push(path);
  }
  return out;
}

let fail = 0;
for (const file of walk("dist")) {
  const html = readFileSync(file, "utf8");
  const hrefs = [...html.matchAll(/href="(\/[^"#?]*)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (href.startsWith("/public/") || href === "/styles.css" || href === "/download.js" || href === "/site.webmanifest") {
      const rel = href.slice(1);
      if (!existsSync(join("dist", rel))) {
        console.error("missing asset", href, "from", file);
        fail += 1;
      }
      continue;
    }
    const rel = href === "/" ? "index.html" : join(href.slice(1), "index.html");
    if (!existsSync(join("dist", rel))) {
      console.error("missing page", href, "from", file);
      fail += 1;
    }
  }
}
if (fail) process.exit(1);
console.log("internal links ok");
