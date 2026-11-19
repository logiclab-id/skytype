import type { ParsedSection } from "@/core/formatters";
import { highlightCodeLine, renderMarkdownText } from "@/core/preview-renderer";

interface BundleContentProps {
  sections: ParsedSection[];
  onCopyBlock: (lang: string) => void;
}

export function BundleContent({ sections, onCopyBlock }: BundleContentProps) {
  return (
    <>
      {sections.map((sec, idx) =>
        sec.type === "text" ? (
          <div
            key={idx}
            className="tok-prose"
            style={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.15rem",
            }}
          >
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
            <div
              style={{
                position: "absolute",
                top: "0.45rem",
                right: "0.6rem",
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.68rem",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "var(--ink-muted)",
                  opacity: 0.7,
                  pointerEvents: "none",
                }}
              >
                {sec.type}
              </span>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(sec.content);
                  onCopyBlock(sec.type);
                }}
                className="clean-btn"
                style={{
                  fontSize: "0.7rem",
                  padding: "0.15rem 0.45rem",
                  background: "var(--surface)",
                }}
              >
                Copy
              </button>
            </div>
            <pre
              className="tok-code-base"
              style={{
                padding: "0.9rem 1rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.86rem",
                lineHeight: "1.6",
                overflowX: "auto",
              }}
            >
              {sec.content.split("\n").map((line, lIdx) => (
                <div key={lIdx}>{highlightCodeLine(line, sec.type)}</div>
              ))}
            </pre>
          </div>
        )
      )}
    </>
  );
}
