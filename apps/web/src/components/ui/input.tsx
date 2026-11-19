import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-9 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface-sub)] px-3 py-1.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] transition-colors focus-visible:outline-none focus-visible:border-[#3d8bff]/75 focus-visible:ring-2 focus-visible:ring-[#3d8bff]/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
