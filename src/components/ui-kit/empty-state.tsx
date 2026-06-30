import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[--bg-subtle] text-[--text-muted]">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-[--text-primary]">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-[--text-muted]">{description}</p>}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <a href={action.href}>
              <Button className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">
                {action.label}
              </Button>
            </a>
          ) : (
            <Button
              onClick={action.onClick}
              className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]"
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
