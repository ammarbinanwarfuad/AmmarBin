"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const collections = [
  { id: "projects", label: "Projects" },
  { id: "blogs", label: "Blog Posts" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "certificates", label: "Certificates" },
  { id: "participations", label: "Participations" },
];

export default function AdminExportPage() {
  const { status } = useSession();
  const router = useRouter();
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    collections.map((c) => c.id)
  );
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const handleExport = async (format: "json" | "csv") => {
    setExporting(true);
    try {
      const response = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collections: selectedCollections,
          format,
        }),
      });

      if (response.ok) {
        if (format === "json") {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `portfolio-export-${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `portfolio-export-${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        toast.success(`Export completed!`);
      } else {
        toast.error("Failed to export data");
      }
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("An error occurred");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (clearExisting: boolean) => {
    if (!confirm(
      `Are you sure you want to import data?${clearExisting ? "\n\nThis will DELETE existing data in selected collections!" : ""}`
    )) {
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setImporting(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        const response = await fetch("/api/admin/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: data.data || data,
            clearExisting,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          toast.success(
            `Imported ${result.totalDocuments} documents from ${Object.keys(result.imported).length} collections!`
          );
        } else {
          toast.error("Failed to import data");
        }
      } catch (error) {
        console.error("Error importing:", error);
        toast.error("Invalid file or error occurred");
      } finally {
        setImporting(false);
      }
    };
    input.click();
  };

  const toggleCollection = (id: string) => {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
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
          <h1 className="text-4xl font-bold">Export & Import Data</h1>
          <p className="text-muted-foreground mt-2">
            Export your data for backup or import from a backup file
          </p>
        </div>

        {/* Export Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
            <CardDescription>
              Download your portfolio data in JSON or CSV format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block">
                Select Collections to Export
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center gap-2 p-2 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => toggleCollection(collection.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes(collection.id)}
                      onChange={() => toggleCollection(collection.id)}
                      className="rounded"
                    />
                    <label className="text-sm cursor-pointer">
                      {collection.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => handleExport("json")}
                disabled={exporting || selectedCollections.length === 0}
                className="gap-2"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileJson className="h-4 w-4" />
                    Export as JSON
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleExport("csv")}
                disabled={exporting || selectedCollections.length === 0}
                variant="outline"
                className="gap-2"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    Export as CSV
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data
            </CardTitle>
            <CardDescription>
              Import data from a previously exported JSON file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={() => handleImport(false)}
                disabled={importing}
                variant="outline"
                className="gap-2"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Import (Merge)
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleImport(true)}
                disabled={importing}
                variant="destructive"
                className="gap-2"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Import (Clear & Replace)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

