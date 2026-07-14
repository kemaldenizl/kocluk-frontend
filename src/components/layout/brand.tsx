import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/constants";

/** Logo lockup — a brand mark + wordmark. Links home. */
export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href={ROUTES.home}
      className={cn(
        "group flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs"
      >
        <span className="text-sm font-bold tracking-tight">K</span>
      </span>
      <span className="text-sm font-semibold tracking-tight">Koçluk</span>
    </Link>
  );
}
