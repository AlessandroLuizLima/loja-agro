import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "Criar conta", robots: { index: false } };

export default function SignUpPage() {
  return (
    <AuthCard title="Criar sua conta" subtitle="Acompanhe seus pedidos e compre mais rápido.">
      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <SignUpForm />
      </Suspense>
    </AuthCard>
  );
}
