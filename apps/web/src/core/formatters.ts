export type BlockFormat = "auto" | "json" | "yaml" | "text";

export interface FormatResult {
  ok: boolean;
  output: string;
  error?: string;
}

export interface ParsedSection {
  type: string;
  content: string;
}

/**
 * Formats either the selected range inside the field or the entire mixed document.
 */
export function formatFieldContent(
  fullText: string,
  selectionStart: number,
  selectionEnd: number,
  format: BlockFormat
): FormatResult {
  const hasSelection = selectionEnd > selectionStart;

  if (hasSelection) {
    const selected = fullText.slice(selectionStart, selectionEnd);
    const formatted =
      format === "auto"
        ? { ok: true, output: autoFormatMixed(selected) }
        : formatSnippet(selected, format);
    if (!formatted.ok) return formatted;
    return {
      ok: true,
      output:
        fullText.slice(0, selectionStart) +
        formatted.output +
        fullText.slice(selectionEnd),
    };
  }

  if (format === "auto") {
    return { ok: true, output: autoFormatMixed(fullText) };
  }

  return formatSnippet(fullText, format);
}

/**
 * Auto-formats pasted content if it is inside a ```json / ```yaml block
 * or contains valid JSON / fenced blocks.
 */
export function autoFormatOnPaste(
  fullText: string,
  selectionStart: number,
  selectionEnd: number,
  pastedText: string
): string {
  const before = fullText.slice(0, selectionStart);
  const after = fullText.slice(selectionEnd);

  // Check if cursor is inside an open fenced block
  const fenceMatches = [...before.matchAll(/```([a-zA-Z0-9_+-]*)/g)];
  if (fenceMatches.length % 2 === 1) {
    const lastFenceLang = (fenceMatches[fenceMatches.length - 1][1] ?? "").toLowerCase();
    if (lastFenceLang === "json") {
      const formatted = formatSnippet(pastedText, "json");
      if (formatted.ok) {
        return before + formatted.output + after;
      }
    } else if (lastFenceLang === "yaml" || lastFenceLang === "yml") {
      const formatted = formatSnippet(pastedText, "yaml");
      if (formatted.ok) {
        return before + formatted.output + after;
      }
    }
  }

  const combined = before + pastedText + after;
  return autoFormatMixed(combined);
}

/**
 * Normalizes bullet and numbered lists copied from other tools (Notion, Word, Slack, etc.)
 * outside of fenced code blocks.
 */
function normalizeListsOutsideFences(input: string): string {
  const lines = input.split("\n");
  const out: string[] = [];
  let inFence = false;
  const numCounters = new Map<number, number>();

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, "");
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      numCounters.clear();
      out.push(line);
      continue;
    }

    if (inFence) {
      out.push(line);
      continue;
    }

    // Match Unicode bullets (•, ◦, ▪, ▫, ‣, ⁃, ∙) or markdown bullets (-, *, +)
    const bulletMatch = line.match(/^([ \t]*)(?:[•◦▪▫‣⁃∙]|[-*+])\s+(.*)$/);
    if (bulletMatch) {
      const indent = bulletMatch[1].replace(/\t/g, "  ");
      const level = Math.floor(indent.length / 2);
      const cleanIndent = "  ".repeat(level);
      numCounters.delete(level);
      out.push(`${cleanIndent}- ${bulletMatch[2].trimStart()}`);
      continue;
    }

    // Match numbered lists like "1. foo", "1) foo", "  2.   bar"
    const numMatch = line.match(/^([ \t]*)\d+[.)]\s+(.*)$/);
    if (numMatch) {
      const indent = numMatch[1].replace(/\t/g, "  ");
      const level = Math.floor(indent.length / 2);
      const cleanIndent = "  ".repeat(level);
      const nextNum = (numCounters.get(level) ?? 0) + 1;
      numCounters.set(level, nextNum);
      out.push(`${cleanIndent}${nextNum}. ${numMatch[2].trimStart()}`);
      continue;
    }

    if (line.trim() === "") {
      numCounters.clear();
    } else {
      numCounters.clear();
    }
    out.push(line);
  }

  return out.join("\n");
}

function formatSnippet(input: string, format: BlockFormat): FormatResult {
  if (!input.trim()) return { ok: true, output: input };

  if (format === "json" || format === "auto") {
    try {
      const parsed: unknown = JSON.parse(input);
      return { ok: true, output: JSON.stringify(parsed, null, 2) };
    } catch (err) {
      if (format === "json") {
        return {
          ok: false,
          output: input,
          error: err instanceof Error ? err.message : "Invalid JSON",
        };
      }
    }
  }

  if (format === "yaml") {
    const trimmed = input.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        return { ok: true, output: toYaml(parsed, 0).trimEnd() };
      } catch {
        // Fall through to YAML whitespace normalization
      }
    }
    const normalized = input
      .split("\n")
      .map((line) => line.replace(/\t/g, "  ").replace(/\s+$/, ""))
      .join("\n");
    return { ok: true, output: normalized };
  }

  return { ok: true, output: input };
}

/**
 * Smartly formats fenced ```json / ```yaml blocks and standalone JSON objects/arrays
 * inside a mixed text+JSON+YAML document without disturbing surrounding notes.
 */
function autoFormatMixed(input: string): string {
  // 1. Format fenced code blocks for all supported languages (and untagged ``` blocks)
  const withFormattedFences = input.replace(
    /```([a-zA-Z0-9_+-]*)\r?\n([\s\S]*?)```/gi,
    (match, lang: string, body: string) => {
      const l = (lang || "").toLowerCase();
      if (l === "json") {
        const res = formatSnippet(body.trim(), "json");
        return res.ok ? `\`\`\`${lang}\n${res.output}\n\`\`\`` : match;
      }
      if (l === "yaml" || l === "yml") {
        const res = formatSnippet(body.trim(), "yaml");
        return res.ok ? `\`\`\`${lang}\n${res.output}\n\`\`\`` : match;
      }
      if (["html", "xml", "svg", "jsx", "tsx"].includes(l)) {
        return `\`\`\`${lang}\n${formatMarkup(body)}\n\`\`\``;
      }
      if (["css", "scss", "js", "javascript", "ts", "typescript", "php", "cs", "csharp", "go", "java", "rust", "rs", "c", "cpp"].includes(l)) {
        return `\`\`\`${lang}\n${formatBraceCode(body)}\n\`\`\``;
      }
      if (["py", "python", "rb", "ruby", "sh", "bash", "sql"].includes(l)) {
        const cleaned = body.trim().split("\n").map((ln) => ln.replace(/\t/g, "  ").replace(/\s+$/, "")).join("\n");
        return `\`\`\`${lang}\n${cleaned}\n\`\`\``;
      }

      // Untagged ``` block: auto-detect JSON or HTML/JSX
      const trimmedBody = body.trim();
      if (trimmedBody.startsWith("{") || trimmedBody.startsWith("[")) {
        const res = formatSnippet(trimmedBody, "json");
        if (res.ok) return `\`\`\`${lang}\n${res.output}\n\`\`\``;
      }
      if (trimmedBody.startsWith("<")) {
        return `\`\`\`${lang}\n${formatMarkup(body)}\n\`\`\``;
      }
      return match;
    }
  );

  // 2. If the whole document is valid JSON, pretty-print it directly
  const trimmed = withFormattedFences.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Mixed content; scan for embedded JSON blocks below
    }
  }

  // 3. Scan line-by-line for embedded JSON blocks outside fences
  const lines = withFormattedFences.split("\n");
  const out: string[] = [];
  let inFence = false;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      out.push(line);
      i++;
      continue;
    }

    if (!inFence && (line.trim().startsWith("{") || line.trim().startsWith("["))) {
      // Try single-line JSON first
      try {
        const parsed: unknown = JSON.parse(line.trim());
        out.push(JSON.stringify(parsed, null, 2));
        i++;
        continue;
      } catch {
        // Try accumulating multi-line JSON until valid
        let candidate = line;
        let matched = false;
        for (let j = i + 1; j < Math.min(lines.length, i + 80); j++) {
          candidate += "\n" + lines[j];
          try {
            const parsed: unknown = JSON.parse(candidate.trim());
            out.push(JSON.stringify(parsed, null, 2));
            i = j + 1;
            matched = true;
            break;
          } catch {
            // Keep accumulating
          }
        }
        if (matched) continue;
      }
    }

    out.push(line);
    i++;
  }

  return normalizeListsOutsideFences(out.join("\n"));
}

/**
 * Splits mixed text into typed sections for the Preview tab.
 */
export function parseMixedSections(input: string): ParsedSection[] {
  if (!input.trim()) return [];

  const sections: ParsedSection[] = [];
  const fenceRegex = /```([a-zA-Z0-9_+-]*)\r?\n([\s\S]*?)```/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      const between = input.slice(lastIndex, match.index).trim();
      if (between) {
        sections.push({ type: detectLooseType(between), content: between });
      }
    }
    const rawLang = (match[1] ?? "").trim().toLowerCase();
    const type = rawLang === "yml" ? "yaml" : rawLang || "code";
    sections.push({ type, content: match[2].trimEnd() });
    lastIndex = fenceRegex.lastIndex;
  }

  if (lastIndex < input.length) {
    const tail = input.slice(lastIndex).trim();
    if (tail) {
      sections.push({ type: detectLooseType(tail), content: tail });
    }
  }

  return sections;
}

function detectLooseType(text: string): ParsedSection["type"] {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // Not pure JSON
    }
  }
  const lines = trimmed.split("\n");
  const yamlLikeLines = lines.filter((l) => /^[a-zA-Z0-9_-]+:\s*/.test(l.trim()));
  if (lines.length >= 2 && yamlLikeLines.length / lines.length >= 0.6) {
    return "yaml";
  }
  return "text";
}

function toYaml(value: unknown, indent: number): string {
  const pad = "  ".repeat(indent);
  if (value === null) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (/[:#\n{}[\],&*!|>'"%@`]/.test(value) || value === "") {
      return JSON.stringify(value);
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value
      .map((item) => {
        if (item !== null && typeof item === "object") {
          return `${pad}- ${toYaml(item, indent + 1).trimStart()}`;
        }
        return `${pad}- ${toYaml(item, indent + 1)}`;
      })
      .join("\n");
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries
      .map(([k, v]) => {
        if (v !== null && typeof v === "object" && !isEmptyCollection(v)) {
          return `${pad}${k}:\n${toYaml(v, indent + 1)}`;
        }
        return `${pad}${k}: ${toYaml(v, indent + 1)}`;
      })
      .join("\n");
  }
  return String(value);
}

function isEmptyCollection(v: unknown): boolean {
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object" && v !== null) return Object.keys(v).length === 0;
  return false;
}

const VOID_HTML_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

function formatMarkup(raw: string): string {
  const lines = raw.trim().split("\n");
  const out: string[] = [];
  let indent = 0;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, "  ").trim();
    if (!line) {
      out.push("");
      continue;
    }

    const startsWithClosing = /^<\//.test(line) || /^\/\s*>/.test(line);
    if (startsWithClosing) {
      indent = Math.max(0, indent - 1);
    }

    out.push("  ".repeat(indent) + line);

    // Adjust indent for next line
    const openMatch = line.match(/^<([a-zA-Z][a-zA-Z0-9.-]*)\b[^>]*>$/);
    const isSelfClosing = /\/>$/.test(line);
    const hasInlineClose = /^<([a-zA-Z][a-zA-Z0-9.-]*)\b[^>]*>.*<\/\1>$/.test(line);
    const isMultiLineOpenStart = /^<([a-zA-Z][a-zA-Z0-9.-]*)(?:\s+.*)?$/.test(line) && !line.includes(">");

    if (isMultiLineOpenStart) {
      indent++;
    } else if (openMatch && !isSelfClosing && !hasInlineClose && !VOID_HTML_TAGS.has(openMatch[1].toLowerCase())) {
      indent++;
    } else if (!startsWithClosing && /<\/[a-zA-Z][a-zA-Z0-9.-]*>$/.test(line) && !/^<[a-zA-Z]/.test(line)) {
      indent = Math.max(0, indent - 1);
    }
  }

  return out.join("\n");
}

function formatBraceCode(raw: string): string {
  const lines = raw.trim().split("\n");
  const out: string[] = [];
  let indent = 0;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, "  ").trim();
    if (!line) {
      out.push("");
      continue;
    }

    if (/^[}\])]/.test(line)) {
      indent = Math.max(0, indent - 1);
    }

    out.push("  ".repeat(indent) + line);

    const opens = (line.match(/[{([]/g) ?? []).length;
    const closes = (line.match(/[})\]]/g) ?? []).length;
    const startsWithClose = /^[}\])]/.test(line) ? 1 : 0;
    indent = Math.max(0, indent + opens - (closes - startsWithClose));
  }

  return out.join("\n");
}
