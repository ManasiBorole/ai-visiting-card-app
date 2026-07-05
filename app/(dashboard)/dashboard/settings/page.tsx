import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DataManagementSettings } from "@/components/settings/data-management-settings";
import { DeleteAccountSettings } from "@/components/settings/delete-account-settings";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { InstallAppPrompt } from "@/components/pwa/install-app-prompt";
import { ROUTES } from "@/lib/constants";
import { prisma } from "@/database/client";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const [user, contactCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        passwordHash: true,
      },
    }),
    prisma.visitingCard.count({ where: { userId: session.user.id } }),
  ]);

  if (!user) {
    redirect(ROUTES.login);
  }

  return (
    <DashboardShell
      title="Settings"
      subtitle="Manage your profile, appearance, data, and account"
      userName={session.user.name}
    >
      <div className="space-y-6">
        <ProfileSettingsForm
          initialName={user.name}
          initialEmail={user.email}
        />
        <ThemeSettings />
        <InstallAppPrompt />
        <DataManagementSettings contactCount={contactCount} />
        <DeleteAccountSettings
          email={user.email}
          hasPassword={Boolean(user.passwordHash)}
        />
      </div>
    </DashboardShell>
  );
}
