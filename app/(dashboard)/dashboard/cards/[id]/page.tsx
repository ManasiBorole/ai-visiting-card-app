import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ContactDetailView } from "@/components/visiting-cards/contact-detail-view";
import { ROUTES } from "@/lib/constants";
import { getVisitingCardById } from "@/services/visiting-card.service";

type ContactPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return { title: "Contact" };
  }

  const contact = await getVisitingCardById(session.user.id, id);

  return {
    title: contact?.name ?? "Contact",
  };
}

export default async function ContactDetailPage({ params }: ContactPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const { id } = await params;
  const contact = await getVisitingCardById(session.user.id, id);

  if (!contact) {
    notFound();
  }

  return (
    <DashboardShell
      title={contact.name}
      subtitle={contact.company ?? "Contact details"}
      userName={session.user.name}
    >
      <ContactDetailView
        contact={{
          ...contact,
          createdAt: contact.createdAt.toISOString(),
          updatedAt: contact.updatedAt.toISOString(),
        }}
      />
    </DashboardShell>
  );
}
