"use client";

import { useState } from "react";
import { Check, Copy, Download, KeyRound } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Shows one-time recovery codes with copy/download helpers and a prominent warning
 * that they are displayed only once. Used after enrolment and after regeneration.
 */
export function RecoveryCodes({ codes }: { codes: string[] }) {
  const [copied, setCopied] = useState(false);

  const asText = codes.join("\n");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(asText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (permissions / insecure context) — the codes
      // remain visible and downloadable, so this is a silent best-effort.
    }
  };

  const onDownload = () => {
    const blob = new Blob([`${asText}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kocluk-kurtarma-kodlari.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <Alert variant="warning" title="Kurtarma kodlarını sakla">
        Bu kodlar yalnızca bir kez gösterilir. Telefonuna erişemezsen hesabına girmek için her biri tek
        seferlik kullanılabilir. Güvenli bir yerde sakla.
      </Alert>

      <ul className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface p-4">
        {codes.map((code) => (
          <li key={code} className="flex items-center gap-2 font-mono text-sm">
            <KeyRound className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate">{code}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCopy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Kopyalandı" : "Kopyala"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onDownload}>
          <Download className="size-4" />
          İndir
        </Button>
      </div>
    </div>
  );
}
