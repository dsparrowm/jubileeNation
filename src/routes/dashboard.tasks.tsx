import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckSquare,
  Circle,
  Clock,
  CheckCircle2,
  Flag,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui-kit/card";
import { StatCard } from "@/components/ui-kit/stat-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import { DataTable, type Column } from "@/components/ui-kit/data-table";
import { EmptyState } from "@/components/ui-kit/empty-state";
import { useMockStore } from "@/lib/data/mock-store";
import { useRole } from "@/lib/role-context";
import { filterTasks } from "@/lib/data/filters";
import { pastorName } from "@/lib/data/seed";
import { formatDate } from "@/lib/format";
import type { Task, TaskStatus } from "@/lib/data/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/tasks")({ component: TasksPage });

const priorityTone: Record<Task["priority"], string> = {
  High: "text-[--state-error]",
  Medium: "text-[--state-warning]",
  Low: "text-[--text-muted]",
};

const priorityBorder: Record<Task["priority"], string> = {
  High: "border-l-[--state-error]",
  Medium: "border-l-[--state-warning]",
  Low: "border-l-[--border-default]",
};

function TasksPage() {
  const { role, user } = useRole();
  const { tasks, updateTaskStatus } = useMockStore();
  const [statusFilter, setStatusFilter] = React.useState<TaskStatus | "all">("all");

  const scoped = filterTasks({ role, user }, tasks);
  const filtered = statusFilter === "all" ? scoped : scoped.filter((t) => t.status === statusFilter);

  const todo = scoped.filter((t) => t.status === "Todo").length;
  const inProgress = scoped.filter((t) => t.status === "In Progress").length;
  const done = scoped.filter((t) => t.status === "Done").length;

  if (role === "BRANCH_PASTOR") {
    return (
      <BranchPastorTasks
        scoped={scoped}
        filtered={filtered}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        todo={todo}
        inProgress={inProgress}
        done={done}
        updateTaskStatus={updateTaskStatus}
      />
    );
  }

  const columns: Column<Task>[] = [
    {
      key: "title",
      header: "Task",
      sortable: true,
      cell: (t) => (
        <div>
          <div className="font-medium">{t.title}</div>
          <div className="text-xs text-[--text-muted] mt-0.5 line-clamp-1">{t.description}</div>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      cell: (t) => <span className={`text-xs font-semibold ${priorityTone[t.priority]}`}>{t.priority}</span>,
    },
    {
      key: "dueDate",
      header: "Due",
      sortable: true,
      cell: (t) => <span className="font-mono text-xs">{formatDate(t.dueDate)}</span>,
    },
    {
      key: "assignee",
      header: "Assignee",
      cell: (t) => <span className="text-sm">{pastorName(t.assigneeId)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (t) => <TaskActions task={t} updateTaskStatus={updateTaskStatus} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Tasks & Assignments"
        description="Action items scoped to your role and organisational level."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={Circle} label="To Do" value={todo} iconTone="warning" />
        <StatCard icon={Clock} label="In Progress" value={inProgress} iconTone="info" />
        <StatCard icon={CheckCircle2} label="Completed" value={done} iconTone="success" />
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | "all")} className="mt-4">
        <TabsList className="bg-[--bg-surface] border border-[--border-default]">
          <TabsTrigger value="all">All ({scoped.length})</TabsTrigger>
          <TabsTrigger value="Todo">To Do ({todo})</TabsTrigger>
          <TabsTrigger value="In Progress">In Progress ({inProgress})</TabsTrigger>
          <TabsTrigger value="Done">Done ({done})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter}>
          <Card>
            {filtered.length === 0 ? (
              <EmptyState icon={CheckSquare} title="No tasks" description="You're all caught up for this filter." />
            ) : (
              <>
                <CardHeader>
                  <CardTitle>{statusFilter === "all" ? "All Tasks" : `${statusFilter} Tasks`}</CardTitle>
                </CardHeader>
                <div className="px-1 pb-1">
                  <DataTable columns={columns} data={filtered} keyFn={(t) => t.id} />
                </div>
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function BranchPastorTasks({
  scoped,
  filtered,
  statusFilter,
  setStatusFilter,
  todo,
  inProgress,
  done,
  updateTaskStatus,
}: {
  scoped: Task[];
  filtered: Task[];
  statusFilter: TaskStatus | "all";
  setStatusFilter: (v: TaskStatus | "all") => void;
  todo: number;
  inProgress: number;
  done: number;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
}) {
  return (
    <>
      <PageHeader
        title="Tasks"
        description="Your branch assignments and action items."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-xl border border-[--border-default] bg-gradient-to-br from-[--bg-surface] to-[--bg-base] p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[--state-warning]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Circle className="h-5 w-5 text-[--state-warning] mb-3" />
          <div className="font-mono text-3xl font-bold">{todo}</div>
          <div className="text-sm text-[--text-muted] mt-1">To Do</div>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-[--border-default] bg-gradient-to-br from-[--bg-surface] to-[--bg-base] p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[--state-info]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Clock className="h-5 w-5 text-[--state-info] mb-3" />
          <div className="font-mono text-3xl font-bold">{inProgress}</div>
          <div className="text-sm text-[--text-muted] mt-1">In Progress</div>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-[--border-default] bg-gradient-to-br from-[--bg-surface] to-[--bg-base] p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[--state-success]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CheckCircle2 className="h-5 w-5 text-[--state-success] mb-3" />
          <div className="font-mono text-3xl font-bold">{done}</div>
          <div className="text-sm text-[--text-muted] mt-1">Completed</div>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | "all")} className="mt-6">
        <TabsList className="bg-[--bg-surface] border border-[--border-default]">
          <TabsTrigger value="all">All ({scoped.length})</TabsTrigger>
          <TabsTrigger value="Todo">To Do</TabsTrigger>
          <TabsTrigger value="In Progress">Active</TabsTrigger>
          <TabsTrigger value="Done">Done</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-4">
          {filtered.length === 0 ? (
            <Card>
              <EmptyState icon={CheckSquare} title="All clear" description="No tasks match this filter." />
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((t) => (
                <Card
                  key={t.id}
                  className={cn(
                    "border-l-4 transition-shadow hover:shadow-md",
                    priorityBorder[t.priority],
                    t.status === "Done" && "opacity-75",
                  )}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={cn("font-semibold text-sm", t.status === "Done" && "line-through text-[--text-muted]")}>
                            {t.title}
                          </h3>
                          <StatusBadge status={t.status} />
                        </div>
                        <p className="text-xs text-[--text-muted] mt-2 leading-relaxed">{t.description}</p>
                      </div>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wide shrink-0", priorityTone[t.priority])}>
                        <Flag className="h-3 w-3 inline mr-0.5" />
                        {t.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[--border-default]">
                      <span className="flex items-center gap-1.5 text-xs text-[--text-muted]">
                        <Calendar className="h-3.5 w-3.5" />
                        Due {formatDate(t.dueDate)}
                      </span>
                      <TaskActions task={t} updateTaskStatus={updateTaskStatus} compact />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

function TaskActions({
  task,
  updateTaskStatus,
  compact,
}: {
  task: Task;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  compact?: boolean;
}) {
  if (task.status === "Done") {
    return (
      <Button size="sm" variant="outline" className={compact ? "h-7 text-xs" : "h-7 text-xs"} onClick={() => updateTaskStatus(task.id, "Todo")}>
        Reopen
      </Button>
    );
  }
  if (task.status === "Todo") {
    return (
      <Button
        size="sm"
        className={cn("!bg-[var(--accent-primary)] !text-white", compact ? "h-7 text-xs" : "h-7 text-xs")}
        onClick={() => updateTaskStatus(task.id, "In Progress")}
      >
        Start <ArrowRight className="h-3 w-3 ml-1" />
      </Button>
    );
  }
  return (
    <Button
      size="sm"
      className={cn("!bg-[var(--state-success)] !text-white", compact ? "h-7 text-xs" : "h-7 text-xs")}
      onClick={() => updateTaskStatus(task.id, "Done")}
    >
      Complete
    </Button>
  );
}
