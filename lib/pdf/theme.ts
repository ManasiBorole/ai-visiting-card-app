export const PDF_THEME = {
  primary: "#1e3a8a",
  accent: "#2563eb",
  text: "#0f172a",
  muted: "#64748b",
  light: "#f8fafc",
  border: "#e2e8f0",
  white: "#ffffff",
  success: "#059669",
} as const;

export const PDF_MARGINS = {
  left: 48,
  right: 48,
  top: 108,
  bottom: 64,
} as const;

export type PdfStatItem = {
  label: string;
  value: string;
};

export type PdfTableColumn = {
  key: string;
  label: string;
  width: number;
};

export type PdfReportMeta = {
  title: string;
  subtitle: string;
  generatedAt: Date;
  userName?: string | null;
};
