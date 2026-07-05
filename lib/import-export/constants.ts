export const EXPORT_HEADERS = [
  "Name",
  "Company",
  "Designation",
  "Phone",
  "Alternate Phone",
  "Email",
  "Website",
  "Address",
  "City",
  "State",
  "Country",
  "PIN Code",
  "GST Number",
  "Category",
  "Tags",
  "Notes",
] as const;

export type ExportHeader = (typeof EXPORT_HEADERS)[number];

export const HEADER_TO_FIELD: Record<string, keyof ImportContactRow> = {
  name: "name",
  "full name": "name",
  contact: "name",
  company: "company",
  organisation: "company",
  organization: "company",
  designation: "designation",
  title: "designation",
  jobtitle: "designation",
  "job title": "designation",
  phone: "mobile",
  mobile: "mobile",
  "phone number": "mobile",
  "alternate phone": "alternateMobile",
  "alt phone": "alternateMobile",
  "secondary phone": "alternateMobile",
  email: "email",
  "email address": "email",
  website: "website",
  url: "website",
  address: "address",
  city: "city",
  state: "state",
  country: "country",
  pin: "pinCode",
  "pin code": "pinCode",
  pincode: "pinCode",
  zip: "pinCode",
  "postal code": "pinCode",
  gst: "gstNumber",
  "gst number": "gstNumber",
  gstnumber: "gstNumber",
  category: "categoryName",
  tags: "tags",
  notes: "notes",
  note: "notes",
};

export type ImportContactRow = {
  name: string;
  company?: string;
  designation?: string;
  mobile?: string;
  alternateMobile?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  gstNumber?: string;
  categoryName?: string;
  tags?: string;
  notes?: string;
};

export type ParsedImportRow = ImportContactRow & {
  rowNumber: number;
};

export type DuplicateMatchReason =
  | "email"
  | "phone"
  | "name-company"
  | "import-batch";

export type ImportDuplicateItem = {
  rowNumber: number;
  name: string;
  company?: string;
  email?: string;
  mobile?: string;
  reason: DuplicateMatchReason;
  matchedWith?: string;
};

export type ImportResult = {
  totalRows: number;
  imported: number;
  duplicates: ImportDuplicateItem[];
  invalid: Array<{ rowNumber: number; error: string }>;
};

export type ExportContactRecord = {
  name: string;
  company: string | null;
  designation: string | null;
  mobile: string | null;
  alternateMobile: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pinCode: string | null;
  gstNumber: string | null;
  notes: string | null;
  tags: unknown;
  category: { name: string } | null;
};
