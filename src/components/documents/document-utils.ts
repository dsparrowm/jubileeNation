import type { DocFolder, DocItem } from "@/lib/data/types";
import { FileText, FileSpreadsheet, FileImage, File } from "lucide-react";

export type DriveView = "all" | "recent" | "starred" | "trash";
export type DriveLayout = "grid" | "list";
export type DriveSort = "name" | "date" | "size";

export type DriveItemRef =
  | { kind: "folder"; id: string }
  | { kind: "document"; id: string };

export function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return FileText;
  if (ext === "xlsx" || ext === "xls" || ext === "csv") return FileSpreadsheet;
  if (ext === "png" || ext === "jpg" || ext === "jpeg") return FileImage;
  return File;
}

export function formatSizeKb(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

export function sortFolders(folders: DocFolder[], sort: DriveSort): DocFolder[] {
  const copy = [...folders];
  if (sort === "name") return copy.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "date") return copy.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return copy.sort((a, b) => a.name.localeCompare(b.name));
}

export function sortDocuments(docs: DocItem[], sort: DriveSort): DocItem[] {
  const copy = [...docs];
  if (sort === "name") return copy.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "date") return copy.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  if (sort === "size") return copy.sort((a, b) => b.sizeKb - a.sizeKb);
  return copy;
}

export function itemKey(ref: DriveItemRef): string {
  return `${ref.kind}:${ref.id}`;
}

export function parseItemKey(key: string): DriveItemRef | null {
  const [kind, id] = key.split(":");
  if ((kind === "folder" || kind === "document") && id) return { kind, id } as DriveItemRef;
  return null;
}

export function buildFolderTree(
  folders: DocFolder[],
  parentId: string | null,
  depth = 0,
): { folder: DocFolder; depth: number }[] {
  const result: { folder: DocFolder; depth: number }[] = [];
  const children = folders.filter((f) => f.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name));
  for (const folder of children) {
    result.push({ folder, depth });
    result.push(...buildFolderTree(folders, folder.id, depth + 1));
  }
  return result;
}
