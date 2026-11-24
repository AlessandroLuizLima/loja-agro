import { Smartphone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { TwoFactorLoginForm } from "@/components/admin/two-factor-login-form";
import { adminUrl } from "@/lib/admin-path";
import { getPendingLogin } from "@/lib/server/session";
import { getSettings } from "@/lib/server/settings";

export const metadata: Metadata = { title: "Código de verificação", robots: { index: false, follow: false } };

/** Segunda etapa do login do painel: a senha já foi conferida, falta o código do celular. */
export default async function VerifyPage() {
  await connection();
  if (!(await getPendingLogin())) redirect(adminUrl("/entrar?erro=expirou"));
  const settings = getSettings();

  return (
    <div className="grid min-h-dvh place-items-center bg-petrol-dark p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-lift sm:p-8">
        <Smartphone className="mb-3 size-10 text-brand" />
        <h1 className="text-2xl font-bold text-petrol">Código de verificação</h1>
        <p className="mb-6 text-sm text-muted">
          Abra o aplicativo autenticador no seu celular e digite o código de 6 números de {settings.storeName}.
        </p>
        <Suspense fallback={<div className="h-40" />}>
          <TwoFactorLoginForm defaultNext={adminUrl()} />
        </Suspense>
        <p className="mt-6 text-center text-xs text-muted">
          Perdeu o celular? Digite um dos códigos de recuperação no lugar do código.{" "}
          <Link href={adminUrl("/entrar")} className="font-semibold text-brand-dark underline">
            Voltar
          </Link>
        </p>
      </div>
    </div>
  );
}
