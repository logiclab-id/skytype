import { useEffect, useMemo, useRef, useState } from "react";
import {
  HandwrittenToast,
  IconBulletList,
  IconLink,
  IconLock,
  IconNumberList,
  IconQuote,
  IconRedo,
  IconUndo,
  MarkerSwoosh,
  SketchLoopArrow,
  SketchUnderline,
} from "@/components/Doodles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { decryptBundle, encryptBundle } from "@/core/crypto";
import { autoFormatOnPaste, formatFieldContent, parseMixedSections } from "@/core/formatters";
import { highlightCodeLine, renderMarkdownText } from "@/core/previewRenderer";
import { DocsView } from "@/modules/DocsView";

type Tab = "write" | "preview" | "docs";

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

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>("write");
  const [content, setContent] = useState<string>("");
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [formatError, setFormatError] = useState<string | null>(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [editorScrolling, setEditorScrolling] = useState(false);

  // Share modal & magic link state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTitle, setShareTitle] = useState("");
  const [shareDesc, setShareDesc] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [magicLink, setMagicLink] = useState<string | null>(null);

  // Shared link viewer state (/s/:id#key)
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedError, setSharedError] = useState<string | null>(null);
  const [sharedData, setSharedData] = useState<{
    title: string;
    description: string;
    content: string;
  } | null>(null);

  const toastTimerRef = useRef<number | null>(null);
  const editorScrollTimerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const backdropRef = useRef<HTMLPreElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1800);
  };

  useEffect(() => {
    if (!langMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [langMenuOpen]);

  useEffect(() => {
    const pathMatch = window.location.pathname.match(/^\/s\/([^/]+)$/);
    if (!pathMatch) return;

    const bundleId = pathMatch[1];
    const keyFragment = window.location.hash.replace(/^#/, "");
    if (!keyFragment) {
      setSharedError("Missing decryption key in URL fragment.");
      return;
    }

    setSharedLoading(true);
    fetch(`/api/bundles/${encodeURIComponent(bundleId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Bundle not found." : `HTTP ${res.status}`);
        return res.json() as Promise<{ ciphertext: string; iv: string }>;
      })
      .then(async ({ ciphertext, iv }) => {
        const plain = await decryptBundle(ciphertext, iv, keyFragment);
        const parsed = JSON.parse(plain) as {
          title?: string;
          description?: string;
          content?: string;
        };
        const title = parsed.title ?? "";
        const description = parsed.description ?? "";
        if (title) document.title = `${title} — Typely`;
        setSharedData({
          title,
          description,
          content: parsed.content ?? "",
        });
      })
      .catch((err: unknown) => {
        setSharedError(err instanceof Error ? err.message : "Failed to decrypt bundle.");
      })
      .finally(() => setSharedLoading(false));
  }, []);

  const lineCount = useMemo(() => Math.max(content.split("\n").length, 13), [content]);
  const previewSections = useMemo(() => parseMixedSections(content), [content]);
  const sharedSections = useMemo(
    () => (sharedData ? parseMixedSections(sharedData.content) : []),
    [sharedData]
  );

  const highlightedEditorLines = useMemo(() => {
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
  }, [content]);

  const syncEditorScroll = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (backdropRef.current) {
      backdropRef.current.scrollTop = ta.scrollTop;
      backdropRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = ta.scrollTop;
    }
    setEditorScrolling(true);
    if (editorScrollTimerRef.current) window.clearTimeout(editorScrollTimerRef.current);
    editorScrollTimerRef.current = window.setTimeout(() => setEditorScrolling(false), 900);
  };

  const commitContent = (next: string, autoFormat = false) => {
    if (next.length > MAX_CHARS) return;
    let finalContent = next;
    if (autoFormat) {
      const res = formatFieldContent(next, 0, 0, "auto");
      if (res.ok) finalContent = res.output;
    }
    setContent(finalContent);
    setFormatError(null);
    const sliced = history.slice(0, historyIndex + 1);
    if (sliced[sliced.length - 1] !== finalContent) {
      const updated = [...sliced, finalContent].slice(-50);
      setHistory(updated);
      setHistoryIndex(updated.length - 1);
    }
  };

  const handleTextareaChange = (next: string) => {
    commitContent(next);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (!pasted) return;
    const el = textareaRef.current;
    if (!el) return;

    const formatted = autoFormatOnPaste(content, el.selectionStart, el.selectionEnd, pasted);
    if (formatted !== content.slice(0, el.selectionStart) + pasted + content.slice(el.selectionEnd)) {
      e.preventDefault();
      commitContent(formatted);
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

  const handleCodeButton = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);

    if (selected.includes("\n")) {
      insertFencedBlock("");
      return;
    }

    wrapSelection("`", "`", "code");
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

  const applyList = (kind: "bullet" | "number") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    const blockStart = content.lastIndexOf("\n", start - 1) + 1;
    const nextNewline = content.indexOf("\n", end);
    const blockEnd = nextNewline === -1 ? content.length : nextNewline;

    const lines = content.slice(blockStart, blockEnd).split("\n");
    let counter = 1;
    const formatted = lines
      .map((line) => {
        const stripped = line.replace(/^([ \t]*)(?:[•◦▪▫‣⁃∙]|[-*+]|\d+[.)])\s+/, "$1");
        const indentMatch = stripped.match(/^([ \t]*)(.*)$/);
        const indent = indentMatch ? indentMatch[1] : "";
        const body = indentMatch ? indentMatch[2] : stripped;
        if (kind === "bullet") return `${indent}- ${body}`;
        return `${indent}${counter++}. ${body}`;
      })
      .join("\n");

    const next = content.slice(0, blockStart) + formatted + content.slice(blockEnd);
    commitContent(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(blockStart, blockStart + formatted.length);
    });
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    const el = textareaRef.current;
    if (!el) return;

    const pos = el.selectionStart;
    if (pos !== el.selectionEnd) return;

    const lineStart = content.lastIndexOf("\n", pos - 1) + 1;
    const currentLine = content.slice(lineStart, pos);

    if (/^\s*```\s*$/.test(currentLine) && (content.slice(0, pos).match(/```/g)?.length ?? 0) % 2 === 0) {
      e.preventDefault();
      const next = content.slice(0, pos) + "\n" + content.slice(pos);
      commitContent(next, true);
      return;
    }

    const bulletMatch = currentLine.match(/^([ \t]*)- (.*)$/);
    const numMatch = currentLine.match(/^([ \t]*)(\d+)\. (.*)$/);
    if (!bulletMatch && !numMatch) return;

    e.preventDefault();
    const isEmptyItem = bulletMatch ? bulletMatch[2].trim() === "" : numMatch![3].trim() === "";
    if (isEmptyItem) {
      const next = content.slice(0, lineStart) + "\n" + content.slice(pos);
      commitContent(next);
      requestAnimationFrame(() => el.setSelectionRange(lineStart + 1, lineStart + 1));
      return;
    }

    const prefix = bulletMatch ? `${bulletMatch[1]}- ` : `${numMatch![1]}${Number(numMatch![2]) + 1}. `;
    const insert = `\n${prefix}`;
    const next = content.slice(0, pos) + insert + content.slice(pos);
    commitContent(next);
    requestAnimationFrame(() => el.setSelectionRange(pos + insert.length, pos + insert.length));
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
      if (!selected) el.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleFormat = () => {
    const result = formatFieldContent(content, 0, 0, "auto");
    if (!result.ok) {
      setFormatError(result.error ?? "Invalid format");
      return;
    }
    commitContent(result.output);
    showToast("Beautified");
  };

  const handleOpenShareModal = () => {
    if (!content.trim()) return;
    setShareError(null);
    setMagicLink(null);
    setShareModalOpen(true);
  };

  const handleGenerateMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !shareTitle.trim()) return;
    setSharing(true);
    setShareError(null);
    try {
      const bundleJson = JSON.stringify({
        version: 1,
        title: shareTitle.trim(),
        description: shareDesc.trim(),
        content,
      });
      const encrypted = await encryptBundle(bundleJson);

      const res = await fetch("/api/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ciphertext: encrypted.ciphertext, iv: encrypted.iv }),
      });

      if (!res.ok) throw new Error(`API error (${res.status})`);
      const data = (await res.json()) as { id: string };
      setMagicLink(`${window.location.origin}/s/${data.id}#${encrypted.keyFragment}`);
    } catch (err) {
      setShareError(err instanceof Error ? err.message : "Failed to create magic link");
    } finally {
      setSharing(false);
    }
  };

  const isViewerRoute = window.location.pathname.startsWith("/s/");

  if (isViewerRoute) {
    return (
      <div style={{ minHeight: "100vh", position: "relative", display: "flex", flexDirection: "column", padding: "1rem 1.5rem 2.5rem" }}>
        <header
          style={{
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
          <a
            href="/"
            style={{
              position: "relative",
              fontFamily: "var(--font-hand)",
              fontSize: "2rem",
              fontWeight: 700,
              lineHeight: 1,
              color: "var(--ink)",
              transform: "rotate(-1.5deg)",
              display: "inline-block",
              textDecoration: "none",
            }}
          >
            Typely
            <MarkerSwoosh color="var(--marker-warm)" />
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <a href="/" className="clean-btn" style={{ textDecoration: "none" }}>
              + New Bundle
            </a>
          </div>
        </header>

        <main style={{ maxWidth: "840px", width: "100%", margin: "1.4rem auto 0", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {sharedLoading && (
            <div className="clean-card" style={{ padding: "2rem", color: "var(--ink-muted)", fontSize: "0.9rem" }}>
              Decrypting bundle locally in your browser...
            </div>
          )}

          {sharedError && (
            <div className="clean-card" style={{ padding: "1.5rem", color: "var(--danger)", borderColor: "var(--danger)", fontSize: "0.9rem" }}>
              {sharedError}
            </div>
          )}

          {sharedData && (
            <>
              {(sharedData.title || sharedData.description) && (
                <div className="clean-card" style={{ padding: "1.15rem 1.4rem" }}>
                  {sharedData.title && (
                    <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ink)" }}>
                      {sharedData.title}
                    </h1>
                  )}
                  {sharedData.description && (
                    <p style={{ marginTop: "0.3rem", fontSize: "0.9rem", color: "var(--ink-muted)", lineHeight: 1.5 }}>
                      {sharedData.description}
                    </p>
                  )}
                </div>
              )}

              <section
                className="clean-card"
                style={{
                  padding: "1.35rem 1.6rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.86rem",
                  lineHeight: "1.6",
                  color: "var(--ink)",
                }}
              >
                {sharedSections.map((sec, idx) =>
                  sec.type === "text" ? (
                    <div key={idx} className="tok-prose" style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                      {renderMarkdownText(sec.content)}
                    </div>
                  ) : (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        background: "var(--surface-sub)",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ position: "absolute", top: "0.45rem", right: "0.6rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                        <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", fontWeight: 600, textTransform: "uppercase", color: "var(--ink-muted)", opacity: 0.7 }}>
                          {sec.type}
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(sec.content);
                            showToast(`Copied ${sec.type.toUpperCase()} block`);
                          }}
                          className="clean-btn"
                          style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem", background: "var(--surface)" }}
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="tok-code-base" style={{ padding: "0.9rem 1rem", overflowX: "auto" }}>
                        {sec.content.split("\n").map((line, lIdx) => (
                          <div key={lIdx}>{highlightCodeLine(line, sec.type)}</div>
                        ))}
                      </pre>
                    </div>
                  )
                )}
              </section>
            </>
          )}
        </main>

        {toast && <HandwrittenToast message={toast} />}
      </div>
    );
  }

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

        <div style={{ width: "68px" }} />
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
        {activeTab === "write" && (
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
        )}

        <section className="clean-card" style={{ display: "flex", flexDirection: "column" }}>
          {activeTab === "write" && (
            <>
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
                  <button type="button" className="tb-icon" title="Inline / Block Code" onClick={handleCodeButton}>{"<>"}</button>

                  <span style={{ color: "var(--border-strong)", margin: "0 0.2rem" }}>|</span>

                  <button type="button" className="tb-icon" title="Heading 1" onClick={() => prefixLine("# ")}>H1</button>
                  <button type="button" className="tb-icon" title="Heading 2" onClick={() => prefixLine("## ")}>H2</button>
                  <button type="button" className="tb-icon" title="Heading 3" onClick={() => prefixLine("### ")}>H3</button>

                  <span style={{ color: "var(--border-strong)", margin: "0 0.2rem" }}>|</span>

                  <button type="button" className="tb-icon" title="Bullet List" onClick={() => applyList("bullet")}><IconBulletList /></button>
                  <button type="button" className="tb-icon" title="Numbered List" onClick={() => applyList("number")}><IconNumberList /></button>
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

              <div style={{ display: "flex", height: "clamp(300px, 48vh, 430px)", overflow: "hidden" }}>
                <div
                  ref={gutterRef}
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

                <div style={{ position: "relative", flex: 1, height: "100%", overflow: "hidden" }}>
                  <pre
                    ref={backdropRef}
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      padding: "0.95rem 1.15rem",
                      margin: 0,
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.86rem",
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      overflow: "hidden",
                      pointerEvents: "none",
                      color: "var(--ink)",
                    }}
                  >
                    {highlightedEditorLines}
                  </pre>

                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => handleTextareaChange(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={handleEditorKeyDown}
                    onScroll={syncEditorScroll}
                    className={editorScrolling ? "is-scrolling" : ""}
                    placeholder={"Start writing markdown, code blocks, or notes here..."}
                    spellCheck={false}
                    style={{
                      position: "relative",
                      zIndex: 1,
                      width: "100%",
                      height: "100%",
                      padding: "0.95rem 1.15rem",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      resize: "none",
                      color: content ? "transparent" : "var(--ink)",
                      caretColor: "var(--ink)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.86rem",
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  />
                </div>
              </div>

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
                <div ref={langMenuRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <button
                    type="button"
                    onClick={() => setLangMenuOpen((prev) => !prev)}
                    className="clean-btn"
                    style={{ fontSize: "0.82rem" }}
                    title="Insert a formatted code block (JSON, YAML, PHP, etc.)"
                  >
                    Format ▾
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
                          style={{ justifyContent: "flex-start", fontSize: "0.76rem", padding: "0.28rem 0.5rem", borderColor: "transparent" }}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <button type="button" onClick={handleFormat} className="clean-btn" title="Auto-beautify JSON & YAML blocks">
                    Beautify
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      commitContent("");
                      setMagicLink(null);
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
                padding: "1.35rem 1.6rem",
                minHeight: "340px",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.86rem",
                lineHeight: "1.6",
                color: "var(--ink)",
              }}
            >
              {previewSections.length === 0 && (
                <div style={{ color: "var(--ink-muted)", fontSize: "0.9rem" }}>
                  Nothing to preview yet. Switch to Write and paste your content.
                </div>
              )}
              {previewSections.map((sec, idx) =>
                sec.type === "text" ? (
                  <div key={idx} className="tok-prose" style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                    {renderMarkdownText(sec.content)}
                  </div>
                ) : (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      flexShrink: 0,
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      background: "var(--surface-sub)",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ position: "absolute", top: "0.45rem", right: "0.6rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                      <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", fontWeight: 600, textTransform: "uppercase", color: "var(--ink-muted)", opacity: 0.7, pointerEvents: "none" }}>
                        {sec.type}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(sec.content);
                          showToast(`Copied ${sec.type.toUpperCase()} block`);
                        }}
                        className="clean-btn"
                        style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem", background: "var(--surface)" }}
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="tok-code-base" style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.86rem", lineHeight: "1.6", overflowX: "auto" }}>
                      {sec.content.split("\n").map((line, lIdx) => (
                        <div key={lIdx}>{highlightCodeLine(line, sec.type)}</div>
                      ))}
                    </pre>
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === "docs" && <DocsView />}
        </section>

        {activeTab !== "docs" && (
          <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <div style={{ position: "absolute", right: "108%", top: "-6px", display: "flex", alignItems: "center", gap: "0.15rem", color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: "var(--font-hand)", fontSize: "1.2rem", transform: "rotate(-5deg)" }}>
                  locked in browser!
                </span>
                <SketchLoopArrow />
              </div>

              <button
                type="button"
                onClick={handleOpenShareModal}
                disabled={content.trim().length === 0}
                className="clean-share-btn"
                style={{ opacity: content.trim().length === 0 ? 0.55 : 1 }}
              >
                <IconLock size={15} />
                <span>Share</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <span
                style={{
                  position: "relative",
                  display: "inline-block",
                  fontFamily: "var(--font-hand)",
                  fontSize: "1.85rem",
                  fontWeight: 700,
                  lineHeight: 1.05,
                }}
              >
                Share your note
                <MarkerSwoosh color="var(--marker-accent)" />
              </span>
            </DialogTitle>
            <DialogDescription>
              Encrypted in your browser before it leaves this page.
              <br />
              Zero history only people with the link can read it.
            </DialogDescription>
          </DialogHeader>

          {!magicLink ? (
            <form onSubmit={handleGenerateMagicLink} className="mt-4 flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="share-title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="share-title"
                  type="text"
                  required
                  value={shareTitle}
                  onChange={(e) => setShareTitle(e.target.value)}
                  placeholder="Enter title"
                  maxLength={120}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="share-desc">Description</Label>
                <Textarea
                  id="share-desc"
                  value={shareDesc}
                  onChange={(e) => setShareDesc(e.target.value)}
                  placeholder="Enter description"
                  maxLength={280}
                  rows={3}
                />
              </div>

              {shareError && (
                <div className="text-xs text-[var(--danger)]">
                  {shareError} (pastikan backend <code>apps/api</code> berjalan &amp; sudah di-restart)
                </div>
              )}

              <div className="mt-1 flex justify-end">
                <Button type="submit" disabled={sharing || !shareTitle.trim()}>
                  <IconLock size={14} />
                  <span>{sharing ? "Sharing..." : "Share"}</span>
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-4 flex flex-col gap-3.5">
              {(shareTitle || shareDesc) && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-sub)] px-3.5 py-2.5">
                  {shareTitle && (
                    <div className="text-sm font-semibold text-[var(--ink)]">{shareTitle}</div>
                  )}
                  {shareDesc && (
                    <div className="mt-0.5 text-xs text-[var(--ink-muted)]">{shareDesc}</div>
                  )}
                </div>
              )}

              <div className="break-all rounded-md border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-2 font-mono text-xs text-[var(--ink)]">
                {magicLink}
              </div>

              <div className="flex items-center justify-between">
                <a
                  href={magicLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  Open link ↗
                </a>
                <Button
                  type="button"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(magicLink);
                    showToast("Magic link copied");
                  }}
                >
                  Copy Magic Link
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {toast && <HandwrittenToast message={toast} />}
    </div>
  );
}

export default App;
