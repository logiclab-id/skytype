import fs from "node:fs";
import path from "node:path";

const KEBAB_FILE_RE = /^[a-z0-9]+(-[a-z0-9]+)*\.[a-z0-9]+$/;

const ALLOWED_WEB_ROOT_FILES = new Set(["app.tsx", "main.tsx", "index.css"]);
const ALLOWED_WEB_DIRS = new Set([
  "assets",
  "components",
  "core",
  "hooks",
  "lib",
  "modules",
  "routes",
  "stores",
  "types",
]);

const ALLOWED_API_ROOT_FILES = new Set(["app.cs", "routes.cs"]);
const ALLOWED_API_DIRS = new Set(["db", "middlewares", "modules", "utils"]);

const IGNORED_SEGMENTS = ["node_modules", "dist", "bin", "obj", "migrations"];

function normalizeRel(filePath) {
  return path.relative(process.cwd(), path.resolve(filePath)).replaceAll("\\", "/");
}

function shouldIgnore(rel) {
  const parts = rel.split("/");
  return parts.some((p) => IGNORED_SEGMENTS.includes(p));
}

function findComments(content, ext) {
  const hits = [];
  let line = 1;
  let i = 0;
  const len = content.length;

  while (i < len) {
    const ch = content[i];
    const next = content[i + 1];

    if (ch === "\n") {
      line++;
      i++;
      continue;
    }

    if (ch === '"' || ch === "'" || (ch === "`" && ext !== ".css")) {
      const quote = ch;
      i++;
      while (i < len) {
        if (content[i] === "\n") line++;
        if (content[i] === "\\" && i + 1 < len) {
          i += 2;
          continue;
        }
        if (content[i] === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    if (ch === "\\" && i + 1 < len) {
      i += 2;
      continue;
    }

    if (ext !== ".css" && ch === "/" && next === "/") {
      hits.push({ line, kind: "//" });
      while (i < len && content[i] !== "\n") i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      hits.push({ line, kind: "/* ... */" });
      i += 2;
      while (i < len && !(content[i] === "*" && content[i + 1] === "/")) {
        if (content[i] === "\n") line++;
        i++;
      }
      i += 2;
      continue;
    }

    i++;
  }

  return hits;
}

function checkWebFile(rel, content, errors) {
  const sub = rel.slice("apps/web/src/".length);
  const parts = sub.split("/");
  const fileName = parts[parts.length - 1];

  if (!KEBAB_FILE_RE.test(fileName)) {
    errors.push(`${rel}: file name must be kebab-case`);
  }

  if (parts.length === 1) {
    if (!ALLOWED_WEB_ROOT_FILES.has(fileName)) {
      errors.push(`${rel}: unexpected root file in apps/web/src`);
    }
  } else if (!ALLOWED_WEB_DIRS.has(parts[0])) {
    errors.push(`${rel}: folder '${parts[0]}' is not an allowed apps/web/src directory`);
  }

  const importRe = /(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g;
  let match;
  while ((match = importRe.exec(content)) !== null) {
    const target = match[1];

    if (target.startsWith("..")) {
      errors.push(`${rel}: use '@/' alias instead of relative parent import '${target}'`);
    }

    if (!target.startsWith("@/")) continue;

    const targetSub = target.slice(2);
    const targetLayer = targetSub.split("/")[0];

    if (parts[0] === "modules" && parts.length >= 3) {
      const currentModule = parts[1];
      if (targetLayer === "modules") {
        const targetModule = targetSub.split("/")[1];
        if (targetModule && targetModule !== currentModule) {
          errors.push(
            `${rel}: cross-module import '${target}' forbidden; communicate via stores/, core/, hooks/, components/, or types/`
          );
        }
      }
    }

    if (
      (parts[0] === "core" || parts[0] === "types" || parts[0] === "components") &&
      (targetLayer === "modules" || targetLayer === "routes")
    ) {
      errors.push(`${rel}: '${parts[0]}/' must not import from '${targetLayer}/' ('${target}')`);
    }
  }
}

function checkApiFile(rel, errors) {
  const sub = rel.slice("apps/api/src/".length);
  const parts = sub.split("/");
  const fileName = parts[parts.length - 1];

  if (!KEBAB_FILE_RE.test(fileName)) {
    errors.push(`${rel}: file name must be kebab-case`);
  }

  if (parts.length === 1) {
    if (!ALLOWED_API_ROOT_FILES.has(fileName)) {
      errors.push(`${rel}: unexpected root file in apps/api/src`);
    }
  } else if (!ALLOWED_API_DIRS.has(parts[0])) {
    errors.push(`${rel}: folder '${parts[0]}' is not an allowed apps/api/src directory`);
  }

  if (parts[0] === "db" && parts.length === 2) {
    if (fileName !== "context.cs" && fileName !== "index.cs") {
      errors.push(`${rel}: db tables and seeders must live inside db/schema/ or db/seeders/`);
    }
  }
}

function walkFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_SEGMENTS.includes(entry.name)) {
        results.push(...walkFiles(full));
      }
    } else {
      results.push(full);
    }
  }
  return results;
}

const args = process.argv.slice(2);
const files =
  args.length > 0
    ? args
    : [...walkFiles("apps/web/src"), ...walkFiles("apps/api/src")];

const errors = [];

for (const file of files) {
  const rel = normalizeRel(file);
  if (shouldIgnore(rel) || !fs.existsSync(file)) continue;

  const ext = path.extname(rel).toLowerCase();
  if (![".ts", ".tsx", ".cs", ".css"].includes(ext)) continue;

  const content = fs.readFileSync(file, "utf8");

  const commentHits = findComments(content, ext);
  for (const hit of commentHits) {
    errors.push(`${rel}:${hit.line}: comments are not allowed (${hit.kind})`);
  }

  if (rel.startsWith("apps/web/src/")) {
    checkWebFile(rel, content, errors);
  } else if (rel.startsWith("apps/api/src/")) {
    checkApiFile(rel, errors);
  }
}

if (errors.length > 0) {
  console.error("Convention check failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}

console.log(`Convention check passed (${files.length} file(s) checked).`);

