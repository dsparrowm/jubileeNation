import { Folder, Clock, Star, Trash2, HardDrive } from "lucide-react";
import type { DocFolder } from "@/lib/data/types";
import type { DriveView } from "./document-utils";
import { buildFolderTree } from "./document-utils";
import { cn } from "@/lib/utils";

interface DocumentsSidebarProps {
  view: DriveView;
  currentFolderId: string | null;
  folders: DocFolder[];
  onViewChange: (view: DriveView) => void;
  onFolderOpen: (folderId: string | null) => void;
}

const views: { id: DriveView; label: string; icon: typeof HardDrive }[] = [
  { id: "all", label: "All files", icon: HardDrive },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "starred", label: "Starred", icon: Star },
  { id: "trash", label: "Trash", icon: Trash2 },
];

export function DocumentsSidebar({
  view,
  currentFolderId,
  folders,
  onViewChange,
  onFolderOpen,
}: DocumentsSidebarProps) {
  const tree = buildFolderTree(folders, "fld-library");

  return (
    <aside className="w-56 shrink-0 border-r border-[--border-default] bg-[--bg-surface] flex flex-col">
      <nav className="p-2 space-y-0.5">
        {views.map((v) => {
          const Icon = v.icon;
          const active = view === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onViewChange(v.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[--accent-primary]/10 text-[--accent-primary]"
                  : "text-[--text-muted] hover:bg-[--bg-base] hover:text-[--text-primary]",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {v.label}
            </button>
          );
        })}
      </nav>

      {view === "all" && (
        <>
          <div className="mx-3 my-2 border-t border-[--border-default]" />
          <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[--text-muted]">
            Folders
          </div>
          <nav className="flex-1 overflow-y-auto p-2 pt-0 space-y-0.5 max-h-[calc(100vh-320px)]">
            <button
              type="button"
              onClick={() => onFolderOpen("fld-library")}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                currentFolderId === "fld-library" || currentFolderId === null
                  ? "bg-[--bg-base] text-[--text-primary] font-medium"
                  : "text-[--text-muted] hover:bg-[--bg-base]/60 hover:text-[--text-primary]",
              )}
            >
              <Folder className="h-3.5 w-3.5 shrink-0 text-[--accent-primary]" />
              <span className="truncate">JNIC Library</span>
            </button>
            {tree
              .filter(({ folder }) => folder.id !== "fld-library")
              .map(({ folder, depth }) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => onFolderOpen(folder.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md py-1.5 text-sm transition-colors",
                    currentFolderId === folder.id
                      ? "bg-[--bg-base] text-[--text-primary] font-medium"
                      : "text-[--text-muted] hover:bg-[--bg-base]/60 hover:text-[--text-primary]",
                  )}
                  style={{ paddingLeft: `${8 + depth * 12}px`, paddingRight: "8px" }}
                >
                  <Folder className="h-3.5 w-3.5 shrink-0 text-[--text-muted]" />
                  <span className="truncate">{folder.name}</span>
                  {folder.starred && <Star className="h-3 w-3 ml-auto shrink-0 text-amber-500 fill-amber-500" />}
                </button>
              ))}
          </nav>
        </>
      )}
    </aside>
  );
}
