import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Upload, FolderPlus, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui-kit/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentsSidebar } from "@/components/documents/documents-sidebar";
import { DocumentsToolbar } from "@/components/documents/documents-toolbar";
import { DocumentsGrid } from "@/components/documents/documents-grid";
import { DocumentsList } from "@/components/documents/documents-list";
import { DocumentPreviewPanel } from "@/components/documents/document-preview-panel";
import { NewFolderDialog, UploadDocumentDialog } from "@/components/documents/document-dialogs";
import {
  type DriveView,
  type DriveLayout,
  type DriveSort,
  type DriveItemRef,
  itemKey,
  parseItemKey,
  sortFolders,
  sortDocuments,
} from "@/components/documents/document-utils";
import { filterDocuments, filterDocFolders } from "@/lib/data/filters";
import { useRole } from "@/lib/role-context";
import { useMockStore } from "@/lib/data/mock-store";
import { folderAncestors, folderDescendantIds } from "@/lib/data/seed";
import type { DocItem } from "@/lib/data/types";
import { FolderOpen, Search } from "lucide-react";

type DocsSearch = {
  view: DriveView;
  folder?: string;
  layout: DriveLayout;
  q?: string;
};

export const Route = createFileRoute("/dashboard/documents")({
  component: DocsPage,
  validateSearch: (search: Record<string, unknown>): DocsSearch => ({
    view: (["all", "recent", "starred", "trash"].includes(search.view as string)
      ? search.view
      : "all") as DriveView,
    folder: typeof search.folder === "string" ? search.folder : undefined,
    layout: search.layout === "list" ? "list" : "grid",
    q: typeof search.q === "string" ? search.q : undefined,
  }),
});

function DocsPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { role, user } = useRole();
  const {
    docFolders,
    documents,
    createFolder,
    uploadDocument,
    starItem,
    trashItem,
    restoreItem,
    deletePermanently,
    touchDocument,
  } = useMockStore();

  const [sort, setSort] = React.useState<DriveSort>("name");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [previewRef, setPreviewRef] = React.useState<DriveItemRef | null>(null);
  const [newFolderOpen, setNewFolderOpen] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [lastSelectedKey, setLastSelectedKey] = React.useState<string | null>(null);

  const canManage = role === "HQ_ADMIN" || role === "GENERAL_OVERSEER";
  const ctx = { role, user };
  const isTrashView = search.view === "trash";
  const currentFolderId = search.view === "all" ? (search.folder ?? "fld-library") : null;

  const visibleFolders = filterDocFolders(ctx, docFolders, documents, {
    includeTrashed: isTrashView,
  });
  const visibleDocs = filterDocuments(ctx, documents, { includeTrashed: isTrashView });

  const updateSearch = (patch: Partial<DocsSearch>) => {
    navigate({
      to: "/dashboard/documents",
      search: { ...search, ...patch },
    });
  };

  const breadcrumbs =
    currentFolderId && search.view === "all"
      ? folderAncestors(currentFolderId, docFolders).filter((f) =>
          visibleFolders.some((vf) => vf.id === f.id),
        )
      : [];

  const scopedFolders = React.useMemo(() => {
    let list = visibleFolders;

    if (search.view === "starred") {
      list = list.filter((f) => f.starred);
    } else if (search.view === "trash") {
      list = list.filter((f) => f.trashedAt);
    } else if (search.view === "all" && currentFolderId) {
      list = list.filter((f) => f.parentId === currentFolderId);
    } else if (search.view === "all") {
      list = list.filter((f) => f.parentId === "fld-library");
    } else {
      list = [];
    }

    if (search.q?.trim()) {
      const q = search.q.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }

    return sortFolders(list, sort);
  }, [visibleFolders, search.view, search.q, currentFolderId, sort]);

  const scopedDocuments = React.useMemo(() => {
    let list = visibleDocs;

    if (search.view === "recent") {
      list = list
        .filter((d) => d.lastAccessedAt)
        .sort((a, b) => (b.lastAccessedAt ?? "").localeCompare(a.lastAccessedAt ?? ""));
    } else if (search.view === "starred") {
      list = list.filter((d) => d.starred);
    } else if (search.view === "trash") {
      list = list.filter((d) => d.trashedAt);
    } else if (search.view === "all" && currentFolderId) {
      list = list.filter((d) => d.folderId === currentFolderId);
    } else if (search.view === "all") {
      if (search.q?.trim()) {
        const q = search.q.toLowerCase();
        list = visibleDocs.filter(
          (d) =>
            d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q),
        );
      } else {
        list = [];
      }
    }

    if (search.q?.trim()) {
      const q = search.q.toLowerCase();
      if (search.view === "all" && currentFolderId) {
        const descendantIds = folderDescendantIds(currentFolderId, docFolders);
        list = visibleDocs.filter(
          (d) =>
            descendantIds.has(d.folderId) &&
            (d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)),
        );
      } else if (search.view !== "all" || !currentFolderId) {
        list = list.filter(
          (d) =>
            d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q),
        );
      }
    }

    return sortDocuments(list, sort);
  }, [visibleDocs, docFolders, search.view, search.q, currentFolderId, sort]);

  const allItemKeys = React.useMemo(
    () => [
      ...scopedFolders.map((f) => itemKey({ kind: "folder", id: f.id })),
      ...scopedDocuments.map((d) => itemKey({ kind: "document", id: d.id })),
    ],
    [scopedFolders, scopedDocuments],
  );

  const handleSelect = (ref: DriveItemRef, shiftKey: boolean) => {
    const key = itemKey(ref);
    if (shiftKey && lastSelectedKey) {
      const start = allItemKeys.indexOf(lastSelectedKey);
      const end = allItemKeys.indexOf(key);
      if (start >= 0 && end >= 0) {
        const [lo, hi] = start < end ? [start, end] : [end, start];
        setSelected(new Set(allItemKeys.slice(lo, hi + 1)));
        setPreviewRef(ref);
        return;
      }
    }
    setSelected(new Set([key]));
    setLastSelectedKey(key);
    setPreviewRef(ref);
  };

  const getSelectedRefs = (): DriveItemRef[] =>
    [...selected].map((k) => parseItemKey(k)).filter(Boolean) as DriveItemRef[];

  const handleBulkStar = () => {
    for (const ref of getSelectedRefs()) starItem(ref.kind, ref.id, true);
    setSelected(new Set());
  };

  const handleBulkTrash = () => {
    for (const ref of getSelectedRefs()) trashItem(ref.kind, ref.id);
    setSelected(new Set());
    setPreviewRef(null);
  };

  const handleBulkRestore = () => {
    for (const ref of getSelectedRefs()) restoreItem(ref.kind, ref.id);
    setSelected(new Set());
    setPreviewRef(null);
  };

  const handleBulkDelete = () => {
    for (const ref of getSelectedRefs()) deletePermanently(ref.kind, ref.id);
    setSelected(new Set());
    setPreviewRef(null);
  };

  const handleBulkDownload = () => {
    const count = getSelectedRefs().filter((r) => r.kind === "document").length;
    toast.success(`Downloading ${count} file(s)...`);
  };

  const handlePreview = (docId: string) => {
    touchDocument(docId);
    setPreviewRef({ kind: "document", id: docId });
    setSelected(new Set([itemKey({ kind: "document", id: docId })]));
  };

  const handleDownload = (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    touchDocument(docId);
    toast.success(`Downloading ${doc?.name ?? "file"}...`);
  };

  const previewItem = React.useMemo(() => {
    if (!previewRef) return null;
    if (previewRef.kind === "folder") {
      const folder = docFolders.find((f) => f.id === previewRef.id);
      return folder ? { kind: "folder" as const, folder } : null;
    }
    const document = documents.find((d) => d.id === previewRef.id);
    return document ? { kind: "document" as const, document } : null;
  }, [previewRef, docFolders, documents]);

  const parentFolder = docFolders.find((f) => f.id === (currentFolderId ?? "fld-library"));
  const isEmpty = scopedFolders.length === 0 && scopedDocuments.length === 0;

  const emptyTitle =
    search.view === "trash"
      ? "Trash is empty"
      : search.view === "starred"
        ? "No starred items"
        : search.view === "recent"
          ? "No recent files"
          : search.q
            ? "No results"
            : "This folder is empty";

  const emptyDescription =
    search.view === "trash"
      ? "Items you delete will appear here."
      : search.view === "starred"
        ? "Star files and folders to find them quickly."
        : search.view === "recent"
          ? "Files you open will show up here."
          : canManage
            ? "Upload a file or create a folder to get started."
            : "No documents in this folder.";

  return (
    <>
      <PageHeader
        title="Document Library"
        description="Policies, circulars, forms, and certificates."
        actions={
          canManage ? (
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1.5" /> New <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setNewFolderOpen(true)}>
                    <FolderPlus className="h-4 w-4 mr-2" /> New folder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setUploadOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" /> Upload file
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]"
                size="sm"
                onClick={() => setUploadOpen(true)}
              >
                <Upload className="h-4 w-4 mr-1.5" /> Upload
              </Button>
            </div>
          ) : undefined
        }
      />

      <Card className="overflow-hidden">
        <div className="flex min-h-[560px]">
          <DocumentsSidebar
            view={search.view}
            currentFolderId={currentFolderId}
            folders={visibleFolders}
            onViewChange={(view) => {
              setSelected(new Set());
              setPreviewRef(null);
              updateSearch({ view, folder: undefined, q: undefined });
            }}
            onFolderOpen={(folderId) => {
              setSelected(new Set());
              setPreviewRef(null);
              updateSearch({ view: "all", folder: folderId ?? "fld-library" });
            }}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <DocumentsToolbar
              breadcrumbs={breadcrumbs}
              search={search.q ?? ""}
              sort={sort}
              layout={search.layout}
              selectedCount={selected.size}
              isTrashView={isTrashView}
              onSearchChange={(q) => updateSearch({ q: q || undefined })}
              onSortChange={setSort}
              onLayoutChange={(layout) => updateSearch({ layout })}
              onBreadcrumbClick={(folderId) =>
                updateSearch({ folder: folderId ?? "fld-library", view: "all" })
              }
              onBulkStar={handleBulkStar}
              onBulkTrash={handleBulkTrash}
              onBulkDownload={handleBulkDownload}
              onClearSelection={() => {
                setSelected(new Set());
                setPreviewRef(null);
              }}
              onBulkRestore={handleBulkRestore}
              onBulkDelete={handleBulkDelete}
            />

            <div className="flex flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto">
                {isEmpty ? (
                  <EmptyState
                    icon={search.q ? Search : FolderOpen}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                ) : search.layout === "grid" ? (
                  <DocumentsGrid
                    folders={scopedFolders}
                    documents={scopedDocuments}
                    selected={selected}
                    isTrashView={isTrashView}
                    onSelect={handleSelect}
                    onOpenFolder={(id) => updateSearch({ view: "all", folder: id })}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onStar={(ref, starred) => starItem(ref.kind, ref.id, starred)}
                    onTrash={(ref) => {
                      trashItem(ref.kind, ref.id);
                      setPreviewRef(null);
                    }}
                    onRestore={(ref) => restoreItem(ref.kind, ref.id)}
                    onDelete={(ref) => deletePermanently(ref.kind, ref.id)}
                  />
                ) : (
                  <DocumentsList
                    folders={scopedFolders}
                    documents={scopedDocuments}
                    selected={selected}
                    isTrashView={isTrashView}
                    onSelect={handleSelect}
                    onOpenFolder={(id) => updateSearch({ view: "all", folder: id })}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onStar={(ref, starred) => starItem(ref.kind, ref.id, starred)}
                    onTrash={(ref) => {
                      trashItem(ref.kind, ref.id);
                      setPreviewRef(null);
                    }}
                    onRestore={(ref) => restoreItem(ref.kind, ref.id)}
                    onDelete={(ref) => deletePermanently(ref.kind, ref.id)}
                  />
                )}
              </div>

              <DocumentPreviewPanel
                item={previewItem}
                isTrashView={isTrashView}
                onClose={() => {
                  setPreviewRef(null);
                  setSelected(new Set());
                }}
                onPreview={() => previewItem?.kind === "document" && handlePreview(previewItem.document.id)}
                onDownload={() => previewItem?.kind === "document" && handleDownload(previewItem.document.id)}
                onStar={(starred) =>
                  previewRef && starItem(previewRef.kind, previewRef.id, starred)
                }
                onTrash={() => {
                  if (previewRef) {
                    trashItem(previewRef.kind, previewRef.id);
                    setPreviewRef(null);
                    setSelected(new Set());
                  }
                }}
                onRestore={() => {
                  if (previewRef) restoreItem(previewRef.kind, previewRef.id);
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      <NewFolderDialog
        open={newFolderOpen}
        onOpenChange={setNewFolderOpen}
        parentFolderId={currentFolderId ?? "fld-library"}
        parentName={parentFolder?.name ?? "JNIC Library"}
        onSubmit={(name) =>
          createFolder({ name, parentId: currentFolderId ?? "fld-library" })
        }
      />

      <UploadDocumentDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        folders={visibleFolders}
        defaultFolderId={currentFolderId ?? "fld-library"}
        uploadedById={user.id}
        onSubmit={uploadDocument}
      />
    </>
  );
}
