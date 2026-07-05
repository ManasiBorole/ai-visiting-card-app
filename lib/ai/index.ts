export type * from "@/lib/ai/types";
export {
  confidenceLabel,
  detectDuplicateContacts,
  duplicateReasonLabel,
} from "@/lib/ai/duplicate-detection";
export { detectBusinessType } from "@/lib/ai/business-type";
export { suggestCategory } from "@/lib/ai/category-suggestion";
export { generateContactSummary } from "@/lib/ai/contact-summary";
export { suggestOcrCorrections } from "@/lib/ai/ocr-corrections";
export { parseSmartSearchQuery } from "@/lib/ai/smart-search";
