import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard/staff")({ component: StaffPage });

const staff = [
  { name: "Grace Okoro", role: "Administrative Assistant", branch: "Port Harcourt Central", phone: "+234 803 555 1010" },
  { name: "Daniel Aluko", role: "Finance Officer", branch: "Lagos · Ikeja Main", phone: "+234 803 555 2020" },
  { name: "Mary Eze", role: "Worship Coordinator", branch: "Calabar North", phone: "+234 803 555 3030" },
  { name: "Stephen Bello", role: "IT Coordinator", branch: "FCT · Wuse II", phone: "+234 803 555 4040" },
  { name: "Joy Inyang", role: "Children's Ministry Lead", branch: "Uyo Main Assembly", phone: "+234 803 555 5050" },
  { name: "Peter Anyanwu", role: "Facility Manager", branch: "Asaba Central", phone: "+234 803 555 6060" },
];

function StaffPage() {
  return (
    <>
      <PageHeader title="Staff Directory" description="Non-pastoral administrative and support staff."
        actions={<Button className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]" size="sm"><Plus className="h-4 w-4 mr-1.5" /> Add Staff</Button>}
      />
      <Card>
        <table className="w-full text-sm">
          <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-3 py-3 font-medium">Role</th>
              <th className="text-left px-3 py-3 font-medium">Branch</th>
              <th className="text-left px-5 py-3 font-medium">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[--border-default]">
            {staff.map(s => (
              <tr key={s.name} className="hover:bg-[--bg-base]/50">
                <td className="px-5 py-3 font-medium">{s.name}</td>
                <td className="px-3 py-3 text-[--text-muted]">{s.role}</td>
                <td className="px-3 py-3">{s.branch}</td>
                <td className="px-5 py-3 font-mono text-xs">{s.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
