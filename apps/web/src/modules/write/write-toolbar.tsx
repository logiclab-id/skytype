import {
  IconBulletList,
  IconLink,
  IconNumberList,
  IconQuote,
  IconRedo,
  IconUndo,
} from "@/components/doodles";

interface WriteToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onWrapSelection: (before: string, after?: string, placeholder?: string) => void;
  onPrefixLine: (prefix: string) => void;
  onApplyList: (kind: "bullet" | "number") => void;
  onCodeClick: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPreview: () => void;
}

export function WriteToolbar({
  canUndo,
  canRedo,
  onWrapSelection,
  onPrefixLine,
  onApplyList,
  onCodeClick,
  onUndo,
  onRedo,
  onPreview,
}: WriteToolbarProps) {
  return (
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
        <button type="button" className="tb-icon" style={{ fontWeight: 700 }} title="Bold" onClick={() => onWrapSelection("**", "**", "bold")}>B</button>
        <button type="button" className="tb-icon" style={{ fontStyle: "italic" }} title="Italic" onClick={() => onWrapSelection("*", "*", "italic")}>I</button>
        <button type="button" className="tb-icon" style={{ textDecoration: "line-through" }} title="Strikethrough" onClick={() => onWrapSelection("~~", "~~", "strike")}>S</button>
        <button type="button" className="tb-icon" title="Inline / Block Code" onClick={onCodeClick}>{"<>"}</button>

        <span style={{ color: "var(--border-strong)", margin: "0 0.2rem" }}>|</span>

        <button type="button" className="tb-icon" title="Heading 1" onClick={() => onPrefixLine("# ")}>H1</button>
        <button type="button" className="tb-icon" title="Heading 2" onClick={() => onPrefixLine("## ")}>H2</button>
        <button type="button" className="tb-icon" title="Heading 3" onClick={() => onPrefixLine("### ")}>H3</button>

        <span style={{ color: "var(--border-strong)", margin: "0 0.2rem" }}>|</span>

        <button type="button" className="tb-icon" title="Bullet List" onClick={() => onApplyList("bullet")}><IconBulletList /></button>
        <button type="button" className="tb-icon" title="Numbered List" onClick={() => onApplyList("number")}><IconNumberList /></button>
        <button type="button" className="tb-icon" title="Quote" onClick={() => onPrefixLine("> ")}><IconQuote /></button>
        <button type="button" className="tb-icon" title="Link" onClick={() => onWrapSelection("[", "](https://)", "link")}><IconLink /></button>
        <button type="button" className="tb-icon" title="Divider" onClick={() => onPrefixLine("---\n")}>—</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
        <button type="button" className="tb-icon" title="Undo" disabled={!canUndo} onClick={onUndo}><IconUndo /></button>
        <button type="button" className="tb-icon" title="Redo" disabled={!canRedo} onClick={onRedo}><IconRedo /></button>
        <button
          type="button"
          className="tb-icon"
          title="Preview"
          onClick={onPreview}
          style={{ marginLeft: "0.2rem", fontFamily: "var(--font-sans)", fontSize: "0.8rem" }}
        >
          Preview
        </button>
      </div>
    </div>
  );
}
