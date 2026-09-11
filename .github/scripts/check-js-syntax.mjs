import { readFileSync } from "node:fs";
import vm from "node:vm";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node check-js-syntax.mjs <file.html> [...]");
  process.exit(1);
}

let failed = false;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];

  if (scripts.length === 0) {
    console.warn(`${file}: no inline <script> blocks found`);
    continue;
  }

  scripts.forEach((match, i) => {
    const code = match[1];
    try {
      // Parsing only — vm.Script never executes the code.
      new vm.Script(code, { filename: `${file}#inline-script-${i + 1}` });
      console.log(`${file}: inline script ${i + 1} OK`);
    } catch (err) {
      failed = true;
      console.error(`${file}: inline script ${i + 1} SYNTAX ERROR\n  ${err.message}`);
    }
  });
}

if (failed) {
  console.error("\nJS syntax check failed.");
  process.exit(1);
}
console.log("\nAll inline scripts parse cleanly.");
