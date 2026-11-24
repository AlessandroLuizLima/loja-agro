"use client";

import { Banknote, CreditCard, Loader2, MapPin, Store, Truck, User, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { placeOrder, type CheckoutState } from "@/app/(loja)/checkout/actions";
import { dateLabel } from "@/lib/dates";
import { brl } from "@/lib/format";
import { maskPhone } from "@/lib/masks";
import { computeTotals, zoneFee } from "@/lib/pricing";
import type { OnDeliveryMethod, PaymentMethod } from "@/lib/types";
import { useCart } from "../cart-provider";
import { CouponField } from "../coupon-field";
import { FormField } from "../form-field";
import { PixIcon } from "../icons";
import { ProductImage } from "../product-image";

export type CheckoutConfig = {
  today: string;
  pickup: { enabled: boolean; dates: string[]; address: string; note: string };
  zones: { id: string; name: string; areas: string; fee: number; freeAbove: number | null; dates: string[] }[];
  pix: { enabled: boolean; percent: number };
};

type Fields = {
  name: string;
  phone: string;
  email: string;
  fulfillment: "retirada" | "entrega";
  pickupDate: string;
  zoneId: string;
  deliveryDate: string;
  street: string;
  number: string;
  district: string;
  reference: string;
  payment: PaymentMethod;
  onDelivery: OnDeliveryMethod | "";
  changeFor: string;
  notes: string;
};

const initialState: CheckoutState = { status: "idle" };

export function CheckoutForm({ config, user }: { config: CheckoutConfig; user: { name: string; email: string; phone: string } | null }) {
  const { items, coupon, ready, clear } = useCart();
  const router = useRouter();
  const [state, action, pending] = useActionState(placeOrder, initialState);
  const canPickup = config.pickup.enabled && config.pickup.dates.length > 0;

  const [f, setF] = useState<Fields>({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    fulfillment: canPickup ? "retirada" : "entrega",
    pickupDate: config.pickup.dates[0] ?? "",
    zoneId: config.zones.length === 1 ? config.zones[0].id : "",
    deliveryDate: config.zones.length === 1 ? (config.zones[0].dates[0] ?? "") : "",
    street: "",
    number: "",
    district: "",
    reference: "",
    payment: "na_entrega",
    onDelivery: "",
    changeFor: "",
    notes: "",
  });
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const update = (patch: Partial<Fields>) => {
    setF((prev) => ({ ...prev, ...patch }));
    setTouched((prev) => new Set([...prev, ...Object.keys(patch)]));
  };
  const set = (key: keyof Fields, mask?: (v: string) => string) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    update({ [key]: mask ? mask(e.target.value) : e.target.value } as Partial<Fields>);

  // Pedido criado: limpa o carrinho e vai para a confirmação
  useEffect(() => {
    if (state.status === "success") {
      clear();
      router.replace(`/pedido/${state.orderId}`);
    }
  }, [state, clear, router]);

  const zone = f.fulfillment === "entrega" ? config.zones.find((z) => z.id === f.zoneId) : undefined;
  const totals = computeTotals({ lines: items, coupon, zone, payment: f.payment, pixDiscountPercent: config.pix.percent });
  // Erro do servidor some quando o campo é editado
  const serverErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const errors = Object.fromEntries(Object.entries(serverErrors).filter(([k]) => !touched.has(k)));

  if (!ready) return <div className="h-[600px] animate-pulse rounded-3xl bg-white" />;

  if (items.length === 0 && state.status !== "success") {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-card">
        <p className="mb-2 text-6xl" aria-hidden="true">
          🧺
        </p>
        <p className="mb-4 font-display text-lg font-semibold text-petrol">Seu carrinho está vazio</p>
        <Link href="/" className="btn btn-primary">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <form
      // Envio manual (sem o reset automático do React): campos e escolhas continuam como estão se houver erro
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setTouched(new Set());
        startTransition(() => action(fd));
      }}
      noValidate
      className="grid items-start gap-6 lg:grid-cols-[1fr_400px]"
    >
      <input type="hidden" name="items" value={JSON.stringify(items.map((i) => ({ slug: i.slug, qty: i.qty })))} />
      <input type="hidden" name="coupon" value={coupon?.code ?? ""} />

      <div className="space-y-5">
        <Step n={1} title="Seus dados" icon={<User className="size-5" />}>
          {!user && (
            <p className="mb-4 rounded-xl bg-petrol-soft px-4 py-3 text-sm">
              Já comprou aqui?{" "}
              <Link href="/conta/entrar?next=/checkout" className="font-semibold text-petrol underline">
                Entre
              </Link>{" "}
              para acompanhar seus pedidos. Ou continue sem cadastro.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField className="sm:col-span-2" label="Nome" name="name" autoComplete="name" required value={f.name} onChange={set("name")} error={errors.name} />
            <FormField label="Celular / WhatsApp" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" required placeholder="(11) 90000-0000" value={f.phone} onChange={set("phone", maskPhone)} error={errors.phone} hint="A loja usa para combinar a retirada ou entrega" />
            <FormField label="E-mail (opcional)" name="email" type="email" autoComplete="email" value={f.email} onChange={set("email")} error={errors.email} />
          </div>
        </Step>

        <Step n={2} title="Como quer receber?" icon={<MapPin className="size-5" />}>
          <input type="hidden" name="fulfillment" value={f.fulfillment} />
          <div className="grid gap-2 sm:grid-cols-2">
            {canPickup && (
              <Choice name="fulfillment-choice" checked={f.fulfillment === "retirada"} onChange={() => update({ fulfillment: "retirada" })}>
                <Store className="size-5 shrink-0 text-petrol" />
                <span>
                  <b className="block text-petrol">Retirar na loja</b>
                  <span className="text-xs font-semibold text-emerald-700">Grátis</span>
                </span>
              </Choice>
            )}
            {config.zones.length > 0 && (
              <Choice name="fulfillment-choice" checked={f.fulfillment === "entrega"} onChange={() => update({ fulfillment: "entrega" })}>
                <Truck className="size-5 shrink-0 text-petrol" />
                <span>
                  <b className="block text-petrol">Receber em casa</b>
                  <span className="text-xs text-muted">Taxa conforme a região</span>
                </span>
              </Choice>
            )}
          </div>

          {f.fulfillment === "retirada" && (
            <div className="mt-5">
              <DayPicker label="Quando você vem buscar?" name="pickupDate" dates={config.pickup.dates} today={config.today} value={f.pickupDate} onChange={(v) => update({ pickupDate: v })} error={errors.pickupDate} />
              <p className="mt-3 rounded-xl bg-cream px-4 py-3 text-sm">
                📍 <b>{config.pickup.address}</b>
                <br />
                <span className="text-muted">{config.pickup.note}</span>
              </p>
            </div>
          )}

          {f.fulfillment === "entrega" && (
            <div className="mt-5 space-y-5">
              <fieldset>
                <legend className="mb-2 text-sm font-medium">
                  Sua região <span className="text-brand-dark">*</span>
                </legend>
                <input type="hidden" name="zoneId" value={f.zoneId} />
                <div className="space-y-2">
                  {config.zones.map((z) => {
                    const fee = zoneFee(z, totals.merchandise);
                    return (
                      <Choice key={z.id} name="zone-choice" checked={f.zoneId === z.id} onChange={() => update({ zoneId: z.id, deliveryDate: z.dates[0] ?? "" })}>
                        <span className="flex-1">
                          <span className="block font-semibold text-petrol">{z.name}</span>
                          <span className="text-xs text-muted">{z.areas}</span>
                          {z.freeAbove != null && z.fee > 0 && fee > 0 && <span className="block text-xs text-emerald-700">Grátis a partir de {brl(z.freeAbove)}</span>}
                        </span>
                        <span className={`font-display font-bold whitespace-nowrap ${fee === 0 ? "text-emerald-700" : "text-petrol"}`}>{fee === 0 ? "Grátis" : brl(fee)}</span>
                      </Choice>
                    );
                  })}
                </div>
                {errors.zoneId && <p className="mt-1 text-xs font-medium text-red-600">{errors.zoneId}</p>}
              </fieldset>

              {zone && <DayPicker label="Dia da entrega" name="deliveryDate" dates={zone.dates} today={config.today} value={f.deliveryDate} onChange={(v) => update({ deliveryDate: v })} error={errors.deliveryDate} />}
              {!zone && <input type="hidden" name="deliveryDate" value="" />}

              <div className="grid gap-4 sm:grid-cols-6">
                <FormField className="sm:col-span-4" label="Rua" name="street" autoComplete="address-line1" required value={f.street} onChange={set("street")} error={errors.street} />
                <FormField className="sm:col-span-2" label="Número / km" name="number" placeholder="s/n" value={f.number} onChange={set("number")} />
                <FormField className="sm:col-span-6" label="Bairro ou localidade" name="district" required value={f.district} onChange={set("district")} error={errors.district} />
                <FormField className="sm:col-span-6" label="Ponto de referência" name="reference" placeholder="Ex.: porteira azul depois da capela" value={f.reference} onChange={set("reference")} />
              </div>
            </div>
          )}
        </Step>

        <Step n={3} title="Pagamento" icon={<Wallet className="size-5" />}>
          <input type="hidden" name="payment" value={f.payment} />
          <div className="grid gap-2 sm:grid-cols-2">
            <Choice name="payment-choice" checked={f.payment === "na_entrega"} onChange={() => update({ payment: "na_entrega" })}>
              <Banknote className="size-5 shrink-0 text-petrol" />
              <span>
                <b className="block text-petrol">Pagar na {f.fulfillment === "retirada" ? "retirada" : "entrega"}</b>
                <span className="text-xs text-muted">Dinheiro, cartão ou Pix</span>
              </span>
            </Choice>
            {config.pix.enabled && (
              <Choice name="payment-choice" checked={f.payment === "pix"} onChange={() => update({ payment: "pix" })}>
                <PixIcon className="size-5 shrink-0 text-teal-600" />
                <span>
                  <b className="block text-petrol">Pix agora</b>
                  <span className="text-xs font-semibold text-emerald-700">{config.pix.percent > 0 ? `${config.pix.percent}% de desconto` : "Pague pelo app do banco"}</span>
                </span>
              </Choice>
            )}
          </div>

          {f.payment === "na_entrega" ? (
            <fieldset className="mt-4">
              <legend className="mb-2 text-sm font-medium">
                Como vai pagar? <span className="text-brand-dark">*</span>
              </legend>
              <input type="hidden" name="onDelivery" value={f.onDelivery} />
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["dinheiro", "Dinheiro", <Banknote key="i" className="size-4" />],
                    ["cartao", "Cartão", <CreditCard key="i" className="size-4" />],
                    ["pix", "Pix na hora", <PixIcon key="i" className="size-4" />],
                  ] as const
                ).map(([value, label, icon]) => (
                  <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition ${f.onDelivery === value ? "border-brand bg-brand-soft/50 text-petrol" : "border-line hover:border-brand/50"}`}>
                    <input type="radio" name="onDelivery-choice" className="sr-only" checked={f.onDelivery === value} onChange={() => update({ onDelivery: value })} />
                    {icon} {label}
                  </label>
                ))}
              </div>
              {errors.onDelivery && <p className="mt-1 text-xs font-medium text-red-600">{errors.onDelivery}</p>}
              {f.onDelivery === "dinheiro" && (
                <FormField className="mt-4 max-w-60" label="Troco para quanto? (opcional)" name="changeFor" inputMode="decimal" placeholder="Ex.: 200" value={f.changeFor} onChange={set("changeFor", (v) => v.replace(/[^\d,]/g, ""))} />
              )}
            </fieldset>
          ) : (
            <p className="mt-4 rounded-xl bg-mint px-4 py-3 text-sm">
              {totals.pixDiscount > 0 && (
                <>
                  Você economiza <b>{brl(totals.pixDiscount)}</b>.{" "}
                </>
              )}
              O código Pix aparece depois de finalizar. O dinheiro vai direto para a loja.
            </p>
          )}

          <label className="mt-5 block">
            <span className="mb-1 block text-sm font-medium">Observações (opcional)</span>
            <textarea name="notes" rows={2} maxLength={400} value={f.notes} onChange={set("notes")} placeholder="Ex.: deixar na varanda, chego depois das 16h…" className="w-full rounded-xl border-2 border-line bg-white px-4 py-3 outline-none focus:border-brand" />
          </label>
        </Step>
      </div>

      <aside className="space-y-4 rounded-3xl bg-white p-5 shadow-card lg:sticky lg:top-40">
        <h2 className="text-lg font-bold text-petrol">Resumo do pedido</h2>
        <ul className="max-h-64 space-y-3 overflow-y-auto">
          {items.map((i) => (
            <li key={i.slug} className="flex items-center gap-3 text-sm">
              <span className="relative shrink-0">
                <ProductImage item={i} className="size-12 rounded-xl" emojiClassName="text-2xl" />
                <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-petrol text-[10px] font-bold text-white">{i.qty}</span>
              </span>
              <span className="line-clamp-2 flex-1">{i.name}</span>
              <span className="font-semibold">{brl(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <CouponField />
        <dl className="space-y-2 border-t border-line pt-3 text-sm">
          <Row label="Subtotal" value={brl(totals.subtotal)} />
          {totals.couponDiscount > 0 && <Row label={`Cupom ${coupon?.code}`} value={`−${brl(totals.couponDiscount)}`} green />}
          <Row
            label={f.fulfillment === "retirada" ? "Retirada" : "Entrega"}
            value={f.fulfillment === "retirada" ? "Grátis" : zone ? (totals.deliveryFee === 0 ? "Grátis" : brl(totals.deliveryFee)) : "escolha a região"}
            green={f.fulfillment === "retirada" || (!!zone && totals.deliveryFee === 0)}
          />
          {totals.pixDiscount > 0 && <Row label={`Desconto Pix (${config.pix.percent}%)`} value={`−${brl(totals.pixDiscount)}`} green />}
          <div className="flex items-end justify-between border-t border-line pt-3">
            <dt className="font-semibold">Total</dt>
            <dd className="font-display text-2xl font-bold text-petrol">{brl(totals.total)}</dd>
          </div>
        </dl>

        {state.status === "error" && touched.size === 0 && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {state.message}
          </p>
        )}

        <button type="submit" disabled={pending || state.status === "success"} className="btn btn-primary h-14 w-full text-lg disabled:opacity-70">
          {pending && <Loader2 className="size-5 animate-spin" />}
          {pending ? "Enviando…" : f.fulfillment === "retirada" ? "Reservar pedido" : "Fazer pedido"}
        </button>
        <p className="text-center text-xs text-muted">
          Ao finalizar, você concorda com os{" "}
          <Link href="/ajuda/termos-de-uso" className="underline">
            termos de uso
          </Link>
          .
        </p>
      </aside>
    </form>
  );
}

function Step({ n, title, icon, children }: { n: number; title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-card sm:p-6" aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="mb-4 flex items-center gap-3 text-lg font-bold text-petrol">
        <span className="grid size-8 place-items-center rounded-full bg-brand font-display text-sm text-white">{n}</span>
        {title}
        <span className="ml-auto text-muted" aria-hidden="true">
          {icon}
        </span>
      </h2>
      {children}
    </section>
  );
}

function Choice({ name, checked, onChange, children }: { name: string; checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm transition ${checked ? "border-brand bg-brand-soft/40" : "border-line hover:border-brand/50"}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="size-4 shrink-0 accent-brand" />
      {children}
    </label>
  );
}

function DayPicker({ label, name, dates, today, value, onChange, error }: { label: string; name: string; dates: string[]; today: string; value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">
        {label} <span className="text-brand-dark">*</span>
      </legend>
      <input type="hidden" name={name} value={value} />
      {dates.length === 0 ? (
        <p className="text-sm text-muted">Sem datas disponíveis. Fale com a loja pelo WhatsApp.</p>
      ) : (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {dates.map((d) => (
            <label key={d} className={`shrink-0 cursor-pointer rounded-xl border-2 px-4 py-2.5 text-center text-sm font-semibold transition ${value === d ? "border-brand bg-brand text-white" : "border-line text-petrol hover:border-brand/50"}`}>
              <input type="radio" name={`${name}-choice`} className="sr-only" checked={value === d} onChange={() => onChange(d)} />
              {dateLabel(d, today)}
            </label>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </fieldset>
  );
}

function Row({ label, value, green = false }: { label: string; value: string; green?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${green ? "text-emerald-700" : ""}`}>
      <dt className={green ? "" : "text-muted"}>{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
