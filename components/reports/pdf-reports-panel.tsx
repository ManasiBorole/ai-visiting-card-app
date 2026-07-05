"use client";

import { useMemo, useState } from "react";
import {
  CalendarRange,
  Download,
  FileText,
  FolderKanban,
  Loader2,
  Users,
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
import { triggerBrowserDownload } from "@/lib/import-export/client-utils";

type PdfReportsPanelProps = {
  contactCount: number;
  categoryCount: number;
};

type ReportKind = "all-contacts" | "categories" | "monthly-added";

type ProgressState = {
  label: string;
  value: number;
};

const REPORTS: Array<{
  type: ReportKind;
  title: string;
  description: string;
  icon: typeof Users;
}> = [
  {
    type: "all-contacts",
    title: "All contacts report",
    description: "Full CRM directory with company, phone, email, and category",
    icon: Users,
  },
  {
    type: "categories",
    title: "Category report",
    description: "Contacts grouped by category with color-coded sections",
    icon: FolderKanban,
  },
  {
    type: "monthly-added",
    title: "Monthly added cards report",
    description: "Cards added during a selected month with add dates",
    icon: CalendarRange,
  },
];

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

function defaultMonthValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export function PdfReportsPanel({
  contactCount,
  categoryCount,
}: PdfReportsPanelProps) {
  const [activeReport, setActiveReport] = useState<ReportKind | null>(null);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(defaultMonthValue);

  const disabledAllContacts = contactCount === 0;
  const disabledCategories = categoryCount === 0 && contactCount === 0;

  const reportAvailability = useMemo(
    () => ({
      "all-contacts": !disabledAllContacts,
      categories: !disabledCategories,
      "monthly-added": true,
    }),
    [disabledAllContacts, disabledCategories]
  );

  async function handleDownload(type: ReportKind) {
    setActiveReport(type);
    setError(null);
    setProgress({ label: "Preparing report...", value: 15 });

    try {
      const query =
        type === "monthly-added" ? `?month=${encodeURIComponent(month)}` : "";
      const response = await fetch(`/api/reports/${type}${query}`);

      setProgress({ label: "Generating PDF...", value: 55 });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error ?? "Failed to generate report");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] ?? `${type}-report.pdf`;

      setProgress({ label: "Starting download...", value: 90 });
      triggerBrowserDownload(blob, filename);
      setProgress({ label: "Download complete", value: 100 });
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Failed to generate PDF report"
      );
      setProgress(null);
    } finally {
      setActiveReport(null);
      window.setTimeout(() => setProgress(null), 1200);
    }
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          PDF reports
        </CardTitle>
        <CardDescription>
          Generate professionally formatted PDF reports for your CRM data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          {REPORTS.map((report) => {
            const Icon = report.icon;
            const disabled = !reportAvailability[report.type];
            const isLoading = activeReport === report.type;

            return (
              <div
                key={report.type}
                className="flex h-full flex-col rounded-xl border border-border/60 bg-muted/10 p-4"
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{report.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {report.description}
                    </p>
                  </div>
                </div>

                {report.type === "monthly-added" ? (
                  <div className="mb-4 space-y-2">
                    <Label htmlFor="report-month">Report month</Label>
                    <Input
                      id="report-month"
                      type="month"
                      value={month}
                      onChange={(event) => setMonth(event.target.value)}
                    />
                  </div>
                ) : null}

                <Button
                  type="button"
                  variant={report.type === "all-contacts" ? "default" : "outline"}
                  className="mt-auto gap-2"
                  disabled={disabled || activeReport !== null}
                  onClick={() => handleDownload(report.type)}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  Download PDF
                </Button>
              </div>
            );
          })}
        </div>

        {progress ? <ProgressBar {...progress} /> : null}

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
