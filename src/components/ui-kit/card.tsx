import * as React from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "elevated";

export function Card({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[--border-default] bg-[--bg-surface]",
        variant === "elevated" ? "shadow-[var(--shadow-card-token)]" : "shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 py-4 border-b border-[--border-default]",
        className,
      )}
    >
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("font-display text-base font-semibold text-[--text-primary]", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-[--text-muted] mt-0.5">{children}</p>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
