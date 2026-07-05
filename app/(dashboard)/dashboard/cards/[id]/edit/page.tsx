import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EditVisitingCardForm } from "@/components/visiting-cards/edit-card-form";
import { ROUTES } from "@/lib/constants";
import {
  getCategoriesForSelect,
  getVisitingCardById,
} from "@/services/visiting-card.service";

type EditContactPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Contact",
};

export default async function EditContactPage({ params }: EditContactPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const { id } = await params;
  const [contact, categories] = await Promise.all([
    getVisitingCardById(session.user.id, id),
    getCategoriesForSelect(session.user.id),
  ]);

  if (!contact) {
    notFound();
  }

  return (
    <DashboardShell
      title={`Edit ${contact.name}`}
      subtitle="Update contact details and notes"
      userName={session.user.name}
    >
      <EditVisitingCardForm
        cardId={contact.id}
        categories={categories}
        frontImage={contact.frontImage}
        backImage={contact.backImage}
        initialValues={{
          name: contact.name,
          company: contact.company ?? "",
          designation: contact.designation ?? "",
          mobile: contact.mobile ?? "",
          alternateMobile: contact.alternateMobile ?? "",
          email: contact.email ?? "",
          website: contact.website ?? "",
          address: contact.address ?? "",
          city: contact.city ?? "",
          state: contact.state ?? "",
          pinCode: contact.pinCode ?? "",
          gstNumber: contact.gstNumber ?? "",
          categoryId: contact.categoryId ?? "",
          notes: contact.notes ?? "",
        }}
      />
    </DashboardShell>
  );
}
