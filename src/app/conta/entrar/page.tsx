import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default function SignInPage() {
  return (
    <AuthCard title="Entrar na sua conta" subtitle="Acompanhe pedidos e compre mais rápido.">
      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>
      <Suspense fallback={<div className="h-72" />}>
        <SignInForm />
      </Suspense>
    </AuthCard>
  );
}
