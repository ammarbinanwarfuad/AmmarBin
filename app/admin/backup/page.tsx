"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, Download, Upload, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface BackupData {
  collections?: string[];
  totalDocuments?: number;
  timestamp?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export default function AdminBackupPage() {
  const { status } = useSession();
  const router = useRouter();
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [backupData, setBackupData] = useState<BackupData | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const response = await fetch("/api/admin/backup", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setBackupData(data);
        toast.success("Backup created successfully!");
        
        // Download as JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        toast.error("Failed to create backup");
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("An error occurred");
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestore = async (clearExisting: boolean) => {
    if (!backupData) {
      toast.error("Please create or load a backup first");
      return;
    }

    if (!confirm(
      `Are you sure you want to restore the backup?${clearExisting ? "\n\nThis will DELETE all existing data!" : ""}`
    )) {
      return;
    }

    setRestoring(true);
    try {
      const response = await fetch("/api/admin/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backup: backupData.data || backupData, clearExisting }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(
          `Restored ${result.totalDocuments} documents from ${Object.keys(result.restored).length} collections!`
        );
        setBackupData(null);
      } else {
        toast.error("Failed to restore backup");
      }
    } catch (error) {
      console.error("Error restoring backup:", error);
      toast.error("An error occurred");
    } finally {
      setRestoring(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setBackupData(data);
        toast.success("Backup file loaded successfully!");
      } catch {
        toast.error("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  if (status === "loading") {
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Database Backup & Restore</h1>
          <p className="text-muted-foreground mt-2">
            Backup and restore your portfolio data
          </p>
        </div>

        {/* Create Backup */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Create Backup
            </CardTitle>
            <CardDescription>
              Download a complete backup of your database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleBackup}
              disabled={backingUp}
              className="gap-2"
            >
              {backingUp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Create & Download Backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Load Backup */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Load Backup File
            </CardTitle>
            <CardDescription>
              Upload a backup file to restore from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="mb-4"
            />
            {backupData && (
              <div className="p-4 bg-accent rounded-lg">
                <div className="font-medium mb-2">Backup Loaded</div>
                <div className="text-sm text-muted-foreground">
                  {backupData.collections && Array.isArray(backupData.collections) ? (
                    <>
                      {backupData.collections.length} collections •{" "}
                      {backupData.totalDocuments || 0} documents
                    </>
                  ) : (
                    "Backup file loaded"
                  )}
                  {backupData.timestamp && (
                    <> • Created: {new Date(backupData.timestamp).toLocaleString()}</>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restore Backup */}
        {backupData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Restore Backup</CardTitle>
              <CardDescription>
                Restore data from the loaded backup file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                      Warning
                    </div>
                    <div className="text-yellow-700 dark:text-yellow-300">
                      Restoring will replace existing data. Make sure to create a backup first!
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => handleRestore(false)}
                  disabled={restoring}
                  variant="outline"
                  className="gap-2"
                >
                  {restoring ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Restore (Merge)
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleRestore(true)}
                  disabled={restoring}
                  variant="destructive"
                  className="gap-2"
                >
                  {restoring ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Restore (Clear & Replace)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

