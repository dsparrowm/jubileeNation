import { Folder, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { DocFolder, DocItem } from "@/lib/data/types";
import { DocumentContextMenu } from "./document-context-menu";
import { fileIcon, formatSizeKb, itemKey, type DriveItemRef } from "./document-utils";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DocumentsGridProps {
  folders: DocFolder[];
  documents: DocItem[];
  selected: Set<string>;
  isTrashView: boolean;
  onSelect: (ref: DriveItemRef, shiftKey: boolean) => void;
  onOpenFolder: (folderId: string) => void;
  onPreview: (docId: string) => void;
  onDownload: (docId: string) => void;
  onStar: (ref: DriveItemRef, starred: boolean) => void;
  onTrash: (ref: DriveItemRef) => void;
  onRestore: (ref: DriveItemRef) => void;
  onDelete: (ref: DriveItemRef) => void;
}

export function DocumentsGrid({
  folders,
  documents,
  selected,
  isTrashView,
  onSelect,
  onOpenFolder,
  onPreview,
  onDownload,
  onStar,
  onTrash,
  onRestore,
  onDelete,
}: DocumentsGridProps) {
  const renderTile = (
    ref: DriveItemRef,
    name: string,
    sub: string,
    starred: boolean,
    icon: React.ReactNode,
    onDoubleClick?: () => void,
  ) => {
    const key = itemKey(ref);
    const isSelected = selected.has(key);
    return (
      <DocumentContextMenu
        key={key}
        item={ref}
        starred={starred}
        isTrashView={isTrashView}
        onPreview={() => ref.kind === "document" && onPreview(ref.id)}
        onDownload={() => ref.kind === "document" && onDownload(ref.id)}
        onStar={() => onStar(ref, !starred)}
        onTrash={() => onTrash(ref)}
        onRestore={() => onRestore(ref)}
        onDelete={() => onDelete(ref)}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => onSelect(ref, e.shiftKey)}
          onDoubleClick={onDoubleClick}
          onKeyDown={(e) => e.key === "Enter" && onDoubleClick?.()}
          className={cn(
            "group relative flex flex-col items-center rounded-lg border p-4 cursor-pointer transition-all select-none",
            isSelected
              ? "border-[--accent-primary] bg-[--accent-primary]/5 ring-2 ring-[--accent-primary]/20"
              : "border-[--border-default] hover:border-[--accent-primary]/40 hover:bg-[--bg-base]/40",
          )}
        >
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Checkbox checked={isSelected} className="pointer-events-none" />
          </div>
          {starred && (
            <Star className="absolute top-2 right-2 h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          )}
          <div className="flex h-12 w-12 items-center justify-center mb-2">{icon}</div>
          <p className="text-sm font-medium text-center line-clamp-2 w-full">{name}</p>
          <p className="text-[11px] text-[--text-muted] mt-1">{sub}</p>
        </div>
      </DocumentContextMenu>
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4">
      {folders.map((f) =>
        renderTile(
          { kind: "folder", id: f.id },
          f.name,
          formatDate(f.updatedAt),
          f.starred,
          <Folder className="h-10 w-10 text-[--accent-primary]" />,
          () => onOpenFolder(f.id),
        ),
      )}
      {documents.map((d) => {
        const Icon = fileIcon(d.name);
        return renderTile(
          { kind: "document", id: d.id },
          d.name,
          formatSizeKb(d.sizeKb),
          d.starred,
          <Icon className="h-10 w-10 text-[--text-muted]" />,
          () => onPreview(d.id),
        );
      })}
    </div>
  );
}
