import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "Criar conta", robots: { index: false } };

export default function SignUpPage() {
  return (
    <AuthCard title="Criar sua conta" subtitle="Ganhe 10% OFF na primeira compra com o cupom BEMVINDO10.">
      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <SignUpForm />
      </Suspense>
    </AuthCard>
  );
}
