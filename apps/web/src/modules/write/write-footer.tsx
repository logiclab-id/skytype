import { useEffect, useRef, useState } from "react";

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

interface WriteFooterProps {
  onInsertBlock: (lang: string) => void;
  onBeautify: () => void;
  onClear: () => void;
}

export function WriteFooter({
  onInsertBlock,
  onBeautify,
  onClear,
}: WriteFooterProps) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!langMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(e.target as Node)
      ) {
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

  return (
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
      <div
        ref={langMenuRef}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
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
          <div className="clean-card lang-menu">
            {CODE_LANGUAGES.map((lang) => (
              <button
                key={lang.id || "plain"}
                type="button"
                onClick={() => {
                  setLangMenuOpen(false);
                  onInsertBlock(lang.id);
                }}
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
          onClick={onBeautify}
          className="clean-btn"
          title="Auto-beautify JSON & YAML blocks"
        >
          Beautify
        </button>
        <button type="button" onClick={onClear} className="clean-btn">
          Clear
        </button>
      </div>
    </div>
  );
}
