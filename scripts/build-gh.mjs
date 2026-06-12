// Builds for GitHub Pages, where the site is served from /<repo>/ rather than a domain
// root. Exists because `DEPLOY_TARGET=gh-pages vite build` is a POSIX-only shell idiom and
// npm scripts run through cmd.exe on Windows, where it is a syntax error. A four-line
// launcher is cheaper than adding cross-env as a dependency, and `vite build --mode` was
// avoided because mode also drives .env file selection and NODE_ENV semantics — more
// behaviour than "change the base path" should quietly reach for.
import { spawn } from "node:child_process";

const vite = spawn("npx", ["vite", "build"], {
  stdio: "inherit",
  shell: true, // needed for npx resolution on Windows
  env: { ...process.env, DEPLOY_TARGET: "gh-pages" },
});

vite.on("exit", (code) => process.exit(code ?? 1));
