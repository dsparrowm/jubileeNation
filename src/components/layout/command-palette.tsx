import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ROUTE_LABELS, getAllowedRoutes } from "@/lib/access/permissions";
import { useRole } from "@/lib/role-context";
import { pastors, branches } from "@/lib/data/seed";
import { filterPastors, filterBranches } from "@/lib/data/filters";
import {
  LayoutDashboard,
  Building2,
  Users,
  Search,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { role, user } = useRole();
  const ctx = { role, user };

  const allowedRoutes = getAllowedRoutes(role);
  const scopedPastors = filterPastors(ctx, pastors).slice(0, 8);
  const scopedBranches = filterBranches(ctx, branches).slice(0, 6);

  const go = (path: string) => {
    onOpenChange(false);
    navigate({ to: path });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search modules, pastors, branches…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Modules">
          {allowedRoutes.map((path) => (
            <CommandItem key={path} onSelect={() => go(path)}>
              <LayoutDashboard className="mr-2 h-4 w-4 text-[--text-muted]" />
              {ROUTE_LABELS[path]}
            </CommandItem>
          ))}
        </CommandGroup>
        {scopedPastors.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Pastors">
              {scopedPastors.map((p) => (
                <CommandItem key={p.id} onSelect={() => go(`/dashboard/pastors/${p.id}`)}>
                  <Users className="mr-2 h-4 w-4 text-[--text-muted]" />
                  {p.firstName} {p.lastName}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {scopedBranches.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Branches">
              {scopedBranches.map((b) => (
                <CommandItem key={b.id} onSelect={() => go("/dashboard/branches")}>
                  <Building2 className="mr-2 h-4 w-4 text-[--text-muted]" />
                  {b.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        <CommandSeparator />
        <CommandGroup heading="Quick">
          <CommandItem onSelect={() => go("/dashboard/search")}>
            <Search className="mr-2 h-4 w-4 text-[--text-muted]" />
            People Search
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return { open, setOpen };
}
