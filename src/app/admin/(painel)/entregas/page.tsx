import type { Metadata } from "next";
import { connection } from "next/server";
import { deleteZoneAction } from "@/app/admin/actions/store";
import { ConfirmSubmit } from "@/components/admin/client-buttons";
import { PickupForm, ZoneEditor } from "@/components/admin/store-forms";
import { Card, PageHeader } from "@/components/admin/ui";
import { listZones } from "@/lib/server/delivery";
import { getSettings } from "@/lib/server/settings";

export const metadata: Metadata = { title: "Entregas" };

export default async function DeliveryPage() {
  await connection();
  const s = getSettings();
  const zones = listZones({ activeOnly: false });
  return (
    <>
      <PageHeader title="Retirada e entregas" subtitle="O cliente escolhe uma destas opções ao finalizar o pedido." />
      <div className="space-y-5">
        <Card title="Retirada na loja">
          <PickupForm enabled={s.pickupEnabled} days={s.pickupDays} note={s.pickupNote} />
        </Card>

        <h2 className="pt-2 font-display text-lg font-bold text-petrol">Regiões de entrega</h2>
        <p className="-mt-3 text-sm text-muted">Monte uma região para cada rota. Ex.: “Centro” todos os dias e “Bairros da zona norte” só às terças. O cliente vê as próximas datas disponíveis.</p>
        {zones.map((z) => (
          <Card key={z.id}>
            <ZoneEditor zone={z} />
            <form action={deleteZoneAction} className="mt-3 border-t border-line pt-2">
              <input type="hidden" name="id" value={z.id} />
              <ConfirmSubmit message={`Apagar a região "${z.name}"?`} className="text-xs font-semibold text-red-600 hover:underline">
                Apagar região
              </ConfirmSubmit>
            </form>
          </Card>
        ))}
        <Card title="Nova região">
          <ZoneEditor key={zones.length} nextSort={zones.length} />
        </Card>
      </div>
    </>
  );
}
