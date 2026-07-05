"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
  Loader2,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ImportResult } from "@/lib/import-export/constants";
import {
  duplicateReasonLabel,
  triggerBrowserDownload,
} from "@/lib/import-export/client-utils";
import { buildExportFilename } from "@/lib/import-export/mappers";

type ImportExportPanelProps = {
  contactCount: number;
};

type ProgressState = {
  label: string;
  value: number;
};

function ProgressBar({ label, value }: ProgressState) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function ImportExportPanel({ contactCount }: ImportExportPanelProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exportProgress, setExportProgress] = useState<ProgressState | null>(
    null
  );
  const [importProgress, setImportProgress] = useState<ProgressState | null>(
    null
  );
  const [exportError, setExportError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<
    "csv" | "xlsx" | "template" | null
  >(null);

  async function handleExport(format: "csv" | "xlsx") {
    setExportError(null);
    setExportingFormat(format);
    setExportProgress({ label: "Preparing export...", value: 15 });

    try {
      const response = await fetch(`/api/export/contacts?format=${format}`);

      setExportProgress({ label: "Generating file...", value: 55 });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error ?? "Export failed");
      }

      const blob = await response.blob();

      setExportProgress({ label: "Starting download...", value: 85 });

      triggerBrowserDownload(blob, buildExportFilename(format));

      setExportProgress({ label: "Download complete", value: 100 });
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "Failed to export contacts"
      );
      setExportProgress(null);
    } finally {
      setExportingFormat(null);
      window.setTimeout(() => setExportProgress(null), 1200);
    }
  }

  async function handleTemplateDownload() {
    setExportError(null);
    setExportingFormat("template");
    setExportProgress({ label: "Preparing template...", value: 20 });

    try {
      const response = await fetch("/api/export/contacts?template=true");

      setExportProgress({ label: "Generating template...", value: 60 });

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      setExportProgress({ label: "Starting download...", value: 90 });
      triggerBrowserDownload(blob, "visiting-cards-template.xlsx");
      setExportProgress({ label: "Download complete", value: 100 });
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "Failed to download template"
      );
      setExportProgress(null);
    } finally {
      setExportingFormat(null);
      window.setTimeout(() => setExportProgress(null), 1200);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setImportResult(null);
    setImportError(null);
  }

  async function handleImport() {
    if (!selectedFile) return;

    setIsImporting(true);
    setImportError(null);
    setImportResult(null);
    setImportProgress({ label: "Uploading file...", value: 10 });

    try {
      const result = await new Promise<{
        success: boolean;
        data?: ImportResult;
        error?: string;
        message?: string;
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("file", selectedFile);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const uploadPercent = Math.round((event.loaded / event.total) * 45);
            setImportProgress({
              label: "Uploading file...",
              value: 10 + uploadPercent,
            });
          }
        };

        xhr.onload = () => {
          setImportProgress({ label: "Processing contacts...", value: 80 });

          try {
            const payload = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(payload);
            } else {
              reject(new Error(payload.error ?? "Import failed"));
            }
          } catch {
            reject(new Error("Import failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Import failed"));
        xhr.open("POST", "/api/import/contacts");
        xhr.send(formData);
      });

      setImportProgress({ label: "Import complete", value: 100 });
      setImportResult(result.data ?? null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.refresh();
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "Failed to import contacts"
      );
      setImportProgress(null);
    } finally {
      setIsImporting(false);
      window.setTimeout(() => setImportProgress(null), 1500);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Export contacts</CardTitle>
          <CardDescription>
            Download all {contactCount} contact{contactCount === 1 ? "" : "s"}{" "}
            from your CRM library
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Button
              type="button"
              className="h-auto flex-col items-start gap-2 px-4 py-4 text-left"
              onClick={() => handleExport("xlsx")}
              disabled={contactCount === 0 || exportingFormat !== null}
            >
              <span className="inline-flex items-center gap-2 font-medium">
                {exportingFormat === "xlsx" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="size-4" />
                )}
                Export to Excel
              </span>
              <span className="text-xs font-normal text-primary-foreground/80">
                .xlsx spreadsheet with all contact fields
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-auto flex-col items-start gap-2 px-4 py-4 text-left"
              onClick={() => handleExport("csv")}
              disabled={contactCount === 0 || exportingFormat !== null}
            >
              <span className="inline-flex items-center gap-2 font-medium">
                {exportingFormat === "csv" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Export to CSV
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                Comma-separated file for Excel and Google Sheets
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-auto flex-col items-start gap-2 px-4 py-4 text-left"
              onClick={handleTemplateDownload}
              disabled={exportingFormat !== null}
            >
              <span className="inline-flex items-center gap-2 font-medium">
                {exportingFormat === "template" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Download import template
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                Blank Excel template with the correct column headers
              </span>
            </Button>
          </div>

          {exportProgress ? <ProgressBar {...exportProgress} /> : null}

          {exportError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {exportError}
            </div>
          ) : null}

          {contactCount === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add contacts before exporting your CRM data.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Import contacts</CardTitle>
          <CardDescription>
            Upload a CSV or Excel file. Duplicate contacts are detected by
            email, phone, or name + company.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="inline-flex items-center gap-2 font-medium">
                  <FileUp className="size-4" />
                  Upload spreadsheet
                </p>
                <p className="text-sm text-muted-foreground">
                  Supported formats: .xlsx, .xls, .csv
                </p>
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                onChange={handleFileChange}
                className="max-w-sm"
              />
            </div>
          </div>

          {selectedFile ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 px-4 py-3 text-sm">
              <Badge variant="secondary">{selectedFile.name}</Badge>
              <span className="text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ) : null}

          <Button
            type="button"
            className="gap-2"
            onClick={handleImport}
            disabled={!selectedFile || isImporting}
          >
            {isImporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Import contacts
          </Button>

          {importProgress ? <ProgressBar {...importProgress} /> : null}

          {importError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {importError}
            </div>
          ) : null}

          {importResult ? (
            <div className="space-y-4 rounded-xl border border-border/60 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
                <div>
                  <p className="font-medium">
                    Imported {importResult.imported} of {importResult.totalRows}{" "}
                    rows
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {importResult.duplicates.length} duplicate
                    {importResult.duplicates.length === 1 ? "" : "s"} skipped ·{" "}
                    {importResult.invalid.length} invalid row
                    {importResult.invalid.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {importResult.duplicates.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Duplicates skipped</p>
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {importResult.duplicates.map((duplicate) => (
                      <div
                        key={`${duplicate.rowNumber}-${duplicate.name}`}
                        className="rounded-lg border border-border/60 px-3 py-2 text-sm"
                      >
                        <p className="font-medium">
                          Row {duplicate.rowNumber}: {duplicate.name}
                        </p>
                        <p className="text-muted-foreground">
                          {duplicateReasonLabel(duplicate.reason)}
                          {duplicate.matchedWith
                            ? ` · matched with ${duplicate.matchedWith}`
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {importResult.invalid.length > 0 ? (
                <div className="space-y-2">
                  <p className="inline-flex items-center gap-2 text-sm font-medium">
                    <AlertCircle className="size-4" />
                    Invalid rows
                  </p>
                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    {importResult.invalid.map((item) => (
                      <div
                        key={`invalid-${item.rowNumber}`}
                        className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm"
                      >
                        Row {item.rowNumber}: {item.error}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
