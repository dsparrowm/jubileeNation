import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { demoAccounts } from "@/lib/role-context";
import { ROLE_LABELS, useRole } from "@/lib/role-context";
import { initials } from "@/lib/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function RoleSwitcher() {
  const { role, user, setDemoAccount } = useRole();
  const navigate = useNavigate();

  const switchRole = (email: string) => {
    setDemoAccount(email);
    navigate({ to: "/dashboard" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-[--border-default] bg-[--bg-base] px-2.5 py-1.5 text-xs font-medium hover:bg-[--bg-subtle] transition-colors">
        <Sparkles className="h-3.5 w-3.5 text-[--accent-primary]" />
        <span className="text-[--accent-primary]">{ROLE_LABELS[role]}</span>
        <span className="rounded bg-[--accent-primary]/10 px-1.5 py-0.5 text-[10px] text-[--accent-hover]">
          Demo
        </span>
        <ChevronDown className="h-3 w-3 text-[--text-muted]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Switch demo role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {demoAccounts.map((account) => (
          <DropdownMenuItem
            key={account.email}
            onClick={() => switchRole(account.email)}
            className={cn("flex items-start gap-3 py-2.5", account.role === role && "bg-[--bg-base]")}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[--bg-sidebar] text-[10px] font-semibold text-white">
              {initials(account.user.firstName, account.user.lastName)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium">{ROLE_LABELS[account.role]}</div>
              <div className="text-xs text-[--text-muted] truncate">{account.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
