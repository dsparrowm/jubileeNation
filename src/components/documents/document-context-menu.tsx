import * as React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Eye, Download, Star, Trash2, RotateCcw, Trash } from "lucide-react";
import type { DriveItemRef } from "./document-utils";

interface DocumentContextMenuProps {
  item: DriveItemRef;
  starred: boolean;
  isTrashView: boolean;
  children: React.ReactNode;
  onPreview: () => void;
  onDownload: () => void;
  onStar: () => void;
  onTrash: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

export function DocumentContextMenu({
  item,
  starred,
  isTrashView,
  children,
  onPreview,
  onDownload,
  onStar,
  onTrash,
  onRestore,
  onDelete,
}: DocumentContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {isTrashView ? (
          <>
            <ContextMenuItem onClick={onRestore}>
              <RotateCcw className="h-4 w-4 mr-2" /> Restore
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onDelete} className="text-[--state-error]">
              <Trash className="h-4 w-4 mr-2" /> Delete forever
            </ContextMenuItem>
          </>
        ) : (
          <>
            {item.kind === "document" && (
              <ContextMenuItem onClick={onPreview}>
                <Eye className="h-4 w-4 mr-2" /> Preview
              </ContextMenuItem>
            )}
            {item.kind === "document" && (
              <ContextMenuItem onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" /> Download
              </ContextMenuItem>
            )}
            <ContextMenuItem onClick={onStar}>
              <Star className="h-4 w-4 mr-2" />
              {starred ? "Remove star" : "Add to starred"}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onTrash} className="text-[--state-error]">
              <Trash2 className="h-4 w-4 mr-2" /> Move to trash
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
