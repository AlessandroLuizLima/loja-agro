import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getSettings } from "@/lib/server/settings";
import { getCurrentUser } from "@/lib/server/users";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false, follow: false } };

export default async function AdminSignIn({ searchParams }: PageProps<"/admin/entrar">) {
  await connection();
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect("/admin");
  const { erro } = await searchParams;
  const settings = getSettings();

  return (
    <div className="grid min-h-dvh place-items-center bg-petrol-dark p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-lift sm:p-8">
        <ShieldCheck className="mb-3 size-10 text-brand" />
        <h1 className="text-2xl font-bold text-petrol">Painel da loja</h1>
        <p className="mb-6 text-sm text-muted">{settings.storeName}</p>
        {erro === "permissao" && (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {user ? `A conta ${user.email} não tem acesso ao painel. Entre com a conta de administrador.` : "Entre com a conta de administrador."}
          </p>
        )}
        <Suspense fallback={<div className="h-56" />}>
          <SignInForm defaultNext="/admin" allowSignUp={false} />
        </Suspense>
      </div>
    </div>
  );
}
