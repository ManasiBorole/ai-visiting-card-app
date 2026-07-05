import PDFDocument from "pdfkit";
import type PDFKit from "pdfkit";

import {
  PDF_MARGINS,
  PDF_THEME,
  type PdfReportMeta,
  type PdfStatItem,
  type PdfTableColumn,
} from "@/lib/pdf/theme";

function formatReportDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function contentWidth(doc: PDFKit.PDFDocument) {
  return doc.page.width - PDF_MARGINS.left - PDF_MARGINS.right;
}

export function drawPageChrome(
  doc: PDFKit.PDFDocument,
  meta: PdfReportMeta,
  pageNumber: number,
  totalPages: number
) {
  doc.save();
  doc.rect(0, 0, doc.page.width, 72).fill(PDF_THEME.primary);
  doc.rect(0, 72, doc.page.width, 4).fill(PDF_THEME.accent);

  doc.fillColor(PDF_THEME.white).font("Helvetica-Bold").fontSize(18);
  doc.text("Visiting Card AI", PDF_MARGINS.left, 24, {
    width: contentWidth(doc),
  });

  doc.font("Helvetica").fontSize(10).fillColor("#cbd5e1");
  doc.text(meta.title, PDF_MARGINS.left, 46, { width: contentWidth(doc) });

  doc.fillColor(PDF_THEME.muted).fontSize(8);
  doc.text(
    `Generated ${formatReportDate(meta.generatedAt)}${meta.userName ? ` · ${meta.userName}` : ""}`,
    PDF_MARGINS.left,
    doc.page.height - 36,
    { width: contentWidth(doc) / 2, align: "left" }
  );

  doc.text(`Page ${pageNumber} of ${totalPages}`, PDF_MARGINS.left, doc.page.height - 36, {
    width: contentWidth(doc),
    align: "right",
  });

  doc.text("Confidential CRM report", PDF_MARGINS.left, doc.page.height - 22, {
    width: contentWidth(doc),
    align: "center",
  });

  doc.restore();
}

export function drawReportIntro(
  doc: PDFKit.PDFDocument,
  meta: PdfReportMeta,
  stats: PdfStatItem[]
) {
  let y = PDF_MARGINS.top;

  doc.fillColor(PDF_THEME.text).font("Helvetica-Bold").fontSize(22);
  doc.text(meta.title, PDF_MARGINS.left, y, { width: contentWidth(doc) });
  y += 30;

  doc.fillColor(PDF_THEME.muted).font("Helvetica").fontSize(11);
  doc.text(meta.subtitle, PDF_MARGINS.left, y, { width: contentWidth(doc) });
  y += 28;

  drawStatCards(doc, stats, y);
  return y + 78;
}

export function drawStatCards(
  doc: PDFKit.PDFDocument,
  stats: PdfStatItem[],
  startY: number
) {
  const gap = 12;
  const cardWidth =
    (contentWidth(doc) - gap * Math.max(stats.length - 1, 0)) / stats.length;

  stats.forEach((stat, index) => {
    const x = PDF_MARGINS.left + index * (cardWidth + gap);

    doc.save();
    doc.roundedRect(x, startY, cardWidth, 58, 8).fillAndStroke(PDF_THEME.light, PDF_THEME.border);
    doc.fillColor(PDF_THEME.muted).font("Helvetica").fontSize(8);
    doc.text(stat.label.toUpperCase(), x + 14, startY + 12, {
      width: cardWidth - 28,
    });
    doc.fillColor(PDF_THEME.text).font("Helvetica-Bold").fontSize(16);
    doc.text(stat.value, x + 14, startY + 28, { width: cardWidth - 28 });
    doc.restore();
  });
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

export function drawTable(
  doc: PDFKit.PDFDocument,
  columns: PdfTableColumn[],
  rows: Array<Record<string, string>>,
  startY: number
): number {
  const rowHeight = 24;
  const headerHeight = 28;
  let y = startY;

  const drawHeader = () => {
    doc.save();
    doc.rect(PDF_MARGINS.left, y, contentWidth(doc), headerHeight).fill(PDF_THEME.primary);
    doc.fillColor(PDF_THEME.white).font("Helvetica-Bold").fontSize(8);

    let x = PDF_MARGINS.left + 10;
    for (const column of columns) {
      doc.text(column.label.toUpperCase(), x, y + 9, {
        width: column.width - 12,
      });
      x += column.width;
    }

    doc.restore();
    y += headerHeight;
  };

  drawHeader();

  rows.forEach((row, index) => {
    if (y + rowHeight > doc.page.height - PDF_MARGINS.bottom) {
      doc.addPage();
      y = PDF_MARGINS.top;
      drawHeader();
    }

    if (index % 2 === 0) {
      doc.save();
      doc.rect(PDF_MARGINS.left, y, contentWidth(doc), rowHeight).fill("#fcfdff");
      doc.restore();
    }

    doc.save();
    doc.strokeColor(PDF_THEME.border).moveTo(PDF_MARGINS.left, y + rowHeight).lineTo(PDF_MARGINS.left + contentWidth(doc), y + rowHeight).stroke();
    doc.fillColor(PDF_THEME.text).font("Helvetica").fontSize(8);

    let x = PDF_MARGINS.left + 10;
    for (const column of columns) {
      doc.text(truncateText(row[column.key] ?? "—", 42), x, y + 8, {
        width: column.width - 12,
      });
      x += column.width;
    }

    doc.restore();
    y += rowHeight;
  });

  return y + 16;
}

export function drawSectionTitle(doc: PDFKit.PDFDocument, title: string, y: number) {
  if (y > doc.page.height - PDF_MARGINS.bottom - 80) {
    doc.addPage();
    y = PDF_MARGINS.top;
  }

  doc.fillColor(PDF_THEME.text).font("Helvetica-Bold").fontSize(13);
  doc.text(title, PDF_MARGINS.left, y, { width: contentWidth(doc) });

  doc.save();
  doc.strokeColor(PDF_THEME.accent).lineWidth(2).moveTo(PDF_MARGINS.left, y + 18).lineTo(PDF_MARGINS.left + 56, y + 18).stroke();
  doc.restore();

  return y + 30;
}

export function drawCategoryBlock(
  doc: PDFKit.PDFDocument,
  name: string,
  color: string,
  count: number,
  contacts: Array<{ name: string; company: string; phone: string; email: string }>,
  startY: number
) {
  let y = startY;

  if (y > doc.page.height - PDF_MARGINS.bottom - 100) {
    doc.addPage();
    y = PDF_MARGINS.top;
  }

  doc.save();
  doc.roundedRect(PDF_MARGINS.left, y, contentWidth(doc), 34, 6).fillAndStroke(PDF_THEME.light, PDF_THEME.border);
  doc.rect(PDF_MARGINS.left, y, 6, 34).fill(color);
  doc.fillColor(PDF_THEME.text).font("Helvetica-Bold").fontSize(11);
  doc.text(name, PDF_MARGINS.left + 16, y + 11, { width: contentWidth(doc) - 120 });
  doc.fillColor(PDF_THEME.muted).font("Helvetica").fontSize(9);
  doc.text(`${count} contact${count === 1 ? "" : "s"}`, PDF_MARGINS.left, y + 12, {
    width: contentWidth(doc) - 16,
    align: "right",
  });
  doc.restore();

  y += 44;

  if (contacts.length === 0) {
    doc.fillColor(PDF_THEME.muted).font("Helvetica").fontSize(9);
    doc.text("No contacts in this category.", PDF_MARGINS.left + 8, y);
    return y + 24;
  }

  return drawTable(
    doc,
    [
      { key: "name", label: "Name", width: 130 },
      { key: "company", label: "Company", width: 150 },
      { key: "phone", label: "Phone", width: 110 },
      { key: "email", label: "Email", width: contentWidth(doc) - 390 },
    ],
    contacts,
    y
  );
}

export function finalizePdfPages(doc: PDFKit.PDFDocument, meta: PdfReportMeta) {
  const range = doc.bufferedPageRange();

  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    drawPageChrome(doc, meta, i - range.start + 1, range.count);
  }
}

export function createPdfDocument() {
  return new PDFDocument({
    size: "A4",
    margin: 0,
    bufferPages: true,
  });
}

export function renderPdfBuffer(
  build: (doc: PDFKit.PDFDocument) => void
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = createPdfDocument();
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    build(doc);
    doc.end();
  });
}
