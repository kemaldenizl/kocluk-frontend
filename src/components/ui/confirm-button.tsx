"use client";

import { useState, type ReactNode } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ConfirmButtonProps = {
  onConfirm: () => void;
  children: ReactNode;
  /** Label of the button shown while awaiting confirmation. */
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  size?: ButtonSize;
  /** Variant of the initial trigger button. */
  triggerVariant?: ButtonVariant;
  /** Variant of the confirmation button. */
  confirmVariant?: ButtonVariant;
  className?: string;
};

/**
 * Two-step destructive action: the first click swaps in an inline "confirm / cancel"
 * pair. A lightweight, accessible alternative to a modal for row-level deletes.
 */
export function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  loading = false,
  disabled = false,
  size = "sm",
  triggerVariant = "ghost",
  confirmVariant = "destructive",
  className,
}: ConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        size={size}
        variant={triggerVariant}
        disabled={disabled || loading}
        onClick={() => setConfirming(true)}
        className={className}
      >
        {children}
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Button
        type="button"
        size={size}
        variant={confirmVariant}
        loading={loading}
        disabled={disabled}
        onClick={() => {
          onConfirm();
          setConfirming(false);
        }}
      >
        {confirmLabel}
      </Button>
      <Button type="button" size={size} variant="ghost" disabled={loading} onClick={() => setConfirming(false)}>
        {cancelLabel}
      </Button>
    </div>
  );
}
