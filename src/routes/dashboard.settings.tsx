import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { useRole, ROLE_LABELS } from "@/lib/role-context";
import { initials } from "@/lib/format";

export const Route = createFileRoute("/dashboard/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user, role } = useRole();
  return (
    <>
      <PageHeader title="Settings" description="Manage your profile and platform preferences." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 h-fit">
          <CardBody className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[--bg-sidebar] text-white text-xl font-semibold">{initials(user.firstName, user.lastName)}</div>
            <h2 className="mt-3 text-lg font-bold">{user.firstName} {user.lastName}</h2>
            <p className="text-xs text-[--text-muted]">{ROLE_LABELS[role]}</p>
            <Button variant="outline" size="sm" className="mt-4">Change Photo</Button>
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><div><CardTitle>Profile Information</CardTitle></div></CardHeader>
          <CardBody className="grid grid-cols-2 gap-4">
            {[
              ["First name", user.firstName],
              ["Last name", user.lastName],
              ["Email", user.email],
              ["Phone", user.phone],
            ].map(([l, v]) => (
              <div key={l}>
                <label className="text-xs text-[--text-muted]">{l}</label>
                <input defaultValue={v} className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm" />
              </div>
            ))}
            <div className="col-span-2 flex justify-end pt-2 border-t border-[--border-default]">
              <Button className="bg-[--accent-primary] hover:bg-[--accent-hover] text-white">Save Changes</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
