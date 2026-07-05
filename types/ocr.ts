export type ExtractedCardFields = {
  name: string;
  company: string;
  designation: string;
  mobile: string;
  email: string;
  website: string;
  address: string;
  gstNumber: string;
};

export const EMPTY_EXTRACTED_FIELDS: ExtractedCardFields = {
  name: "",
  company: "",
  designation: "",
  mobile: "",
  email: "",
  website: "",
  address: "",
  gstNumber: "",
};

export type OcrScanProgress = {
  status: string;
  progress: number;
};
