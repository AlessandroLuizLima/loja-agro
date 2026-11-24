import type { Metadata } from "next";
import { connection } from "next/server";
import { PasswordForm, SettingsForm } from "@/components/admin/settings-form";
import { Card, PageHeader } from "@/components/admin/ui";
import { getSettings } from "@/lib/server/settings";
import { requireAdmin } from "@/lib/server/users";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  await connection();
  const admin = await requireAdmin();
  return (
    <>
      <PageHeader title="Configurações" subtitle="Tudo que você mudar aqui aparece na loja na hora." />
      <SettingsForm settings={getSettings()} />
      <Card title="Sua senha" description={`Conta de acesso ao painel: ${admin.email}`} className="mt-8">
        <PasswordForm />
      </Card>
    </>
  );
}
