import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Accessible loading spinner. Announces "Loading" to assistive tech. */
export function Spinner({ className, ...props }: React.ComponentProps<typeof Loader2>) {
  return (
    <Loader2
      role="status"
      aria-label="Yükleniyor"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}
