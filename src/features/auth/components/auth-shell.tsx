import type { ReactNode } from "react";
import { Brand } from "@/components/layout/brand";
import { Card, CardContent } from "@/components/ui/card";

type AuthShellProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Secondary action shown under the card (e.g. "Don't have an account? Sign up"). */
  footer?: ReactNode;
};

/** Centered, consistent frame for every authentication screen. */
export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-6 sm:py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Brand />
        <div className="flex flex-col gap-1.5">
          <h1 className="t-h2">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
      {footer ? <p className="text-center text-sm text-muted-foreground">{footer}</p> : null}
    </div>
  );
}
