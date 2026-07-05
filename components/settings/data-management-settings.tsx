"use client";

import { useRef, useState } from "react";
import {
  Database,
  Download,
  Loader2,
  RotateCcw,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { triggerBrowserDownload } from "@/lib/import-export/client-utils";

function downloadJsonFromResponse(blob: Blob, filename: string) {
  triggerBrowserDownload(blob, filename);
}

type DataManagementSettingsProps = {
  contactCount: number;
};

export function DataManagementSettings({
  contactCount,
}: DataManagementSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreMode, setRestoreMode] = useState<"merge" | "replace">("merge");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingAction, setLoadingAction] = useState<
    "backup" | "export" | "restore" | null
  >(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleBackup() {
    setLoadingAction("backup");
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/settings/backup");
      if (!response.ok) throw new Error("Failed to create backup");

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      downloadJsonFromResponse(
        blob,
        filenameMatch?.[1] ?? "visiting-card-backup.json"
      );
      setMessage("Backup downloaded successfully.");
    } catch (backupError) {
      setError(
        backupError instanceof Error
          ? backupError.message
          : "Failed to create backup"
      );
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleExportAll() {
    setLoadingAction("export");
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/settings/export-all");
      if (!response.ok) throw new Error("Failed to export data");

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      downloadJsonFromResponse(
        blob,
        filenameMatch?.[1] ?? "visiting-card-export.json"
      );
      setMessage("All data exported successfully.");
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Failed to export data"
      );
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleRestore() {
    if (!selectedFile) return;

    setLoadingAction("restore");
    setError(null);
    setMessage(null);

    try {
      const text = await selectedFile.text();
      const backup = JSON.parse(text);

      const response = await fetch("/api/settings/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: restoreMode,
          backup,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to restore backup");
      }

      setMessage(result.message ?? "Backup restored successfully.");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (restoreError) {
      setError(
        restoreError instanceof Error
          ? restoreError.message
          : "Failed to restore backup"
      );
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="size-4 text-primary" />
          Data management
        </CardTitle>
        <CardDescription>
          Backup, restore, and export your CRM data ({contactCount} contacts)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="h-auto flex-col items-start gap-2 px-4 py-4 text-left"
            onClick={handleBackup}
            disabled={loadingAction !== null}
          >
            <span className="inline-flex items-center gap-2 font-medium">
              {loadingAction === "backup" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Backup database
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              Download a restore-ready JSON backup of your CRM data
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-auto flex-col items-start gap-2 px-4 py-4 text-left"
            onClick={handleExportAll}
            disabled={loadingAction !== null}
          >
            <span className="inline-flex items-center gap-2 font-medium">
              {loadingAction === "export" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Export all data
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              Full JSON export with profile, cards, activity, and metadata
            </span>
          </Button>
        </div>

        <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-4">
          <div className="mb-4 flex items-center gap-2 font-medium">
            <RotateCcw className="size-4 text-primary" />
            Restore backup
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="restore-file">Backup file (.json)</Label>
              <Input
                ref={fileInputRef}
                id="restore-file"
                type="file"
                accept="application/json,.json"
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] ?? null)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restore-mode">Restore mode</Label>
              <Select
                id="restore-mode"
                value={restoreMode}
                onChange={(event) =>
                  setRestoreMode(event.target.value as "merge" | "replace")
                }
              >
                <option value="merge">Merge (skip duplicates)</option>
                <option value="replace">Replace all contacts</option>
              </Select>
            </div>
          </div>

          {selectedFile ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Selected: {selectedFile.name}
            </p>
          ) : null}

          <Button
            type="button"
            className="mt-4 gap-2"
            onClick={handleRestore}
            disabled={!selectedFile || loadingAction !== null}
          >
            {loadingAction === "restore" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Restore backup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
