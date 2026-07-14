import type { ComponentType, ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideProps } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-foreground [&>svg]:text-muted-foreground",
        info: "border-info/25 bg-info/8 text-foreground [&>svg]:text-info",
        success: "border-success/25 bg-success/8 text-foreground [&>svg]:text-success",
        warning: "border-warning/30 bg-warning/10 text-foreground [&>svg]:text-warning",
        error: "border-error/25 bg-error/8 text-foreground [&>svg]:text-error",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const icons: Record<NonNullable<VariantProps<typeof alertVariants>["variant"]>, ComponentType<LucideProps>> = {
  default: Info,
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
};

type AlertProps = {
  variant?: VariantProps<typeof alertVariants>["variant"];
  title?: ReactNode;
  /** Set false to hide the leading status icon. */
  icon?: boolean;
  className?: string;
  children?: ReactNode;
};

/** Inline feedback banner with a status icon, optional title, and description. */
export function Alert({ variant = "default", title, icon = true, className, children }: AlertProps) {
  const Icon = icons[variant ?? "default"];
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)}>
      {icon ? <Icon className="mt-0.5 size-4 shrink-0" aria-hidden /> : null}
      <div className="flex min-w-0 flex-col gap-0.5">
        {title ? <p className="font-medium leading-none">{title}</p> : null}
        {children ? <div className="text-sm leading-6 text-muted-foreground">{children}</div> : null}
      </div>
    </div>
  );
}
