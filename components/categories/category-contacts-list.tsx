"use client";

import Link from "next/link";
import { Building2, Mail, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/utils";

export type CategoryContact = {
  id: string;
  name: string;
  company: string | null;
  designation: string | null;
  mobile: string | null;
  email: string | null;
  city: string | null;
  updatedAt: Date | string;
};

type CategoryContactsListProps = {
  contacts: CategoryContact[];
  emptyMessage?: string;
};

export function CategoryContactsList({
  contacts,
  emptyMessage = "No contacts in this category yet.",
}: CategoryContactsListProps) {
  if (contacts.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <Link key={contact.id} href={ROUTES.cardDetail(contact.id)}>
          <article className="rounded-xl border border-border/60 p-4 transition-colors hover:border-border hover:bg-muted/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">{contact.name}</h3>
                {contact.company ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {contact.company}
                  </p>
                ) : null}
                {contact.designation ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {contact.designation}
                  </p>
                ) : null}
              </div>
              <Badge variant="secondary">View</Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {contact.mobile ? (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  {contact.mobile}
                </span>
              ) : null}
              {contact.email ? (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {contact.email}
                </span>
              ) : null}
              {contact.city ? (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-3.5" />
                  {contact.city}
                </span>
              ) : null}
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Updated {formatDate(contact.updatedAt)}
            </p>
          </article>
        </Link>
      ))}
    </div>
  );
}

type CategoryContactsCardProps = {
  title: string;
  description: string;
  contacts: CategoryContact[];
  emptyMessage?: string;
};

export function CategoryContactsCard({
  title,
  description,
  contacts,
  emptyMessage,
}: CategoryContactsCardProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <CategoryContactsList
          contacts={contacts}
          emptyMessage={emptyMessage}
        />
      </CardContent>
    </Card>
  );
}
