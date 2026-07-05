import {
  drawCategoryBlock,
  drawReportIntro,
  drawSectionTitle,
  drawTable,
  finalizePdfPages,
  renderPdfBuffer,
} from "@/lib/pdf/draw-utils";
import { PDF_MARGINS, type PdfReportMeta } from "@/lib/pdf/theme";
import { prisma } from "@/database/client";

type ReportContext = {
  userId: string;
  userName?: string | null;
};

function monthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

function formatMonthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function contactRow(contact: {
  name: string;
  company: string | null;
  designation: string | null;
  mobile: string | null;
  email: string | null;
  city: string | null;
  category: { name: string } | null;
}) {
  return {
    name: contact.name,
    company: contact.company ?? "—",
    designation: contact.designation ?? "—",
    phone: contact.mobile ?? "—",
    email: contact.email ?? "—",
    city: contact.city ?? "—",
    category: contact.category?.name ?? "Uncategorized",
  };
}

async function getAllContacts(userId: string) {
  return prisma.visitingCard.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      name: true,
      company: true,
      designation: true,
      mobile: true,
      email: true,
      city: true,
      category: { select: { name: true } },
    },
  });
}

async function getCategoryReportData(userId: string) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      color: true,
      visitingCards: {
        where: { userId },
        orderBy: { name: "asc" },
        select: {
          name: true,
          company: true,
          mobile: true,
          email: true,
        },
      },
    },
  });

  const uncategorized = await prisma.visitingCard.findMany({
    where: { userId, categoryId: null },
    orderBy: { name: "asc" },
    select: {
      name: true,
      company: true,
      mobile: true,
      email: true,
    },
  });

  return { categories, uncategorized };
}

async function getMonthlyAddedContacts(
  userId: string,
  year: number,
  month: number
) {
  const { start, end } = monthRange(year, month);

  return prisma.visitingCard.findMany({
    where: {
      userId,
      createdAt: {
        gte: start,
        lt: end,
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      company: true,
      designation: true,
      mobile: true,
      email: true,
      city: true,
      createdAt: true,
      category: { select: { name: true } },
    },
  });
}

export async function generateAllContactsReport(context: ReportContext) {
  const contacts = await getAllContacts(context.userId);
  const generatedAt = new Date();

  const meta: PdfReportMeta = {
    title: "All Contacts Report",
    subtitle: "Complete directory of visiting card contacts in your CRM library",
    generatedAt,
    userName: context.userName,
  };

  const buffer = await renderPdfBuffer((doc) => {
    let y = drawReportIntro(doc, meta, [
      { label: "Total contacts", value: String(contacts.length) },
      {
        label: "With email",
        value: String(contacts.filter((item) => item.email).length),
      },
      {
        label: "With phone",
        value: String(contacts.filter((item) => item.mobile).length),
      },
    ]);

    y = drawSectionTitle(doc, "Contact directory", y);

    drawTable(
      doc,
      [
        { key: "name", label: "Name", width: 75 },
        { key: "company", label: "Company", width: 75 },
        { key: "designation", label: "Role", width: 65 },
        { key: "phone", label: "Phone", width: 70 },
        { key: "email", label: "Email", width: 110 },
        { key: "city", label: "City", width: 50 },
        { key: "category", label: "Category", width: 54 },
      ],
      contacts.map(contactRow),
      y
    );

    finalizePdfPages(doc, meta);
  });

  return {
    buffer,
    filename: `all-contacts-report-${generatedAt.toISOString().slice(0, 10)}.pdf`,
    total: contacts.length,
  };
}

export async function generateCategoryReport(context: ReportContext) {
  const { categories, uncategorized } = await getCategoryReportData(
    context.userId
  );
  const generatedAt = new Date();
  const totalContacts =
    categories.reduce((sum, category) => sum + category.visitingCards.length, 0) +
    uncategorized.length;

  const meta: PdfReportMeta = {
    title: "Category Report",
    subtitle: "Contacts grouped by category with distribution summary",
    generatedAt,
    userName: context.userName,
  };

  const buffer = await renderPdfBuffer((doc) => {
    let y = drawReportIntro(doc, meta, [
      { label: "Total contacts", value: String(totalContacts) },
      { label: "Categories", value: String(categories.length) },
      { label: "Uncategorized", value: String(uncategorized.length) },
    ]);

    for (const category of categories) {
      y = drawCategoryBlock(
        doc,
        category.name,
        category.color,
        category.visitingCards.length,
        category.visitingCards.map((contact) => ({
          name: contact.name,
          company: contact.company ?? "—",
          phone: contact.mobile ?? "—",
          email: contact.email ?? "—",
        })),
        y
      );
      y += 12;
    }

    if (uncategorized.length > 0) {
      y = drawCategoryBlock(
        doc,
        "Uncategorized",
        "#94a3b8",
        uncategorized.length,
        uncategorized.map((contact) => ({
          name: contact.name,
          company: contact.company ?? "—",
          phone: contact.mobile ?? "—",
          email: contact.email ?? "—",
        })),
        y
      );
    }

    finalizePdfPages(doc, meta);
  });

  return {
    buffer,
    filename: `category-report-${generatedAt.toISOString().slice(0, 10)}.pdf`,
    total: totalContacts,
  };
}

export async function generateMonthlyAddedReport(
  context: ReportContext,
  year: number,
  month: number
) {
  const contacts = await getMonthlyAddedContacts(context.userId, year, month);
  const generatedAt = new Date();
  const monthLabel = formatMonthLabel(year, month);

  const meta: PdfReportMeta = {
    title: "Monthly Added Cards Report",
    subtitle: `Contacts added during ${monthLabel}`,
    generatedAt,
    userName: context.userName,
  };

  const buffer = await renderPdfBuffer((doc) => {
    let y = drawReportIntro(doc, meta, [
      { label: "Month", value: monthLabel },
      { label: "Cards added", value: String(contacts.length) },
      {
        label: "Categories used",
        value: String(
          new Set(
            contacts
              .map((contact) => contact.category?.name ?? "Uncategorized")
          ).size
        ),
      },
    ]);

    y = drawSectionTitle(doc, `Added in ${monthLabel}`, y);

    if (contacts.length === 0) {
      doc.fillColor("#64748b").font("Helvetica").fontSize(10);
      doc.text("No contacts were added during this month.", PDF_MARGINS.left, y);
    } else {
      drawTable(
        doc,
        [
          { key: "added", label: "Added", width: 70 },
          { key: "name", label: "Name", width: 75 },
          { key: "company", label: "Company", width: 75 },
          { key: "phone", label: "Phone", width: 70 },
          { key: "email", label: "Email", width: 110 },
          { key: "category", label: "Category", width: 99 },
        ],
        contacts.map((contact) => ({
          added: new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
          }).format(contact.createdAt),
          name: contact.name,
          company: contact.company ?? "—",
          phone: contact.mobile ?? "—",
          email: contact.email ?? "—",
          category: contact.category?.name ?? "Uncategorized",
        })),
        y
      );
    }

    finalizePdfPages(doc, meta);
  });

  return {
    buffer,
    filename: `monthly-added-${year}-${String(month).padStart(2, "0")}.pdf`,
    total: contacts.length,
  };
}

export const PDF_REPORT_TYPES = [
  "all-contacts",
  "categories",
  "monthly-added",
] as const;

export type PdfReportType = (typeof PDF_REPORT_TYPES)[number];

export function parseReportMonth(input?: string | null) {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;

  if (input && /^\d{4}-\d{2}$/.test(input)) {
    const [yearText, monthText] = input.split("-");
    year = Number(yearText);
    month = Number(monthText);
  }

  if (month < 1 || month > 12) {
    throw new Error("Invalid month selected");
  }

  return { year, month };
}

export async function generatePdfReport(
  type: PdfReportType,
  context: ReportContext,
  monthParam?: string | null
) {
  switch (type) {
    case "all-contacts":
      return generateAllContactsReport(context);
    case "categories":
      return generateCategoryReport(context);
    case "monthly-added": {
      const { year, month } = parseReportMonth(monthParam);
      return generateMonthlyAddedReport(context, year, month);
    }
    default:
      throw new Error("Unsupported report type");
  }
}
