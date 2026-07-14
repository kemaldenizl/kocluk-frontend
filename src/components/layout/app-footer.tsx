import { Brand } from "./brand";

/** Minimal application footer. */
export function AppFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-(--spacing-container) flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
        <Brand />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Koçluk. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
