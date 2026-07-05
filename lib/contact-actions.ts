type ContactActionInput = {
  name: string;
  company?: string | null;
  designation?: string | null;
  mobile?: string | null;
  alternateMobile?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pinCode?: string | null;
  gstNumber?: string | null;
  notes?: string | null;
};

function normalizePhone(value?: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 ? digits : null;
}

function normalizeWebsite(value?: string | null) {
  if (!value) return null;
  return value.startsWith("http") ? value : `https://${value}`;
}

export function getCallLink(phone?: string | null) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return `tel:+${normalized}`;
}

export function getWhatsAppLink(phone?: string | null) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}`;
}

export function getEmailLink(email?: string | null) {
  if (!email?.trim()) return null;
  return `mailto:${email.trim()}`;
}

export function getWebsiteLink(website?: string | null) {
  const normalized = normalizeWebsite(website);
  if (!normalized) return null;

  try {
    new URL(normalized);
    return normalized;
  } catch {
    return null;
  }
}

export function getGoogleMapsLink(contact: ContactActionInput) {
  const parts = [
    contact.address,
    contact.city,
    contact.state,
    contact.pinCode,
    contact.country,
  ]
    .map((value) => value?.trim())
    .filter(Boolean);

  if (parts.length === 0) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    parts.join(", ")
  )}`;
}

export function buildShareText(contact: ContactActionInput) {
  const lines = [
    contact.name,
    contact.company,
    contact.designation,
    contact.mobile ? `Phone: ${contact.mobile}` : null,
    contact.alternateMobile ? `Alt phone: ${contact.alternateMobile}` : null,
    contact.email ? `Email: ${contact.email}` : null,
    contact.website ? `Website: ${contact.website}` : null,
    contact.address ? `Address: ${contact.address}` : null,
    [contact.city, contact.state, contact.pinCode, contact.country]
      .filter(Boolean)
      .join(", ") || null,
    contact.gstNumber ? `GST: ${contact.gstNumber}` : null,
    contact.notes ? `Notes: ${contact.notes}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}

export function buildVCard(contact: ContactActionInput) {
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${contact.name}`];

  if (contact.company) lines.push(`ORG:${contact.company}`);
  if (contact.designation) lines.push(`TITLE:${contact.designation}`);
  if (contact.mobile) lines.push(`TEL;TYPE=CELL:${contact.mobile}`);
  if (contact.alternateMobile) {
    lines.push(`TEL;TYPE=WORK:${contact.alternateMobile}`);
  }
  if (contact.email) lines.push(`EMAIL:${contact.email}`);
  if (contact.website) lines.push(`URL:${normalizeWebsite(contact.website)}`);

  const addressParts = [
    "",
    "",
    contact.address ?? "",
    contact.city ?? "",
    contact.state ?? "",
    contact.pinCode ?? "",
    contact.country ?? "",
  ];

  if (addressParts.some((part) => part.trim())) {
    lines.push(`ADR;TYPE=WORK:${addressParts.join(";")}`);
  }

  if (contact.notes) lines.push(`NOTE:${contact.notes}`);
  lines.push("END:VCARD");

  return lines.join("\n");
}

export function getPrimaryPhone(contact: ContactActionInput) {
  return contact.mobile ?? contact.alternateMobile ?? null;
}
