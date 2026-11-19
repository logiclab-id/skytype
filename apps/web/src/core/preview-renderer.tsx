import { Fragment } from "react";

export function renderInlineMarkdown(text: string): React.ReactNode {
  const tokens = text.split(/(\*\*.*?\*\*|\*[^*]+\*|~~.*?~~|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return tokens.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("~~") && part.endsWith("~~")) {
      return <del key={i}>{part.slice(2, -2)}</del>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.84em",
            padding: "0.1rem 0.35rem",
            borderRadius: "4px",
            background: "var(--surface-hover)",
            color: "var(--accent)",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--accent)", textDecoration: "underline" }}
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function renderMarkdownText(text: string): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    if (/^###\s+/.test(line)) {
      return (
        <h3 key={idx} style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0.4rem 0 0.15rem" }}>
          {renderInlineMarkdown(line.replace(/^###\s+/, ""))}
        </h3>
      );
    }
    if (/^##\s+/.test(line)) {
      return (
        <h2 key={idx} style={{ fontSize: "1.22rem", fontWeight: 700, margin: "0.5rem 0 0.2rem" }}>
          {renderInlineMarkdown(line.replace(/^##\s+/, ""))}
        </h2>
      );
    }
    if (/^#\s+/.test(line)) {
      return (
        <h1 key={idx} style={{ fontSize: "1.45rem", fontWeight: 700, margin: "0.5rem 0 0.25rem" }}>
          {renderInlineMarkdown(line.replace(/^#\s+/, ""))}
        </h1>
      );
    }
    if (/^---+$/.test(line.trim())) {
      return <hr key={idx} style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.5rem 0" }} />;
    }
    if (/^>\s+/.test(line)) {
      return (
        <blockquote
          key={idx}
          style={{
            borderLeft: "3px solid var(--accent)",
            paddingLeft: "0.75rem",
            color: "var(--ink-muted)",
            margin: "0.2rem 0",
          }}
        >
          {renderInlineMarkdown(line.replace(/^>\s+/, ""))}
        </blockquote>
      );
    }
    const bulletMatch = line.match(/^(\s*)- (.*)$/);
    if (bulletMatch) {
      const indentPx = Math.floor(bulletMatch[1].length / 2) * 16;
      return (
        <div key={idx} style={{ paddingLeft: `${indentPx + 8}px`, display: "flex", gap: "0.45rem" }}>
          <span style={{ color: "var(--ink-muted)" }}>•</span>
          <span>{renderInlineMarkdown(bulletMatch[2])}</span>
        </div>
      );
    }
    const numMatch = line.match(/^(\s*)(\d+\.) (.*)$/);
    if (numMatch) {
      const indentPx = Math.floor(numMatch[1].length / 2) * 16;
      return (
        <div key={idx} style={{ paddingLeft: `${indentPx + 8}px`, display: "flex", gap: "0.45rem" }}>
          <span style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)", fontSize: "0.85em" }}>
            {numMatch[2]}
          </span>
          <span>{renderInlineMarkdown(numMatch[3])}</span>
        </div>
      );
    }
    if (!line.trim()) {
      return <div key={idx} style={{ height: "0.5rem" }} />;
    }
    return (
      <p key={idx} style={{ lineHeight: 1.65 }}>
        {renderInlineMarkdown(line)}
      </p>
    );
  });
}

export function highlightCodeLine(line: string, type: string): React.ReactNode {
  const lang = type.toLowerCase();

  if (lang === "json") {
    const tokens = line.split(/(".*?"(?=\s*:)|".*?"|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?)/g);
    return tokens.map((part, idx) => {
      if (!part) return null;
      if (part.startsWith('"') && tokens[idx + 1]?.trimStart().startsWith(":")) {
        return <span key={idx} className="tok-key">{part}</span>;
      }
      if (part.startsWith('"')) {
        return <span key={idx} className="tok-str">{part}</span>;
      }
      if (/^(true|false|null)$/.test(part)) {
        return <span key={idx} className="tok-bool">{part}</span>;
      }
      if (/^-?\d+(?:\.\d+)?$/.test(part)) {
        return <span key={idx} className="tok-num">{part}</span>;
      }
      return <Fragment key={idx}>{part}</Fragment>;
    });
  }

  if (lang === "yaml" || lang === "yml") {
    if (/^\s*#/.test(line)) {
      return <span className="tok-fence">{line}</span>;
    }
    const match = line.match(/^(\s*-?\s*)([a-zA-Z0-9_.-]+)(:\s*)(.*)$/);
    if (match) {
      const [, indent, key, colon, val] = match;
      return (
        <>
          {indent}
          <span className="tok-key">{key}</span>
          {colon}
          <span className={/^(true|false|null)$/i.test(val.trim()) ? "tok-bool" : /^-?\d+(\.\d+)?$/.test(val.trim()) ? "tok-num" : "tok-str"}>
            {val}
          </span>
        </>
      );
    }
    return line;
  }

  if (["html", "xml", "svg", "jsx", "tsx"].includes(lang)) {
    const markupTokens = line.split(/(<\/?[a-zA-Z][a-zA-Z0-9.-]*|\/?>|".*?"|'.*?'|\b[a-zA-Z_:][a-zA-Z0-9_.:-]*(?==)|\b(?:required|disabled|checked|readOnly)\b)/g);
    return markupTokens.map((part, idx) => {
      if (!part) return null;
      if (/^<\/?[a-zA-Z]/.test(part)) {
        const bracket = part.startsWith("</") ? "</" : "<";
        const tagName = part.slice(bracket.length);
        return (
          <Fragment key={idx}>
            <span className="tok-fence">{bracket}</span>
            <span className="tok-tag">{tagName}</span>
          </Fragment>
        );
      }
      if (part === ">" || part === "/>") {
        return <span key={idx} className="tok-fence">{part}</span>;
      }
      if (/^["']/.test(part)) {
        return <span key={idx} className="tok-str">{part}</span>;
      }
      if (/^[a-zA-Z_:]/.test(part)) {
        return <span key={idx} className="tok-num">{part}</span>;
      }
      return <Fragment key={idx}>{part}</Fragment>;
    });
  }

  if (lang === "css" || lang === "scss") {
    if (/^\s*\/\*/.test(line)) {
      return <span className="tok-fence">{line}</span>;
    }
    const cssTokens = line.split(/(".*?"|'.*?'|#[0-9a-fA-F]{3,8}\b|\b[a-z-]+(?=\s*:)|-?\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms)?\b)/g);
    return cssTokens.map((part, idx) => {
      if (!part) return null;
      if (/^["']/.test(part)) return <span key={idx} className="tok-str">{part}</span>;
      if (/^#[0-9a-fA-F]{3,8}$/.test(part)) return <span key={idx} className="tok-bool">{part}</span>;
      if (/^-?\d/.test(part)) return <span key={idx} className="tok-num">{part}</span>;
      if (/^[a-z-]+$/.test(part) && cssTokens[idx + 1]?.trimStart().startsWith(":")) {
        return <span key={idx} className="tok-key">{part}</span>;
      }
      return <Fragment key={idx}>{part}</Fragment>;
    });
  }

  if (lang === "sql") {
    if (/^\s*--/.test(line)) {
      return <span className="tok-fence">{line}</span>;
    }
    const sqlTokens = line.split(/('.*?'|\b(?:SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|ON|GROUP|BY|ORDER|LIMIT|OFFSET|AS|AND|OR|NOT|IN|IS|NULL|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|PRIMARY|KEY|DEFAULT)\b|-?\d+(?:\.\d+)?)/gi);
    return sqlTokens.map((part, idx) => {
      if (!part) return null;
      if (part.startsWith("'")) return <span key={idx} className="tok-str">{part}</span>;
      if (/^(null)$/i.test(part)) return <span key={idx} className="tok-bool">{part}</span>;
      if (/^-?\d+(?:\.\d+)?$/.test(part)) return <span key={idx} className="tok-num">{part}</span>;
      if (/^(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|ON|GROUP|BY|ORDER|LIMIT|OFFSET|AS|AND|OR|NOT|IN|IS|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|PRIMARY|KEY|DEFAULT)$/i.test(part)) {
        return <span key={idx} className="tok-key">{part}</span>;
      }
      return <Fragment key={idx}>{part}</Fragment>;
    });
  }

  if (lang === "bash" || lang === "sh") {
    if (/^\s*#/.test(line)) {
      return <span className="tok-fence">{line}</span>;
    }
    const bashTokens = line.split(/(".*?"|'.*?'|\$[a-zA-Z_]\w*|--?[a-zA-Z0-9-]+|\b(?:echo|cd|ls|mkdir|rm|cp|mv|curl|git|bun|npm|dotnet|export|if|then|else|fi|for|do|done)\b)/g);
    return bashTokens.map((part, idx) => {
      if (!part) return null;
      if (/^["']/.test(part)) return <span key={idx} className="tok-str">{part}</span>;
      if (part.startsWith("$")) return <span key={idx} className="tok-num">{part}</span>;
      if (part.startsWith("-")) return <span key={idx} className="tok-bool">{part}</span>;
      if (/^(echo|cd|ls|mkdir|rm|cp|mv|curl|git|bun|npm|dotnet|export|if|then|else|fi|for|do|done)$/.test(part)) {
        return <span key={idx} className="tok-key">{part}</span>;
      }
      return <Fragment key={idx}>{part}</Fragment>;
    });
  }

  // Comments for JS, TS, PHP, Python, C#, Go
  if (/^\s*(\/\/|#(?![0-9a-fA-F]{3,8}\b))/.test(line)) {
    return <span className="tok-fence">{line}</span>;
  }

  const genericTokens = line.split(
    /(".*?"|'.*?'|`.*?`|\$[a-zA-Z_]\w*|\b(?:const|let|var|function|return|if|else|elif|elseif|foreach|for|while|import|export|from|as|class|interface|type|record|struct|enum|package|using|namespace|public|private|protected|static|readonly|async|await|def|fn|func|defer|go|echo|use|new|try|catch|except|finally|throw|raise|with|lambda|in|is|and|or|not|true|false|null|None|nil|undefined|string|number|boolean|int|void)\b|-?\d+(?:\.\d+)?)/g
  );
  return genericTokens.map((part, idx) => {
    if (!part) return null;
    if (/^["'`]/.test(part)) return <span key={idx} className="tok-str">{part}</span>;
    if (/^\$[a-zA-Z_]\w*$/.test(part)) return <span key={idx} className="tok-tag">{part}</span>;
    if (/^(true|false|null|None|nil|undefined)$/.test(part)) return <span key={idx} className="tok-bool">{part}</span>;
    if (/^-?\d+(?:\.\d+)?$/.test(part)) return <span key={idx} className="tok-num">{part}</span>;
    if (/^(const|let|var|function|return|if|else|elif|elseif|foreach|for|while|import|export|from|as|class|interface|type|record|struct|enum|package|using|namespace|public|private|protected|static|readonly|async|await|def|fn|func|defer|go|echo|use|new|try|catch|except|finally|throw|raise|with|lambda|in|is|and|or|not|string|number|boolean|int|void)$/.test(part)) {
      return <span key={idx} className="tok-key">{part}</span>;
    }
    return <Fragment key={idx}>{part}</Fragment>;
  });
}

export function renderHighlightedEditorLines(content: string): React.ReactNode {
  const lines = content.split("\n");
  let currentLang: string | null = null;

  return lines.map((line, idx) => {
    const fenceMatch = line.match(/^(\s*```)([a-zA-Z0-9_+-]*)(.*)$/);
    if (fenceMatch) {
      const [, ticks, lang, rest] = fenceMatch;
      if (currentLang === null) {
        currentLang = (lang || "code").toLowerCase();
      } else {
        currentLang = null;
      }
      return (
        <div key={idx}>
          <span className="tok-fence">{ticks}</span>
          {lang && <span className="tok-lang">{lang}</span>}
          {rest}
          {line === "" ? "\u200B" : ""}
        </div>
      );
    }

    if (currentLang !== null) {
      return (
        <div key={idx} className="tok-code-base">
          {line ? highlightCodeLine(line, currentLang) : "\u200B"}
        </div>
      );
    }

    if (/^#{1,3}\s/.test(line)) {
      return (
        <div key={idx} className="tok-heading">
          {line}
        </div>
      );
    }

    if (line.includes("`")) {
      const parts = line.split(/(`[^`]+`)/g);
      return (
        <div key={idx} className="tok-prose">
          {parts.map((part, pIdx) =>
            part.startsWith("`") && part.endsWith("`") && part.length >= 2 ? (
              <span key={pIdx} className="tok-lang">{part}</span>
            ) : (
              <span key={pIdx}>{part}</span>
            )
          )}
        </div>
      );
    }

    return <div key={idx} className="tok-prose">{line || "\u200B"}</div>;
  });
}
