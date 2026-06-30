import { Search, LayoutGrid, List, Star, Trash2, Download, X } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import type { DocFolder } from "@/lib/data/types";
import type { DriveLayout, DriveSort, DriveItemRef } from "./document-utils";

interface DocumentsToolbarProps {
  breadcrumbs: DocFolder[];
  search: string;
  sort: DriveSort;
  layout: DriveLayout;
  selectedCount: number;
  isTrashView: boolean;
  onSearchChange: (q: string) => void;
  onSortChange: (sort: DriveSort) => void;
  onLayoutChange: (layout: DriveLayout) => void;
  onBreadcrumbClick: (folderId: string | null) => void;
  onBulkStar: () => void;
  onBulkTrash: () => void;
  onBulkDownload: () => void;
  onClearSelection: () => void;
  onBulkRestore?: () => void;
  onBulkDelete?: () => void;
}

export function DocumentsToolbar({
  breadcrumbs,
  search,
  sort,
  layout,
  selectedCount,
  isTrashView,
  onSearchChange,
  onSortChange,
  onLayoutChange,
  onBreadcrumbClick,
  onBulkStar,
  onBulkTrash,
  onBulkDownload,
  onClearSelection,
  onBulkRestore,
  onBulkDelete,
}: DocumentsToolbarProps) {
  return (
    <div className="border-b border-[--border-default] bg-[--bg-surface] px-4 py-3 space-y-3">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {breadcrumbs.length === 0 ? (
              <BreadcrumbPage>Documents</BreadcrumbPage>
            ) : (
              <BreadcrumbLink
                className="cursor-pointer"
                onClick={() => onBreadcrumbClick("fld-library")}
              >
                JNIC Library
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {breadcrumbs
            .filter((f) => f.id !== "fld-library")
            .map((f, i, arr) => (
              <span key={f.id} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {i === arr.length - 1 ? (
                    <BreadcrumbPage>{f.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink className="cursor-pointer" onClick={() => onBreadcrumbClick(f.id)}>
                      {f.name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
        </BreadcrumbList>
      </Breadcrumb>

      {selectedCount > 0 ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <Button variant="outline" size="sm" onClick={onClearSelection}>
            <X className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
          {isTrashView ? (
            <>
              <Button variant="outline" size="sm" onClick={onBulkRestore}>
                Restore
              </Button>
              <Button variant="outline" size="sm" onClick={onBulkDelete} className="text-[--state-error]">
                Delete forever
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={onBulkStar}>
                <Star className="h-3.5 w-3.5 mr-1" /> Star
              </Button>
              <Button variant="outline" size="sm" onClick={onBulkDownload}>
                <Download className="h-3.5 w-3.5 mr-1" /> Download
              </Button>
              <Button variant="outline" size="sm" onClick={onBulkTrash}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Trash
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-muted]" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search in folder..."
              className="w-full rounded-md border border-[--border-default] bg-[--bg-base] pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--accent-primary]/30"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as DriveSort)}
            className="rounded-md border border-[--border-default] bg-[--bg-base] px-3 py-2 text-sm"
          >
            <option value="name">Name</option>
            <option value="date">Date modified</option>
            <option value="size">Size</option>
          </select>
          <div className="flex items-center gap-1 bg-[--bg-base] border border-[--border-default] rounded-md p-1">
            <button
              type="button"
              onClick={() => onLayoutChange("grid")}
              className={`p-1.5 rounded ${layout === "grid" ? "bg-white shadow-sm text-[--text-primary]" : "text-[--text-muted]"}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onLayoutChange("list")}
              className={`p-1.5 rounded ${layout === "list" ? "bg-white shadow-sm text-[--text-primary]" : "text-[--text-muted]"}`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
