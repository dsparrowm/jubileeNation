import { X, Download, Eye, Star, Trash2, RotateCcw, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui-kit/badges";
import type { DocFolder, DocItem } from "@/lib/data/types";
import { fileIcon, formatSizeKb } from "./document-utils";
import { formatDate } from "@/lib/format";
import { pastorName } from "@/lib/data/seed";

interface DocumentPreviewPanelProps {
  item: { kind: "folder"; folder: DocFolder } | { kind: "document"; document: DocItem } | null;
  isTrashView: boolean;
  onClose: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onStar: (starred: boolean) => void;
  onTrash: () => void;
  onRestore: () => void;
}

const categoryTone: Record<string, "gold" | "info" | "indigo" | "success" | "neutral"> = {
  Policy: "gold",
  Constitution: "indigo",
  Circular: "info",
  Form: "success",
  Certificate: "neutral",
};

export function DocumentPreviewPanel({
  item,
  isTrashView,
  onClose,
  onPreview,
  onDownload,
  onStar,
  onTrash,
  onRestore,
}: DocumentPreviewPanelProps) {
  if (!item) return null;

  if (item.kind === "folder") {
    const { folder } = item;
    return (
      <aside className="w-72 shrink-0 border-l border-[--border-default] bg-[--bg-surface] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[--border-default]">
          <h3 className="text-sm font-semibold">Folder details</h3>
          <button type="button" onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary] p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div className="flex justify-center py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[--accent-primary]/10">
              <Folder className="h-8 w-8 text-[--accent-primary]" />
            </div>
          </div>
          <div>
            <div className="text-xs text-[--text-muted]">Name</div>
            <div className="text-sm font-medium mt-0.5">{folder.name}</div>
          </div>
          <div>
            <div className="text-xs text-[--text-muted]">Modified</div>
            <div className="text-sm mt-0.5">{formatDate(folder.updatedAt)}</div>
          </div>
          <div className="flex gap-2 pt-2">
            {isTrashView ? (
              <Button variant="outline" size="sm" className="flex-1" onClick={onRestore}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onStar(!folder.starred)}>
                  <Star className="h-3.5 w-3.5 mr-1" />
                  {folder.starred ? "Unstar" : "Star"}
                </Button>
                <Button variant="outline" size="sm" onClick={onTrash}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>
    );
  }

  const { document: d } = item;
  const Icon = fileIcon(d.name);

  return (
    <aside className="w-72 shrink-0 border-l border-[--border-default] bg-[--bg-surface] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[--border-default]">
        <h3 className="text-sm font-semibold">Details</h3>
        <button type="button" onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary] p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div className="flex justify-center py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[--bg-base]">
            <Icon className="h-8 w-8 text-[--text-muted]" />
          </div>
        </div>
        <div>
          <div className="text-xs text-[--text-muted]">Name</div>
          <div className="text-sm font-medium mt-0.5 break-words">{d.name}</div>
        </div>
        <div>
          <div className="text-xs text-[--text-muted]">Category</div>
          <Badge tone={categoryTone[d.category]} className="mt-1">{d.category}</Badge>
        </div>
        <div>
          <div className="text-xs text-[--text-muted]">Description</div>
          <p className="text-sm mt-0.5 text-[--text-muted] leading-relaxed">{d.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-[--text-muted]">Modified</div>
            <div className="mt-0.5">{formatDate(d.uploadedAt)}</div>
          </div>
          <div>
            <div className="text-xs text-[--text-muted]">Size</div>
            <div className="mt-0.5 font-mono">{formatSizeKb(d.sizeKb)}</div>
          </div>
          <div>
            <div className="text-xs text-[--text-muted]">Uploaded by</div>
            <div className="mt-0.5">{pastorName(d.uploadedById)}</div>
          </div>
          <div>
            <div className="text-xs text-[--text-muted]">Visibility</div>
            <div className="mt-0.5">{d.visibility}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          {isTrashView ? (
            <Button variant="outline" size="sm" onClick={onRestore}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore
            </Button>
          ) : (
            <>
              <Button size="sm" className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]" onClick={onPreview}>
                <Eye className="h-3.5 w-3.5 mr-1" /> Preview
              </Button>
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-3.5 w-3.5 mr-1" /> Download
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onStar(!d.starred)}>
                  <Star className="h-3.5 w-3.5 mr-1" />
                  {d.starred ? "Unstar" : "Star"}
                </Button>
                <Button variant="outline" size="sm" onClick={onTrash}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
