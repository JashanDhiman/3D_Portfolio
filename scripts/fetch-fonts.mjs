// Downloads the exact Poppins woff2 files Google would serve, so the fonts can be
// self-hosted. Removes a render-blocking third-party stylesheet plus DNS/TLS to two
// extra origins, and takes the fonts off a third party entirely.
//
// Parsing note: Google writes the subset name in a comment BEFORE each @font-face:
//
//   /* devanagari */
//   @font-face { ... }
//   /* latin */
//   @font-face { ... }
//
// so splitting the stylesheet on "@font-face" pairs every block with the *next* block's
// label — an off-by-one that silently downloads the wrong subsets under the right names.
// Matching comment-plus-block together is the only reliable pairing.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2];
const CSS_URL =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;900&display=swap";

// A modern UA is required or Google serves ttf instead of woff2.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const css = await fetch(CSS_URL, { headers: { "User-Agent": UA } }).then((r) => r.text());

mkdirSync(OUT, { recursive: true });

const FACE = /\/\*\s*([^*]+?)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
const faces = [];

for (const [, subset, body] of css.matchAll(FACE)) {
  const weight = (body.match(/font-weight:\s*(\d+)/) || [])[1];
  const url = (body.match(/url\((https:[^)]+\.woff2)\)/) || [])[1];
  const range = (body.match(/unicode-range:\s*([^;]+);/) || [])[1]?.trim();
  if (!url || !weight || !range) continue;

  // Only latin: the content is English, and its typographic characters (em dash, curly
  // quotes, ellipsis) all sit inside U+2000-206F, which the latin subset covers.
  // latin-ext is ~38 KB per weight versus ~5 KB and carries accented Central/Eastern
  // European letters this content never uses.
  if (subset !== "latin") continue;

  // Assert the range really is latin, so a future parsing slip cannot pass silently.
  if (!range.startsWith("U+0000-00FF")) {
    throw new Error(`subset labelled "latin" has a non-latin range: ${range.slice(0, 60)}`);
  }

  const file = `poppins-${weight}-latin.woff2`;
  const bytes = Buffer.from(
    await fetch(url, { headers: { "User-Agent": UA } }).then((r) => r.arrayBuffer())
  );
  writeFileSync(join(OUT, file), bytes);
  faces.push({ file, weight, range });
  console.log(`  ${(bytes.length / 1024).toFixed(1).padStart(6)} KB  ${file}`);
}

faces.sort((a, b) => Number(a.weight) - Number(b.weight));

const rules = faces
  .map(
    (f) => `@font-face {
 font-family: "Poppins";
 font-style: normal;
 font-weight: ${f.weight};
 font-display: swap;
 src: url("/fonts/${f.file}") format("woff2");
 unicode-range: ${f.range};
}`
  )
  .join("\n\n");

writeFileSync(join(OUT, "_faces.css"), rules + "\n");
console.log(`\n  ${faces.length} latin faces; wrote _faces.css`);
console.log(`  range: ${faces[0]?.range.slice(0, 80)}…`);
