import { KeyRound } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { PasswordForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/server/users";
import { adminUrl } from "@/lib/admin-path";

export const metadata: Metadata = { title: "Crie sua senha", robots: { index: false, follow: false } };

/** Primeiro acesso: a senha inicial (das variáveis de ambiente) precisa ser trocada antes de usar o painel. */
export default async function ChangePasswordPage() {
  await connection();
  const admin = await requireAdmin({ allowPendingPassword: true });
  if (!admin.mustChangePassword) redirect(adminUrl());

  return (
    <div className="grid min-h-dvh place-items-center bg-petrol-dark p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-lift sm:p-8">
        <KeyRound className="mb-3 size-10 text-brand" />
        <h1 className="text-2xl font-bold text-petrol">Crie a sua senha</h1>
        <p className="mb-6 text-sm text-muted">
          Você entrou com a senha inicial da instalação. Por segurança, crie uma senha só sua antes de usar o painel: ele dá acesso aos dados de todos os clientes.
        </p>
        <PasswordForm doneHref={adminUrl()} />
      </div>
    </div>
  );
}
