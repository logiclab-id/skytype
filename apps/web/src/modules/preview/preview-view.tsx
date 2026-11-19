import { useMemo } from "react";
import { BundleContent } from "@/components/bundle-content";
import { parseMixedSections } from "@/core/formatters";

interface PreviewViewProps {
  content: string;
  onShowToast: (msg: string) => void;
}

export function PreviewView({ content, onShowToast }: PreviewViewProps) {
  const sections = useMemo(() => parseMixedSections(content), [content]);

  return (
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
      {sections.length === 0 ? (
        <div style={{ color: "var(--ink-muted)", fontSize: "0.9rem" }}>
          Nothing to preview yet. Switch to Write and paste your content.
        </div>
      ) : (
        <BundleContent
          sections={sections}
          onCopyBlock={(lang) => onShowToast(`Copied ${lang.toUpperCase()} block`)}
        />
      )}
    </div>
  );
}
