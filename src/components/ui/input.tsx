import { cn } from "@/lib/cn";
import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-border bg-surface-2/70 px-4 text-[15px] text-foreground outline-none transition placeholder:text-muted/80 focus:border-foreground/20 focus:bg-surface focus:shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-none rounded-2xl border border-border bg-surface-2/70 px-4 py-3 text-[15px] text-foreground outline-none transition placeholder:text-muted/80 focus:border-foreground/20 focus:bg-surface focus:shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-12 w-full appearance-none rounded-2xl border border-border bg-surface-2/70 px-4 text-[15px] text-foreground outline-none transition focus:border-foreground/20 focus:bg-surface",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-[13px] font-medium text-muted", className)}
      {...props}
    />
  );
}
