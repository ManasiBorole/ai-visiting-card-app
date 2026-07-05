export type AiConfidence = "high" | "medium" | "low";

export type ContactFields = {
  name?: string;
  company?: string;
  designation?: string;
  mobile?: string;
  alternateMobile?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  gstNumber?: string;
  notes?: string;
};

export type DuplicateMatch = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  mobile: string | null;
  reason: "email" | "phone" | "name-company";
  confidence: AiConfidence;
};

export type CategorySuggestion = {
  categoryId: string;
  categoryName: string;
  color: string;
  confidence: AiConfidence;
  reason: string;
};

export type BusinessTypeResult = {
  type: string;
  confidence: AiConfidence;
  signals: string[];
};

export type OcrCorrection = {
  field: keyof ContactFields;
  current: string;
  suggested: string;
  reason: string;
  confidence: AiConfidence;
};

export type SmartSearchParseResult = {
  interpretation: string;
  filters: {
    q?: string;
    name?: string;
    company?: string;
    phone?: string;
    email?: string;
    city?: string;
    state?: string;
    gst?: string;
    tag?: string;
    categoryId?: string;
  };
  keywords: string[];
};

export type ContactAnalysisResult = {
  duplicates: DuplicateMatch[];
  categorySuggestion: CategorySuggestion | null;
  businessType: BusinessTypeResult | null;
  summary: string;
  ocrCorrections: OcrCorrection[];
};

export type ContactSummaryResult = {
  summary: string;
  highlights: string[];
  businessType: BusinessTypeResult | null;
};
