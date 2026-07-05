import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/components/layout/auth-layout";
import { PageLoader } from "@/components/loading";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<PageLoader message="Loading sign in..." />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
