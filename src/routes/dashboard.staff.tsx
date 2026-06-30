import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/role-context";
import { useMockStore } from "@/lib/data/mock-store";
import { branchName } from "@/lib/data/seed";
import type { StaffMember } from "@/lib/data/types";

export const Route = createFileRoute("/dashboard/staff")({ component: StaffPage });

function StaffPage() {
  const { role, user } = useRole();
  const { staffMembers, addStaffMember, updateStaffMember, removeStaffMember } = useMockStore();
  const [modal, setModal] = React.useState<"add" | { edit: StaffMember } | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const scoped = staffMembers.filter((s) => {
    if (role === "HQ_ADMIN" || role === "GENERAL_OVERSEER") return true;
    if (role === "STATE_PASTOR") return s.stateId === user.stateId;
    if (role === "BRANCH_PASTOR") return s.branchId === user.branchId;
    return false;
  });

  const canManage = role === "BRANCH_PASTOR";

  return (
    <>
      <PageHeader
        title="Staff Directory"
        description={
          canManage
            ? "Manage non-pastoral administrative and support staff at your branch."
            : "Non-pastoral administrative and support staff."
        }
        actions={
          canManage ? (
            <Button
              className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]"
              size="sm"
              onClick={() => setModal("add")}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Staff
            </Button>
          ) : role === "HQ_ADMIN" ? (
            <Button className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]" size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Add Staff
            </Button>
          ) : undefined
        }
      />
      <Card>
        <table className="w-full text-sm">
          <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-3 py-3 font-medium">Role</th>
              <th className="text-left px-3 py-3 font-medium">Branch</th>
              <th className="text-left px-3 py-3 font-medium">Phone</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              {canManage && <th className="text-right px-5 py-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[--border-default]">
            {scoped.map((s) => (
              <tr key={s.id} className="hover:bg-[--bg-base]/50">
                <td className="px-5 py-3 font-medium">{s.name}</td>
                <td className="px-3 py-3 text-[--text-muted]">{s.role}</td>
                <td className="px-3 py-3">{branchName(s.branchId)}</td>
                <td className="px-3 py-3 font-mono text-xs">{s.phone}</td>
                <td className="px-5 py-3 text-xs text-[--text-muted]">{s.email}</td>
                {canManage && (
                  <td className="px-5 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0"
                        onClick={() => setModal({ edit: s })}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 text-[--state-error]"
                        onClick={() => setDeleteId(s.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {scoped.length === 0 && (
          <div className="py-12 text-center text-sm text-[--text-muted]">No staff in your scope.</div>
        )}
      </Card>

      {modal && (
        <StaffModal
          staff={modal === "add" ? null : modal.edit}
          branchId={user.branchId!}
          stateId={user.stateId}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal === "add") {
              addStaffMember(data);
            } else {
              updateStaffMember(modal.edit.id, data);
            }
            setModal(null);
          }}
        />
      )}

      {deleteId && (
        <ConfirmDelete
          name={scoped.find((s) => s.id === deleteId)?.name ?? "this staff member"}
          onCancel={() => setDeleteId(null)}
          onConfirm={() => {
            removeStaffMember(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </>
  );
}

function StaffModal({
  staff,
  branchId,
  stateId,
  onClose,
  onSave,
}: {
  staff: StaffMember | null;
  branchId: string;
  stateId: string;
  onClose: () => void;
  onSave: (data: Omit<StaffMember, "id">) => void;
}) {
  const [name, setName] = React.useState(staff?.name ?? "");
  const [role, setRole] = React.useState(staff?.role ?? "");
  const [phone, setPhone] = React.useState(staff?.phone ?? "");
  const [email, setEmail] = React.useState(staff?.email ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-[--bg-surface] shadow-2xl border border-[--border-default]">
        <div className="flex items-center justify-between border-b border-[--border-default] px-5 py-4">
          <h2 className="font-semibold">{staff ? "Edit Staff Member" : "Add Staff Member"}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[--bg-base]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form
          className="p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ name, role, phone, email, branchId, stateId, employmentType: "branch", monthlySalary: 0 });
          }}
        >
          <Field label="Full Name" value={name} onChange={setName} required />
          <Field label="Role" value={role} onChange={setRole} required placeholder="e.g. Media Coordinator" />
          <Field label="Phone" value={phone} onChange={setPhone} required />
          <Field label="Email" value={email} onChange={setEmail} required type="email" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">
              {staff ? "Save Changes" : "Add Staff"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
      />
    </div>
  );
}

function ConfirmDelete({
  name,
  onCancel,
  onConfirm,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-xl bg-[--bg-surface] shadow-2xl border border-[--border-default] p-5">
        <h2 className="font-semibold">Remove Staff Member</h2>
        <p className="text-sm text-[--text-muted] mt-2">
          Remove <strong>{name}</strong> from your branch staff roster? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="!bg-[--state-error] !text-white" onClick={onConfirm}>
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
