import { cn } from "@/lib/utils";

/** Derives up to two uppercase initials from an email or name. */
export function initialsFrom(value: string): string {
  const base = value.split("@")[0] ?? value;
  const parts = base.split(/[.\-_\s]+/).filter(Boolean);
  const letters = (parts.length >= 2 ? parts[0][0] + parts[1][0] : base.slice(0, 2)) || "?";
  return letters.toUpperCase();
}

/** Compact identity avatar with an initials fallback. */
export function Avatar({
  name,
  className,
  ...props
}: React.ComponentProps<"span"> & { name?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground select-none",
        className,
      )}
      {...props}
    >
      {name ? initialsFrom(name) : "?"}
    </span>
  );
}
