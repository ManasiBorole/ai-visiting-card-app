import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/signup-form";
import { AuthLayout } from "@/components/layout/auth-layout";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}
