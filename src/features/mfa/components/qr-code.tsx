"use client";

import { QRCodeSVG } from "qrcode.react";

/**
 * Renders an `otpauth://` URI as a scannable QR code. The code is always dark modules
 * on a solid light panel — QR scanning needs high fixed contrast, so this panel stays
 * light in both themes rather than following the theme tokens.
 */
export function QrCode({ value, label }: { value: string; label: string }) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-white p-4 shadow-sm">
      <QRCodeSVG
        value={value}
        size={176}
        level="M"
        marginSize={0}
        bgColor="#ffffff"
        fgColor="#000000"
        title={label}
        role="img"
        aria-label={label}
      />
    </div>
  );
}
