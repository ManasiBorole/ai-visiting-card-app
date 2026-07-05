import type {
  DuplicateMatchReason,
  ImportContactRow,
  ImportDuplicateItem,
} from "@/lib/import-export/constants";

type ExistingContact = {
  id: string;
  name: string;
  company: string | null;
  mobile: string | null;
  alternateMobile: string | null;
  email: string | null;
};

function normalizePhone(value?: string | null) {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

function normalizeEmail(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function contactKey(name: string, company?: string | null) {
  return `${normalizeText(name)}::${normalizeText(company)}`;
}

export function findDuplicateReason(
  incoming: ImportContactRow,
  existing: ExistingContact
): DuplicateMatchReason | null {
  const incomingEmail = normalizeEmail(incoming.email);
  const existingEmail = normalizeEmail(existing.email);

  if (incomingEmail && existingEmail && incomingEmail === existingEmail) {
    return "email";
  }

  const incomingPhone = normalizePhone(incoming.mobile);
  if (incomingPhone) {
    const phones = [
      normalizePhone(existing.mobile),
      normalizePhone(existing.alternateMobile),
    ].filter(Boolean);

    if (phones.includes(incomingPhone)) {
      return "phone";
    }
  }

  if (
    normalizeText(incoming.name) === normalizeText(existing.name) &&
    normalizeText(incoming.company) === normalizeText(existing.company)
  ) {
    return "name-company";
  }

  return null;
}

export function checkDuplicateInExisting(
  incoming: ImportContactRow,
  existingContacts: ExistingContact[]
): ImportDuplicateItem | null {
  for (const existing of existingContacts) {
    const reason = findDuplicateReason(incoming, existing);

    if (reason) {
      return {
        rowNumber: 0,
        name: incoming.name,
        company: incoming.company,
        email: incoming.email,
        mobile: incoming.mobile,
        reason,
        matchedWith: existing.name,
      };
    }
  }

  return null;
}

export function checkDuplicateInBatch(
  incoming: ImportContactRow,
  acceptedInBatch: ImportContactRow[]
): ImportDuplicateItem | null {
  const incomingEmail = normalizeEmail(incoming.email);
  const incomingPhone = normalizePhone(incoming.mobile);
  const incomingKey = contactKey(incoming.name, incoming.company);

  for (const accepted of acceptedInBatch) {
    if (incomingEmail && incomingEmail === normalizeEmail(accepted.email)) {
      return {
        rowNumber: 0,
        name: incoming.name,
        company: incoming.company,
        email: incoming.email,
        mobile: incoming.mobile,
        reason: "import-batch",
        matchedWith: accepted.name,
      };
    }

    if (incomingPhone) {
      const acceptedPhone = normalizePhone(accepted.mobile);
      if (acceptedPhone && acceptedPhone === incomingPhone) {
        return {
          rowNumber: 0,
          name: incoming.name,
          company: incoming.company,
          email: incoming.email,
          mobile: incoming.mobile,
          reason: "import-batch",
          matchedWith: accepted.name,
        };
      }
    }

    if (incomingKey === contactKey(accepted.name, accepted.company)) {
      return {
        rowNumber: 0,
        name: incoming.name,
        company: incoming.company,
        email: incoming.email,
        mobile: incoming.mobile,
        reason: "import-batch",
        matchedWith: accepted.name,
      };
    }
  }

  return null;
}
