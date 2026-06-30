import { Folder, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui-kit/badges";
import type { DocFolder, DocItem } from "@/lib/data/types";
import { DocumentContextMenu } from "./document-context-menu";
import { fileIcon, formatSizeKb, itemKey, type DriveItemRef } from "./document-utils";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DocumentsListProps {
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

export function DocumentsList({
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
}: DocumentsListProps) {
  const renderRow = (
    ref: DriveItemRef,
    name: string,
    modified: string,
    size: string,
    extra: React.ReactNode,
    starred: boolean,
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
        <tr
          className={cn(
            "cursor-pointer transition-colors",
            isSelected ? "bg-[--accent-primary]/5" : "hover:bg-[--bg-base]/50",
          )}
          onClick={(e) => onSelect(ref, e.shiftKey)}
          onDoubleClick={onDoubleClick}
        >
          <td className="px-4 py-2.5 w-10">
            <Checkbox checked={isSelected} className="pointer-events-none" />
          </td>
          <td className="px-3 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {ref.kind === "folder" ? (
                <Folder className="h-4 w-4 shrink-0 text-[--accent-primary]" />
              ) : (
                (() => {
                  const Icon = fileIcon(name);
                  return <Icon className="h-4 w-4 shrink-0 text-[--text-muted]" />;
                })()
              )}
              <span className="font-medium truncate">{name}</span>
              {starred && <Star className="h-3 w-3 shrink-0 text-amber-500 fill-amber-500" />}
            </div>
          </td>
          <td className="px-3 py-2.5 text-sm text-[--text-muted] hidden sm:table-cell">{modified}</td>
          <td className="px-3 py-2.5 text-sm text-[--text-muted] font-mono hidden md:table-cell">{size}</td>
          <td className="px-3 py-2.5 hidden lg:table-cell">{extra}</td>
        </tr>
      </DocumentContextMenu>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-[--text-muted] bg-[--bg-base] border-b border-[--border-default]">
          <tr>
            <th className="w-10 px-4 py-2.5" />
            <th className="text-left px-3 py-2.5 font-medium">Name</th>
            <th className="text-left px-3 py-2.5 font-medium hidden sm:table-cell">Modified</th>
            <th className="text-left px-3 py-2.5 font-medium hidden md:table-cell">Size</th>
            <th className="text-left px-3 py-2.5 font-medium hidden lg:table-cell">Visibility</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[--border-default]">
          {folders.map((f) =>
            renderRow(
              { kind: "folder", id: f.id },
              f.name,
              formatDate(f.updatedAt),
              "—",
              null,
              f.starred,
              () => onOpenFolder(f.id),
            ),
          )}
          {documents.map((d) =>
            renderRow(
              { kind: "document", id: d.id },
              d.name,
              formatDate(d.uploadedAt),
              formatSizeKb(d.sizeKb),
              <Badge tone="neutral">{d.visibility}</Badge>,
              d.starred,
              () => onPreview(d.id),
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
