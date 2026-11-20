import { useMemo, useRef, useState } from "react";
import { autoFormatOnPaste, formatFieldContent } from "@/core/formatters";
import { renderHighlightedEditorLines } from "@/core/preview-renderer";

export const MAX_CHARS = 200_000;

interface UseWriteOptions {
  onShowToast: (msg: string) => void;
  onClear?: () => void;
}

export function useWrite({ onShowToast, onClear }: UseWriteOptions) {
  const [content, setContent] = useState<string>("");
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [formatError, setFormatError] = useState<string | null>(null);
  const [editorScrolling, setEditorScrolling] = useState(false);

  const editorScrollTimerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const backdropRef = useRef<HTMLPreElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

  const lineCount = useMemo(() => Math.max(content.split("\n").length, 22), [content]);

  const highlightedLines = useMemo(
    () => renderHighlightedEditorLines(content),
    [content]
  );

  const syncScroll = () => {
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

  const restoreEditorFocus = (
    el: HTMLTextAreaElement,
    scrollTop: number,
    scrollLeft: number,
    selStart?: number,
    selEnd?: number
  ) => {
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true });
      if (selStart !== undefined && selEnd !== undefined) {
        el.setSelectionRange(selStart, selEnd);
      }
      el.scrollTop = scrollTop;
      el.scrollLeft = scrollLeft;
      syncScroll();
    });
  };

  const wrapSelection = (before: string, after = before, placeholder = "text") => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, scrollTop, scrollLeft } = el;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    commitContent(next);
    restoreEditorFocus(
      el,
      scrollTop,
      scrollLeft,
      start + before.length,
      start + before.length + selected.length
    );
  };

  const prefixLine = (prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, scrollTop, scrollLeft } = el;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const next = content.slice(0, lineStart) + prefix + content.slice(lineStart);
    commitContent(next);
    restoreEditorFocus(el, scrollTop, scrollLeft, start + prefix.length, start + prefix.length);
  };

  const applyList = (kind: "bullet" | "number") => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, scrollTop, scrollLeft } = el;

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
    restoreEditorFocus(el, scrollTop, scrollLeft, blockStart, blockStart + formatted.length);
  };

  const insertFencedBlock = (lang: string) => {
    const el = textareaRef.current;
    const header = `\`\`\`${lang}`;
    const template = `${header}\n\n\`\`\``;

    if (!el) {
      const prefix = content && !content.endsWith("\n") ? "\n\n" : "";
      commitContent(`${content}${prefix}${template}\n`);
      return;
    }

    const { selectionStart: start, selectionEnd: end, scrollTop, scrollLeft } = el;
    const selected = content.slice(start, end).trim();
    const block = selected ? `${header}\n${selected}\n\`\`\`` : template;

    const before = content.slice(0, start);
    const after = content.slice(end);
    const lead = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
    const trail = after.length > 0 && !after.startsWith("\n") ? "\n" : "";

    const next = before + lead + block + trail + after;
    commitContent(next);

    const cursorPos = before.length + lead.length + header.length + 1;
    if (!selected) {
      restoreEditorFocus(el, scrollTop, scrollLeft, cursorPos, cursorPos);
    } else {
      restoreEditorFocus(el, scrollTop, scrollLeft);
    }
  };

  const handleCodeButton = () => {
    const el = textareaRef.current;
    if (!el) return;
    const selected = content.slice(el.selectionStart, el.selectionEnd);

    if (selected.includes("\n")) {
      insertFencedBlock("");
      return;
    }

    wrapSelection("`", "`", "code");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  const handleBeautify = () => {
    const result = formatFieldContent(content, 0, 0, "auto");
    if (!result.ok) {
      setFormatError(result.error ?? "Invalid format");
      return;
    }
    commitContent(result.output);
    onShowToast("Beautified");
  };

  const handleClear = () => {
    commitContent("");
    onClear?.();
  };

  return {
    content,
    lineCount,
    highlightedLines,
    formatError,
    editorScrolling,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    textareaRef,
    backdropRef,
    gutterRef,
    commitContent,
    syncScroll,
    handlePaste,
    handleUndo,
    handleRedo,
    handleCodeButton,
    wrapSelection,
    prefixLine,
    applyList,
    insertFencedBlock,
    handleKeyDown,
    handleBeautify,
    handleClear,
  };
}
