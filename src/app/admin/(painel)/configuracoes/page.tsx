import type { Metadata } from "next";
import { connection } from "next/server";
import { PasswordForm, SettingsForm } from "@/components/admin/settings-form";
import { TwoFactorCard } from "@/components/admin/two-factor-card";
import { Card, PageHeader } from "@/components/admin/ui";
import { getSettings } from "@/lib/server/settings";
import { requireAdmin } from "@/lib/server/users";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  await connection();
  const admin = await requireAdmin();
  const settings = getSettings();
  return (
    <>
      <PageHeader title="Configurações" subtitle="Tudo que você mudar aqui aparece na loja na hora." />
      <SettingsForm settings={settings} />
      <Card title="Sua senha" description={`Conta de acesso ao painel: ${admin.email}`} className="mt-8">
        <PasswordForm />
      </Card>
      <div id="duas-etapas">
        <TwoFactorCard userId={admin.id} email={admin.email} storeName={settings.storeName} />
      </div>
    </>
  );
}
