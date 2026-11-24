"use client";

import { Trash2 } from "lucide-react";
import { createCouponAction, deleteCategoryAction, saveCategoryAction, savePickupAction, saveZoneAction } from "@/app/admin/actions/store";
import { TINT_NAMES, tintClass, type Category, type DeliveryZone } from "@/lib/types";
import { Field, FormMessage, Select, SubmitButton, Toggle, WeekdayPicker, type AdminState } from "./ui";
import { useFormAction } from "./use-form-action";

const money = (n: number | null | undefined) => (n == null ? "" : n.toFixed(2).replace(".", ","));
const TINT_LABEL: Record<string, string> = { verde: "Verde", laranja: "Laranja", amarelo: "Amarelo", azul: "Azul", rosa: "Rosa", petroleo: "Cinza-azulado" };

/* ===== Categorias ===== */

export function CategoryEditor({ category, nextSort }: { category?: Category; nextSort?: number }) {
  const [state, onSubmit, pending] = useFormAction<AdminState>(saveCategoryAction, {});
  const [delState, onDelete, deleting] = useFormAction<AdminState>(deleteCategoryAction, {});
  const e = state.fieldErrors ?? {};
  const uid = category?.id ?? "nova";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <form onSubmit={onSubmit} noValidate className="grid gap-3 sm:grid-cols-[70px_1fr_150px_80px]">
        {category && <input type="hidden" name="id" value={category.id} />}
        <Field id={`emoji-${uid}`} label="Ícone" name="emoji" defaultValue={category?.emoji ?? "🌱"} maxLength={8} className="text-center" />
        <Field id={`name-${uid}`} label="Nome" name="name" required defaultValue={category?.name} error={e.name} />
        <Select id={`tint-${uid}`} label="Cor" name="tint" defaultValue={category?.tint ?? "verde"}>
          {TINT_NAMES.map((t) => (
            <option key={t} value={t}>
              {TINT_LABEL[t]}
            </option>
          ))}
        </Select>
        <Field id={`sort-${uid}`} label="Ordem" name="sort" type="number" min={0} defaultValue={category?.sort ?? nextSort ?? 0} />
        <Field id={`desc-${uid}`} className="sm:col-span-4" label="Descrição (aparece no topo da categoria)" name="description" defaultValue={category?.description} />
        <div className="flex flex-wrap items-center gap-3 sm:col-span-4">
          <span className={`grid size-10 place-items-center rounded-full text-xl ${tintClass(category?.tint ?? "verde")}`} aria-hidden="true">
            {category?.emoji ?? "🌱"}
          </span>
          <Toggle name="active" label="Visível na loja" defaultChecked={category?.active ?? true} />
          {category && <span className="text-xs text-muted">{category.productCount} produtos ativos</span>}
          <SubmitButton pending={pending} className="ml-auto">
            {category ? "Salvar" : "Criar categoria"}
          </SubmitButton>
        </div>
        <div className="sm:col-span-4">
          <FormMessage state={state} />
        </div>
      </form>
      {category && (
        <form onSubmit={onDelete} className="mt-2 border-t border-line pt-2">
          <input type="hidden" name="id" value={category.id} />
          <button type="submit" disabled={deleting} className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50">
            <Trash2 className="size-3.5" /> Apagar categoria
          </button>
          <div className="mt-2">
            <FormMessage state={delState} />
          </div>
        </form>
      )}
    </div>
  );
}

/* ===== Retirada ===== */

export function PickupForm({ enabled, days, note }: { enabled: boolean; days: number[]; note: string }) {
  const [state, onSubmit, pending] = useFormAction<AdminState>(savePickupAction, {});
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Toggle name="pickupEnabled" label="Oferecer retirada na loja" hint="Grátis para o cliente. Ele escolhe o dia no checkout." defaultChecked={enabled} />
      <WeekdayPicker name="pickupDays" label="Dias em que a loja abre para retirada" defaultValue={days} />
      <Field label="Recado para o cliente" name="pickupNote" defaultValue={note} placeholder="Ex.: Separamos em até 2 horas." />
      <FormMessage state={state} />
      <SubmitButton pending={pending}>Salvar retirada</SubmitButton>
    </form>
  );
}

/* ===== Regiões de entrega ===== */

export function ZoneEditor({ zone, nextSort }: { zone?: DeliveryZone; nextSort?: number }) {
  const [state, onSubmit, pending] = useFormAction<AdminState>(saveZoneAction, {});
  const e = state.fieldErrors ?? {};
  const uid = zone?.id ?? "nova";
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-3 sm:grid-cols-4">
      {zone && <input type="hidden" name="id" value={zone.id} />}
      <Field id={`zname-${uid}`} className="sm:col-span-3" label="Nome da região" name="name" required defaultValue={zone?.name} error={e.name} placeholder="Ex.: Zona norte – entrega às terças" />
      <Field id={`zsort-${uid}`} label="Ordem" name="sort" type="number" min={0} defaultValue={zone?.sort ?? nextSort ?? 0} />
      <Field id={`zareas-${uid}`} className="sm:col-span-4" label="Bairros e localidades atendidos" name="areas" defaultValue={zone?.areas} placeholder="Ex.: Mailasqui, Canguera e São João Novo" />
      <Field id={`zfee-${uid}`} label="Taxa (R$)" name="fee" inputMode="decimal" required defaultValue={money(zone?.fee ?? 0)} error={e.fee} hint="0 = grátis" />
      <Field id={`zfree-${uid}`} label="Grátis acima de (R$)" name="freeAbove" inputMode="decimal" defaultValue={money(zone?.freeAbove)} error={e.freeAbove} hint="Opcional" />
      <div className="sm:col-span-2">
        <WeekdayPicker name="days" label="Dias de entrega" defaultValue={zone?.days ?? []} />
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-4">
        <Toggle name="active" label="Ativa" defaultChecked={zone?.active ?? true} />
        <SubmitButton pending={pending} className="ml-auto">
          {zone ? "Salvar região" : "Adicionar região"}
        </SubmitButton>
      </div>
      <div className="sm:col-span-4">
        <FormMessage state={state} />
      </div>
    </form>
  );
}

/* ===== Cupons ===== */

export function CouponForm() {
  const [state, onSubmit, pending] = useFormAction<AdminState>(createCouponAction, {});
  const e = state.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-3 sm:grid-cols-[1fr_120px_160px_auto] sm:items-start">
      <Field label="Código" name="code" required placeholder="Ex.: SAFRA10" error={e.code} className="uppercase" />
      <Field label="Desconto (%)" name="percent" type="number" min={1} max={90} required placeholder="10" error={e.percent} />
      <Field label="Compra mínima (R$)" name="minSubtotal" inputMode="decimal" placeholder="Opcional" error={e.minSubtotal} />
      <SubmitButton pending={pending} className="sm:mt-6">
        Criar cupom
      </SubmitButton>
      <div className="sm:col-span-4">
        <FormMessage state={state} />
      </div>
    </form>
  );
}
