"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** Inline validation message; sets the invalid state and is announced to AT. */
  error?: string;
  /** Helper text shown below the input when there is no error. */
  hint?: ReactNode;
  /** Marks the field visually + semantically optional. */
  optional?: boolean;
};

/**
 * Labelled input with hint/error and full a11y wiring (label association,
 * aria-invalid, aria-describedby). The default form building block — forms compose
 * these instead of assembling Label + Input by hand.
 *
 * Password fields render a trailing show/hide toggle that flips the input between
 * masked and plain text.
 */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, hint, optional, id, name, className, required, type = "text", ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? name ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);
  const inputType = isPassword && revealed ? "text" : type;

  return (
    <div className="group flex flex-col gap-2" data-disabled={props.disabled || undefined}>
      <Label htmlFor={fieldId}>
        {label}
        {optional ? <span className="text-xs font-normal text-muted-foreground">(optional)</span> : null}
        {required ? <span className="text-error">*</span> : null}
      </Label>
      <div className="relative">
        <Input
          id={fieldId}
          name={name}
          ref={ref}
          type={inputType}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(isPassword && "pr-10", className)}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            disabled={props.disabled}
            tabIndex={-1}
            aria-label={revealed ? "Şifreyi gizle" : "Şifreyi göster"}
            aria-pressed={revealed}
            className={cn(
              "absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground cursor-pointer",
              "transition-colors hover:text-foreground",
              "outline-none focus-visible:text-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className={cn("text-xs text-muted-foreground")}>
          {hint}
        </p>
      ) : null}
    </div>
  );
});

/**
 * Invisible spacer that matches a {@link Field} label's height. Place it above a
 * control (e.g. a Button) sitting beside a Field in a `sm:flex-row sm:items-start`
 * row so the control's top aligns with the input — regardless of any hint/error the
 * Field renders below its input. Pass `className="hidden sm:block"` when the row only
 * becomes horizontal at the `sm` breakpoint.
 */
export function FieldLabelSpacer({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("text-sm font-medium leading-none", className)}>
      {" "}
    </span>
  );
}
