import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-[--border-default] bg-[--bg-surface] shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, action }: { children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <div className={cn("flex items-center justify-between px-5 py-4 border-b border-[--border-default]", className)}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-base font-semibold text-[--text-primary]", className)}>{children}</h3>;
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-[--text-muted] mt-0.5">{children}</p>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function EmptyState({ title, description, icon: Icon }: { title: string; description?: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {Icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[--bg-base] text-[--text-muted]">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <p className="text-sm font-medium text-[--text-primary]">{title}</p>
      {description && <p className="mt-1 text-xs text-[--text-muted] max-w-sm">{description}</p>}
    </div>
  );
}
