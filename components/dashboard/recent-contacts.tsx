import Link from "next/link";
import { Building2, Mail, MapPin, Phone } from "lucide-react";

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

type RecentContact = {
  id: string;
  name: string;
  company: string | null;
  designation: string | null;
  mobile: string | null;
  email: string | null;
  city: string | null;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
};

type RecentContactsProps = {
  contacts: RecentContact[];
};

export function RecentContacts({ contacts }: RecentContactsProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Recent contacts</CardTitle>
          <CardDescription>Latest updates in your CRM library</CardDescription>
        </div>
        <Link
          href={ROUTES.cards}
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {contacts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No contacts yet. Upload your first visiting card to get started.
          </p>
        ) : (
          contacts.map((contact) => (
            <Link key={contact.id} href={ROUTES.cardDetail(contact.id)}>
              <article className="rounded-xl border border-border/60 p-4 transition-colors hover:border-border hover:bg-muted/20">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-medium">{contact.name}</h3>
                      {contact.company ? (
                        <p className="truncate text-sm text-muted-foreground">
                          {contact.company}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
                {contact.category ? (
                  <Badge
                    variant="outline"
                    className="shrink-0"
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

              <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                {contact.designation ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="size-3.5" />
                    {contact.designation}
                  </span>
                ) : null}
                {contact.mobile ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="size-3.5" />
                    {contact.mobile}
                  </span>
                ) : null}
                {contact.email ? (
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <Mail className="size-3.5 shrink-0" />
                    {contact.email}
                  </span>
                ) : null}
                {contact.city ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {contact.city}
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Updated {formatDate(contact.updatedAt)}
              </p>
              </article>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
