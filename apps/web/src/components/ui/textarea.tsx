import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[76px] w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface-sub)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] transition-colors focus-visible:outline-none focus-visible:border-[#3d8bff]/75 focus-visible:ring-2 focus-visible:ring-[#3d8bff]/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
