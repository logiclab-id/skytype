import { WriteFooter } from "@/modules/write/write-footer";
import { WriteToolbar } from "@/modules/write/write-toolbar";
import type { useWrite } from "@/modules/write/use-write";

type WriteState = ReturnType<typeof useWrite>;

interface WriteViewProps {
  write: WriteState;
  onPreview: () => void;
}

export function WriteView({ write, onPreview }: WriteViewProps) {
  return (
    <>
      <WriteToolbar
        canUndo={write.canUndo}
        canRedo={write.canRedo}
        onWrapSelection={write.wrapSelection}
        onPrefixLine={write.prefixLine}
        onApplyList={write.applyList}
        onCodeClick={write.handleCodeButton}
        onUndo={write.handleUndo}
        onRedo={write.handleRedo}
        onPreview={onPreview}
      />

      {write.formatError && (
        <div
          style={{
            padding: "0.45rem 1rem",
            background: "var(--danger-bg)",
            borderBottom: "1px solid var(--danger)",
            color: "var(--danger)",
            fontSize: "0.82rem",
          }}
        >
          Format error: {write.formatError}
        </div>
      )}

      <div style={{ display: "flex", height: "clamp(300px, calc(100vh - 295px), 620px)", overflow: "hidden" }}>
        <div
          ref={write.gutterRef}
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
          {Array.from({ length: write.lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        <div style={{ position: "relative", flex: 1, height: "100%", overflow: "hidden" }}>
          <pre
            ref={write.backdropRef}
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
            {write.highlightedLines}
          </pre>

          <textarea
            ref={write.textareaRef}
            value={write.content}
            onChange={(e) => write.commitContent(e.target.value)}
            onPaste={write.handlePaste}
            onKeyDown={write.handleKeyDown}
            onScroll={write.syncScroll}
            className={write.editorScrolling ? "is-scrolling" : ""}
            placeholder="Start writing markdown, code blocks, or notes here..."
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
              color: write.content ? "transparent" : "var(--ink)",
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

      <WriteFooter
        onInsertBlock={write.insertFencedBlock}
        onBeautify={write.handleBeautify}
        onClear={write.handleClear}
      />
    </>
  );
}
