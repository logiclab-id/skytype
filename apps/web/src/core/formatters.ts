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
    const formatted = formatSnippet(selected, format);
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
  // 1. Format fenced code blocks first: ```json ... ``` or ```yaml ... ```
  const withFormattedFences = input.replace(
    /```(json|yaml|yml)\r?\n([\s\S]*?)```/gi,
    (match, lang: string, body: string) => {
      const fmt: BlockFormat = lang.toLowerCase() === "json" ? "json" : "yaml";
      const res = formatSnippet(body.trim(), fmt);
      if (!res.ok) return match;
      return `\`\`\`${lang.toLowerCase()}\n${res.output}\n\`\`\``;
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

  return out.join("\n");
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
