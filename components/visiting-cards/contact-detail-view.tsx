"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  Copy,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Share2,
  Trash2,
} from "lucide-react";

import { AiContactSummaryCard } from "@/components/ai/ai-contact-summary";
import { resolveCardImageUrl } from "@/lib/images";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  buildShareText,
  buildVCard,
  getCallLink,
  getEmailLink,
  getGoogleMapsLink,
  getPrimaryPhone,
  getWebsiteLink,
  getWhatsAppLink,
} from "@/lib/contact-actions";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils";

type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

export type ContactDetail = {
  id: string;
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
  frontImage: string | null;
  backImage: string | null;
  createdAt: string;
  updatedAt: string;
  category: CategoryOption | null;
};

type ContactDetailViewProps = {
  contact: ContactDetail;
};

function cardTags(tags: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === "string");
  }
  return [];
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value?.trim()) return null;

  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function ContactDetailView({ contact }: ContactDetailViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const tags = cardTags(contact.tags);
  const primaryPhone = getPrimaryPhone(contact);
  const callLink = getCallLink(primaryPhone);
  const whatsAppLink = getWhatsAppLink(primaryPhone);
  const emailLink = getEmailLink(contact.email);
  const websiteLink = getWebsiteLink(contact.website);
  const mapsLink = getGoogleMapsLink(contact);

  async function handleShare() {
    setActionError(null);
    setActionMessage(null);
    setIsSharing(true);

    const shareText = buildShareText(contact);
    const vCard = buildVCard(contact);

    try {
      if (navigator.share) {
        await navigator.share({
          title: contact.name,
          text: shareText,
        });
        setActionMessage("Contact shared successfully.");
        return;
      }

      await navigator.clipboard.writeText(vCard);
      setActionMessage("Contact copied to clipboard as vCard.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      try {
        await navigator.clipboard.writeText(shareText);
        setActionMessage("Contact details copied to clipboard.");
      } catch {
        setActionError("Unable to share this contact on this device.");
      }
    } finally {
      setIsSharing(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${contact.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const response = await fetch(`/api/visiting-cards/${contact.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to delete contact");
      }

      router.push(ROUTES.cards);
      router.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to delete contact"
      );
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={ROUTES.cards}>
          <Button type="button" variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to cards
          </Button>
        </Link>
        {contact.category ? (
          <Badge
            variant="outline"
            style={{
              borderColor: `${contact.category.color}40`,
              color: contact.category.color,
              backgroundColor: `${contact.category.color}12`,
            }}
          >
            {contact.category.name}
          </Badge>
        ) : null}
      </div>

      {actionMessage ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {actionMessage}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {actionError}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Card images</CardTitle>
            <CardDescription>Front and back visiting card scans</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.frontImage ? (
              <div className="relative aspect-[1.6/1] overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                <Image
                  src={resolveCardImageUrl(contact.frontImage) ?? contact.frontImage}
                  alt={`${contact.name} front card`}
                  fill
                  className="object-contain p-3"
                  unoptimized
                />
                <span className="absolute top-3 left-3 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                  Front
                </span>
              </div>
            ) : (
              <div className="flex aspect-[1.6/1] items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/10 text-sm text-muted-foreground">
                No front image
              </div>
            )}

            {contact.backImage ? (
              <div className="relative aspect-[1.6/1] overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                <Image
                  src={resolveCardImageUrl(contact.backImage) ?? contact.backImage}
                  alt={`${contact.name} back card`}
                  fill
                  className="object-contain p-3"
                  unoptimized
                />
                <span className="absolute top-3 left-3 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                  Back
                </span>
              </div>
            ) : (
              <div className="flex aspect-[1.6/1] items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/10 text-sm text-muted-foreground">
                No back image
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <AiContactSummaryCard contactId={contact.id} />

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">{contact.name}</CardTitle>
              <CardDescription className="space-y-1 text-base">
                {contact.company ? (
                  <span className="block font-medium text-foreground">
                    {contact.company}
                  </span>
                ) : null}
                {contact.designation ? (
                  <span className="block">{contact.designation}</span>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {callLink ? (
                  <a
                    href={callLink}
                    className={cn(buttonVariants({ size: "sm" }), "gap-2")}
                  >
                    <Phone className="size-4" />
                    Call
                  </a>
                ) : (
                  <Button size="sm" className="gap-2" disabled>
                    <Phone className="size-4" />
                    Call
                  </Button>
                )}

                {whatsAppLink ? (
                  <a
                    href={whatsAppLink}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ size: "sm", variant: "outline" }),
                      "gap-2"
                    )}
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </a>
                ) : (
                  <Button size="sm" variant="outline" className="gap-2" disabled>
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </Button>
                )}

                {emailLink ? (
                  <a
                    href={emailLink}
                    className={cn(
                      buttonVariants({ size: "sm", variant: "outline" }),
                      "gap-2"
                    )}
                  >
                    <Mail className="size-4" />
                    Email
                  </a>
                ) : (
                  <Button size="sm" variant="outline" className="gap-2" disabled>
                    <Mail className="size-4" />
                    Email
                  </Button>
                )}

                {websiteLink ? (
                  <a
                    href={websiteLink}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ size: "sm", variant: "outline" }),
                      "gap-2"
                    )}
                  >
                    <Globe className="size-4" />
                    Website
                  </a>
                ) : (
                  <Button size="sm" variant="outline" className="gap-2" disabled>
                    <Globe className="size-4" />
                    Website
                  </Button>
                )}

                {mapsLink ? (
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ size: "sm", variant: "outline" }),
                      "gap-2"
                    )}
                  >
                    <MapPin className="size-4" />
                    Google Maps
                  </a>
                ) : (
                  <Button size="sm" variant="outline" className="gap-2" disabled>
                    <MapPin className="size-4" />
                    Google Maps
                  </Button>
                )}

                <Link href={ROUTES.cardEdit(contact.id)}>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                </Link>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={handleShare}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Share2 className="size-4" />
                  )}
                  Share Contact
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="gap-2"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Delete
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Added {formatDate(contact.createdAt)} · Updated{" "}
                {formatDate(contact.updatedAt)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Contact information</CardTitle>
              <CardDescription>All details captured from this card</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="Name" value={contact.name} />
                <InfoRow label="Company" value={contact.company} />
                <InfoRow label="Designation" value={contact.designation} />
                <InfoRow label="Phone" value={contact.mobile} />
                <InfoRow
                  label="Alternative phone"
                  value={contact.alternateMobile}
                />
                <InfoRow label="Email" value={contact.email} />
                <InfoRow label="Website" value={contact.website} />
                <InfoRow label="Address" value={contact.address} />
                <InfoRow label="City" value={contact.city} />
                <InfoRow label="State" value={contact.state} />
                <InfoRow label="Country" value={contact.country} />
                <InfoRow label="PIN code" value={contact.pinCode} />
                <InfoRow label="GST number" value={contact.gstNumber} />
              </dl>

              {tags.length > 0 ? (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional context and follow-ups</CardDescription>
            </CardHeader>
            <CardContent>
              {contact.notes?.trim() ? (
                <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                  {contact.notes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No notes added for this contact yet.
                </p>
              )}
            </CardContent>
          </Card>

          {(contact.company || contact.city) && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Quick summary</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {contact.company ? (
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="size-4" />
                    {contact.company}
                  </span>
                ) : null}
                {contact.city || contact.state ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4" />
                    {[contact.city, contact.state].filter(Boolean).join(", ")}
                  </span>
                ) : null}
                {contact.email ? (
                  <span className="inline-flex items-center gap-2">
                    <Mail className="size-4" />
                    {contact.email}
                  </span>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={async () => {
                    await navigator.clipboard.writeText(buildShareText(contact));
                    setActionMessage("Contact summary copied to clipboard.");
                    setActionError(null);
                  }}
                >
                  <Copy className="size-4" />
                  Copy summary
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
