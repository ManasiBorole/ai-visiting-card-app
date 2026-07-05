export type ExtractedCardFields = {
  name: string;
  company: string;
  designation: string;
  mobile: string;
  alternateMobile?: string;
  email: string;
  website: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  gstNumber: string;
  notes?: string;
};

export const EMPTY_EXTRACTED_FIELDS: ExtractedCardFields = {
  name: "",
  company: "",
  designation: "",
  mobile: "",
  alternateMobile: "",
  email: "",
  website: "",
  address: "",
  city: "",
  state: "",
  country: "",
  pinCode: "",
  gstNumber: "",
  notes: "",
};

export type ExtractionProgress = {
  status: string;
  progress: number;
};
