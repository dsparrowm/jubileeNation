import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DocFolder, DocItem } from "@/lib/data/types";

interface NewFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentFolderId: string;
  parentName: string;
  onSubmit: (name: string) => void;
}

export function NewFolderDialog({
  open,
  onOpenChange,
  parentFolderId,
  parentName,
  onSubmit,
}: NewFolderDialogProps) {
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    if (open) setName("");
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
            <DialogDescription>Create a folder inside {parentName}.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Folder name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Untitled folder"
              className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: DocFolder[];
  defaultFolderId: string;
  onSubmit: (input: {
    name: string;
    folderId: string;
    category: DocItem["category"];
    visibility: DocItem["visibility"];
    description: string;
    sizeKb: number;
    uploadedById: string;
  }) => void;
  uploadedById: string;
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  folders,
  defaultFolderId,
  onSubmit,
  uploadedById,
}: UploadDocumentDialogProps) {
  const [name, setName] = React.useState("");
  const [folderId, setFolderId] = React.useState(defaultFolderId);
  const [category, setCategory] = React.useState<DocItem["category"]>("Form");
  const [visibility, setVisibility] = React.useState<DocItem["visibility"]>("All");
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setName("");
      setFolderId(defaultFolderId);
      setCategory("Form");
      setVisibility("All");
      setDescription("");
    }
  }, [open, defaultFolderId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim().endsWith(".pdf") ? name.trim() : `${name.trim()}.pdf`,
      folderId,
      category,
      visibility,
      description: description || "Uploaded document",
      sizeKb: Math.floor(Math.random() * 400) + 80,
      uploadedById,
    });
    onOpenChange(false);
  };

  const uploadableFolders = folders.filter((f) => !f.trashedAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload file</DialogTitle>
            <DialogDescription>Select a file and destination folder (mock upload).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">File</label>
              <input
                type="file"
                className="mt-1.5 w-full text-sm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setName(file.name);
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Display name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="document.pdf"
                className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Folder</label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
              >
                {uploadableFolders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocItem["category"])}
                  className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
                >
                  {(["Policy", "Constitution", "Circular", "Form", "Certificate"] as const).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as DocItem["visibility"])}
                  className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
                >
                  <option value="All">All</option>
                  <option value="State Pastors and above">State Pastors and above</option>
                  <option value="HQ Only">HQ Only</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
