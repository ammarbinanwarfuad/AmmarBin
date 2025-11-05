"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Play, Pause, Trash2, Plus, X, Loader2, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ScheduledTask {
  _id: string;
  name: string;
  type: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  lastResult?: {
    success: boolean;
    message: string;
    duration?: number;
  };
  runCount: number;
  errorCount: number;
}

export default function AdminScheduledTasksPage() {
  const { status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "github-sync",
    schedule: "daily",
  });
  const [runningId, setRunningId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const { data, isLoading, mutate } = useSWR("/api/admin/scheduled-tasks", fetcher);
  const tasks: ScheduledTask[] = data?.tasks || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/scheduled-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Task created successfully!");
        setShowForm(false);
        setFormData({ name: "", type: "github-sync", schedule: "daily" });
        mutate();
      } else {
        toast.error("Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("An error occurred");
    }
  };

  const handleToggle = async (task: ScheduledTask) => {
    try {
      const response = await fetch("/api/admin/scheduled-tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: task._id,
          enabled: !task.enabled,
        }),
      });

      if (response.ok) {
        toast.success(`Task ${!task.enabled ? "enabled" : "disabled"}`);
        mutate();
      } else {
        toast.error("Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("An error occurred");
    }
  };

  const handleRun = async (taskId: string) => {
    setRunningId(taskId);
    try {
      const response = await fetch(`/api/admin/scheduled-tasks/${taskId}`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Task executed successfully!");
        mutate();
      } else {
        toast.error("Failed to execute task");
      }
    } catch (error) {
      console.error("Error executing task:", error);
      toast.error("An error occurred");
    } finally {
      setRunningId(null);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/admin/scheduled-tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Task deleted successfully!");
        mutate();
      } else {
        toast.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("An error occurred");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Scheduled Tasks</h1>
            <p className="text-muted-foreground mt-2">
              Automate recurring tasks like syncing GitHub projects and blogs
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "New Task"}
          </Button>
        </div>

        {/* Add Task Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create Scheduled Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Task Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Daily GitHub Sync"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Task Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  >
                    <option value="github-sync">GitHub Sync</option>
                    <option value="blog-sync">Blog Sync</option>
                    <option value="backup">Backup</option>
                    <option value="cleanup">Cleanup</option>
                    <option value="link-check">Link Check</option>
                    <option value="seo-check">SEO Check</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="schedule">Schedule</Label>
                  <select
                    id="schedule"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily (2 AM)</option>
                    <option value="weekly">Weekly (Sunday 2 AM)</option>
                  </select>
                </div>
                <Button type="submit" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Task
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No scheduled tasks yet</p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {task.name}
                        {task.enabled ? (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">
                            Paused
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Type: {task.type} • Schedule: {task.schedule}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRun(task._id)}
                        disabled={runningId === task._id}
                      >
                        {runningId === task._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggle(task)}
                      >
                        {task.enabled ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &ldquo;{task.name}&rdquo;?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(task._id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Last Run</div>
                      <div className="font-medium">
                        {task.lastRun
                          ? format(new Date(task.lastRun), "MMM dd, HH:mm")
                          : "Never"}
                      </div>
                      {task.lastResult && (
                        <div className="flex items-center gap-1 mt-1">
                          {task.lastResult.success ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                          <span className={task.lastResult.success ? "text-green-600" : "text-red-600"}>
                            {task.lastResult.message}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-muted-foreground">Next Run</div>
                      <div className="font-medium">
                        {task.nextRun
                          ? format(new Date(task.nextRun), "MMM dd, HH:mm")
                          : "Not scheduled"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Runs</div>
                      <div className="font-medium">{task.runCount || 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Errors</div>
                      <div className="font-medium text-red-600">{task.errorCount || 0}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

