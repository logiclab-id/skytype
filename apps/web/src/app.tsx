import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  IconBulletList,
  IconLink,
  IconLock,
  IconMoon,
  IconNumberList,
  IconQuote,
  IconRedo,
  IconSun,
  IconUndo,
  MarkerSwoosh,
  SketchLoopArrow,
  SketchUnderline,
} from "@/components/Doodles";
import { encryptBundle, type EncryptedPayload } from "@/core/crypto";
import { formatFieldContent, parseMixedSections } from "@/core/formatters";

type Tab = "write" | "preview" | "docs";
type Theme = "light" | "dark";

const MAX_CHARS = 200_000;

const CODE_LANGUAGES = [
  { id: "json", label: "JSON" },
  { id: "yaml", label: "YAML" },
  { id: "php", label: "PHP" },
  { id: "ts", label: "TypeScript" },
  { id: "js", label: "JavaScript" },
  { id: "py", label: "Python" },
  { id: "cs", label: "C#" },
  { id: "go", label: "Go" },
  { id: "sql", label: "SQL" },
  { id: "bash", label: "Bash" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "", label: "Plain" },
] as const;

function getInitialTheme(): Theme {
  const saved = localStorage.getItem("typely-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function highlightCodeLine(line: string, type: string): React.ReactNode {
  if (type === "json") {
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

  if (type === "yaml") {
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

  // Generic multi-language highlighting (strings, keywords, numbers, PHP $vars)
  const genericTokens = line.split(
    /(".*?"|'.*?'|`.*?`|\$[a-zA-Z_]\w*|\b(?:const|let|var|function|return|if|else|elseif|foreach|for|while|import|export|from|class|interface|type|public|private|protected|static|async|await|def|fn|func|struct|echo|use|namespace|new|try|catch|throw|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|true|false|null|None|nil)\b|-?\d+(?:\.\d+)?)/g
  );
  return genericTokens.map((part, idx) => {
    if (!part) return null;
    if (/^["'`]/.test(part)) return <span key={idx} className="tok-str">{part}</span>;
    if (/^\$[a-zA-Z_]\w*$/.test(part)) return <span key={idx} className="tok-key">{part}</span>;
    if (/^(true|false|null|None|nil)$/.test(part)) return <span key={idx} className="tok-bool">{part}</span>;
    if (/^-?\d+(?:\.\d+)?$/.test(part)) return <span key={idx} className="tok-num">{part}</span>;
    if (/^(const|let|var|function|return|if|else|elseif|foreach|for|while|import|export|from|class|interface|type|public|private|protected|static|async|await|def|fn|func|struct|echo|use|namespace|new|try|catch|throw|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE)$/.test(part)) {
      return <span key={idx} className="tok-key">{part}</span>;
    }
    return <Fragment key={idx}>{part}</Fragment>;
  });
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [activeTab, setActiveTab] = useState<Tab>("write");
  const [content, setContent] = useState<string>("");
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [formatError, setFormatError] = useState<string | null>(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [encryptedResult, setEncryptedResult] = useState<EncryptedPayload | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("typely-theme", theme);
  }, [theme]);

  const lineCount = useMemo(() => {
    return Math.max(content.split("\n").length, 13);
  }, [content]);

  const previewSections = useMemo(() => parseMixedSections(content), [content]);

  const commitContent = (next: string) => {
    if (next.length > MAX_CHARS) return;
    setContent(next);
    setFormatError(null);
    const sliced = history.slice(0, historyIndex + 1);
    if (sliced[sliced.length - 1] !== next) {
      const updated = [...sliced, next].slice(-50);
      setHistory(updated);
      setHistoryIndex(updated.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const prevIdx = historyIndex - 1;
    setHistoryIndex(prevIdx);
    setContent(history[prevIdx]);
    setFormatError(null);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIdx = historyIndex + 1;
    setHistoryIndex(nextIdx);
    setContent(history[nextIdx]);
    setFormatError(null);
  };

  const wrapSelection = (before: string, after = before, placeholder = "text") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    commitContent(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const prefixLine = (prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const next = content.slice(0, lineStart) + prefix + content.slice(lineStart);
    commitContent(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  };

  const insertFencedBlock = (lang: string) => {
    const el = textareaRef.current;
    const header = `\`\`\`${lang}`;
    const template = `${header}\n\n\`\`\``;
    setLangMenuOpen(false);

    if (!el) {
      const prefix = content && !content.endsWith("\n") ? "\n\n" : "";
      commitContent(`${content}${prefix}${template}\n`);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end).trim();
    const block = selected ? `${header}\n${selected}\n\`\`\`` : template;

    const before = content.slice(0, start);
    const after = content.slice(end);
    const lead = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
    const trail = after.length > 0 && !after.startsWith("\n") ? "\n" : "";

    const next = before + lead + block + trail + after;
    commitContent(next);

    const cursorPos = before.length + lead.length + header.length + 1;
    requestAnimationFrame(() => {
      el.focus();
      if (!selected) {
        el.setSelectionRange(cursorPos, cursorPos);
      }
    });
  };

  const handleFormat = () => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? 0;
    const end = el?.selectionEnd ?? 0;
    const result = formatFieldContent(content, start, end, "auto");
    if (!result.ok) {
      setFormatError(result.error ?? "Invalid format");
      return;
    }
    commitContent(result.output);
  };

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    if (!content.trim()) return;
    setSharing(true);
    try {
      const bundleJson = JSON.stringify({ version: 1, content });
      const encrypted = await encryptBundle(bundleJson);
      setEncryptedResult(encrypted);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "1rem 1.5rem 2rem",
      }}
    >
      {/* Clean Header with Handwritten Brand Signature */}
      <header
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "880px",
          width: "100%",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "0.8rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span
            style={{
              position: "relative",
              fontFamily: "var(--font-hand)",
              fontSize: "2rem",
              fontWeight: 700,
              lineHeight: 1,
              color: "var(--ink)",
              transform: "rotate(-1.5deg)",
              display: "inline-block",
            }}
          >
            Typely
            <MarkerSwoosh color="var(--marker-warm)" />
          </span>
        </div>

        {/* Centered Tabs with Thin Sketchy Underline */}
        <nav style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
          {(
            [
              { id: "write", label: "Write" },
              { id: "preview", label: "Preview" },
              { id: "docs", label: "Docs" },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: isActive ? "var(--ink)" : "var(--ink-muted)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                  position: "relative",
                  padding: "0.2rem 0.1rem",
                }}
              >
                {tab.label}
                {isActive && <SketchUnderline className="tab-underline" />}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
          className="clean-btn"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? <IconMoon size={14} /> : <IconSun size={14} />}
          <span>{theme === "light" ? "Dark" : "Light"}</span>
        </button>
      </header>

      <style>{`
        .tab-underline {
          position: absolute;
          left: -4px;
          right: -4px;
          bottom: -5px;
          height: 7px;
          color: var(--accent);
        }
        .tb-icon {
          background: transparent;
          border: 1px solid transparent;
          color: var(--ink-muted);
          font-family: var(--font-mono);
          font-size: 0.78rem;
          padding: 0.24rem 0.45rem;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: color 0.12s ease, background 0.12s ease;
        }
        .tb-icon:hover:not(:disabled) {
          color: var(--ink);
          background: var(--surface-hover);
        }
        .tb-icon:disabled {
          opacity: 0.35;
          cursor: default;
        }
      `}</style>

      {/* Main Code-First Workspace */}
      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "840px",
          width: "100%",
          margin: "1.1rem auto 0",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "0.4rem",
            padding: "0 0.2rem",
            fontSize: "0.78rem",
            fontFamily: "var(--font-mono)",
            color: "var(--ink-muted)",
          }}
        >
          {content.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </div>

        {/* Crisp Clean Card */}
        <section
          className="clean-card"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {activeTab === "write" && (
            <>
              {/* Clean Markdown Toolbar */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.4rem",
                  padding: "0.5rem 0.85rem",
                  borderBottom: "1px solid var(--border)",
                  background: "var(--surface-sub)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.15rem", flexWrap: "wrap" }}>
                  <button type="button" className="tb-icon" style={{ fontWeight: 700 }} title="Bold" onClick={() => wrapSelection("**", "**", "bold")}>B</button>
                  <button type="button" className="tb-icon" style={{ fontStyle: "italic" }} title="Italic" onClick={() => wrapSelection("*", "*", "italic")}>I</button>
                  <button type="button" className="tb-icon" style={{ textDecoration: "line-through" }} title="Strikethrough" onClick={() => wrapSelection("~~", "~~", "strike")}>S</button>
                  <button type="button" className="tb-icon" title="Inline Code" onClick={() => wrapSelection("`", "`", "code")}>{"<>"}</button>

                  <span style={{ color: "var(--border-strong)", margin: "0 0.2rem" }}>|</span>

                  <button type="button" className="tb-icon" title="Heading 1" onClick={() => prefixLine("# ")}>H1</button>
                  <button type="button" className="tb-icon" title="Heading 2" onClick={() => prefixLine("## ")}>H2</button>
                  <button type="button" className="tb-icon" title="Heading 3" onClick={() => prefixLine("### ")}>H3</button>

                  <span style={{ color: "var(--border-strong)", margin: "0 0.2rem" }}>|</span>

                  <button type="button" className="tb-icon" title="Bullet List" onClick={() => prefixLine("- ")}><IconBulletList /></button>
                  <button type="button" className="tb-icon" title="Numbered List" onClick={() => prefixLine("1. ")}><IconNumberList /></button>
                  <button type="button" className="tb-icon" title="Quote" onClick={() => prefixLine("> ")}><IconQuote /></button>
                  <button type="button" className="tb-icon" title="Link" onClick={() => wrapSelection("[", "](https://)", "link")}><IconLink /></button>
                  <button type="button" className="tb-icon" title="Divider" onClick={() => prefixLine("---\n")}>—</button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  <button type="button" className="tb-icon" title="Undo" disabled={historyIndex <= 0} onClick={handleUndo}><IconUndo /></button>
                  <button type="button" className="tb-icon" title="Redo" disabled={historyIndex >= history.length - 1} onClick={handleRedo}><IconRedo /></button>
                  <button
                    type="button"
                    className="tb-icon"
                    title="Preview"
                    onClick={() => setActiveTab("preview")}
                    style={{ marginLeft: "0.2rem", fontFamily: "var(--font-sans)", fontSize: "0.8rem" }}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {formatError && (
                <div
                  style={{
                    padding: "0.45rem 1rem",
                    background: "var(--danger-bg)",
                    borderBottom: "1px solid var(--danger)",
                    color: "var(--danger)",
                    fontSize: "0.82rem",
                  }}
                >
                  Format error: {formatError}
                </div>
              )}

              {/* Crisp Code-First Editor */}
              <div
                style={{
                  display: "flex",
                  height: "clamp(300px, 48vh, 430px)",
                  overflow: "hidden",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: "46px",
                    padding: "0.95rem 0.55rem",
                    textAlign: "right",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    lineHeight: "1.6",
                    color: "var(--ink-muted)",
                    opacity: 0.55,
                    borderRight: "1px solid var(--border)",
                    userSelect: "none",
                    overflow: "hidden",
                  }}
                >
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => commitContent(e.target.value)}
                  placeholder={"Start writing markdown, code blocks, or notes here..."}
                  spellCheck={false}
                  style={{
                    flex: 1,
                    width: "100%",
                    height: "100%",
                    padding: "0.95rem 1.15rem",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    resize: "none",
                    color: "var(--ink)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.86rem",
                    lineHeight: "1.6",
                  }}
                />
              </div>

              {/* Clean Footer Bar */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  padding: "0.5rem 0.85rem",
                  borderTop: "1px solid var(--border)",
                  background: "var(--surface-sub)",
                }}
              >
                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <button
                    type="button"
                    onClick={() => setLangMenuOpen((prev) => !prev)}
                    className="clean-btn"
                    style={{ fontSize: "0.82rem" }}
                    title="Insert a formatted code block (JSON, YAML, PHP, etc.)"
                  >
                    + Format ▾
                  </button>

                  {langMenuOpen && (
                    <div
                      className="clean-card"
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 6px)",
                        left: 0,
                        padding: "0.35rem",
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(84px, 1fr))",
                        gap: "0.25rem",
                        zIndex: 20,
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      {CODE_LANGUAGES.map((lang) => (
                        <button
                          key={lang.id || "plain"}
                          type="button"
                          onClick={() => insertFencedBlock(lang.id)}
                          className="clean-btn"
                          style={{
                            justifyContent: "flex-start",
                            fontSize: "0.76rem",
                            padding: "0.28rem 0.5rem",
                            borderColor: "transparent",
                          }}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <button
                    type="button"
                    onClick={handleFormat}
                    className="clean-btn"
                    title="Auto-beautify JSON & YAML blocks"
                  >
                    Beautify
                  </button>
                  <button type="button" onClick={handleCopy} className="clean-btn">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      commitContent("");
                      setEncryptedResult(null);
                    }}
                    className="clean-btn"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "preview" && (
            <div
              style={{
                padding: "1.25rem 1.45rem",
                minHeight: "340px",
                maxHeight: "56vh",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "0.9rem",
              }}
            >
              {previewSections.length === 0 && (
                <div style={{ color: "var(--ink-muted)", fontSize: "0.9rem" }}>
                  Nothing to preview yet. Switch to Write and paste your content.
                </div>
              )}
              {previewSections.map((sec, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "var(--surface-sub)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.35rem 0.85rem",
                      borderBottom: "1px solid var(--border)",
                      fontSize: "0.76rem",
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ color: "var(--ink-muted)" }}>Section #{idx + 1}</span>
                    <span style={{ color: "var(--accent)", textTransform: "uppercase" }}>
                      {sec.type}
                    </span>
                  </div>
                  <pre
                    style={{
                      padding: "0.9rem 1rem",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.84rem",
                      lineHeight: "1.6",
                      overflowX: "auto",
                      whiteSpace: sec.type === "text" ? "pre-wrap" : "pre",
                      color: "var(--ink)",
                    }}
                  >
                    {sec.type === "text"
                      ? sec.content
                      : (() => {
                          const codeType = sec.type;
                          return sec.content.split("\n").map((line, lIdx) => (
                            <div key={lIdx}>{highlightCodeLine(line, codeType)}</div>
                          ));
                        })()}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {activeTab === "docs" && (
            <div
              style={{
                padding: "1.75rem 2rem",
                minHeight: "340px",
                display: "flex",
                flexDirection: "column",
                gap: "0.95rem",
                fontSize: "0.95rem",
                lineHeight: 1.7,
              }}
            >
              <h2 style={{ fontFamily: "var(--font-hand)", fontSize: "2rem", color: "var(--ink)" }}>
                How Typely Works
              </h2>
              <p style={{ color: "var(--ink-muted)" }}>
                1. <strong style={{ color: "var(--ink)" }}>Mix Freely</strong> — Paste API responses, notes, or any code block
                (<code style={{ color: "var(--accent)" }}>```ts</code>, <code style={{ color: "var(--accent)" }}>```json</code>,{" "}
                <code style={{ color: "var(--accent)" }}>```py</code>, <code style={{ color: "var(--accent)" }}>```yaml</code>, etc.) in one field, then click{" "}
                <strong style={{ color: "var(--ink)" }}>Format</strong>.
              </p>
              <p style={{ color: "var(--ink-muted)" }}>
                2. <strong style={{ color: "var(--ink)" }}>Encrypt in Browser</strong> — Clicking Share encrypts your bundle locally with{" "}
                <code style={{ color: "var(--accent)" }}>AES-GCM 256</code>.
              </p>
              <p style={{ color: "var(--ink-muted)" }}>
                3. <strong style={{ color: "var(--ink)" }}>Zero History</strong> — No accounts, no logs. The decryption key stays in the URL{" "}
                <code style={{ color: "var(--accent)" }}>#fragment</code> and never touches the server.
              </p>
            </div>
          )}
        </section>

        {/* Bottom Centered Share CTA with Subtle Handwritten Accent */}
        <div
          style={{
            marginTop: "1.25rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <div
              style={{
                position: "absolute",
                right: "108%",
                top: "-6px",
                display: "flex",
                alignItems: "center",
                gap: "0.15rem",
                color: "var(--ink-muted)",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-hand)",
                  fontSize: "1.2rem",
                  transform: "rotate(-5deg)",
                }}
              >
                locked in browser!
              </span>
              <SketchLoopArrow />
            </div>

            <button
              type="button"
              onClick={handleShare}
              disabled={sharing || content.trim().length === 0}
              className="clean-share-btn"
              style={{ opacity: content.trim().length === 0 ? 0.55 : 1 }}
            >
              <IconLock size={15} />
              <span>{sharing ? "Encrypting..." : "Share"}</span>
            </button>
          </div>

          {encryptedResult && (
            <div
              className="clean-card"
              style={{
                width: "100%",
                padding: "0.9rem 1.15rem",
                fontSize: "0.86rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
                borderColor: "var(--accent-border)",
              }}
            >
              <div style={{ color: "var(--accent)", fontWeight: 600 }}>
                Encrypted locally in browser (AES-GCM-256)
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.76rem",
                  wordBreak: "break-all",
                  color: "var(--ink-muted)",
                }}
              >
                #key={encryptedResult.keyFragment}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>
                Ciphertext length: {encryptedResult.ciphertext.length} chars (siap dikirim ke{" "}
                <code>POST /api/bundles</code>).
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
