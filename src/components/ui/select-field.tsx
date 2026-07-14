import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

type Option = { value: string | number; label: string };

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label: string;
  options: readonly Option[];
  /** Disabled placeholder shown when no value is selected. */
  placeholder?: string;
  /** Inline validation message; sets the invalid state and is announced to AT. */
  error?: string;
  /** Helper text shown below the select when there is no error. */
  hint?: ReactNode;
};

/**
 * Labelled native `<select>` with the same hint/error + a11y wiring as {@link Field}.
 * Native on purpose: fully accessible and keyboard-friendly with no extra JS.
 */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, options, placeholder, error, hint, id, name, className, required, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? name ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="group flex flex-col gap-2" data-disabled={props.disabled || undefined}>
      <Label htmlFor={fieldId}>
        {label}
        {required ? <span className="text-error">*</span> : null}
      </Label>
      <div className="relative">
        <select
          id={fieldId}
          name={name}
          ref={ref}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "flex h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-surface px-3 py-1 pr-9 text-sm shadow-xs cursor-pointer",
            "transition-[color,box-shadow] duration-[--duration-fast] outline-none",
            "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
            "aria-[invalid=true]:border-error aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-error/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "invalid:text-muted-foreground",
            className,
          )}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute inset-y-0 right-0 my-auto mr-3 size-4 text-muted-foreground" />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
