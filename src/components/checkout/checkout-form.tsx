"use client";

import { CreditCard, Loader2, Lock, MapPin, Receipt, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { placeOrder, type CheckoutState } from "@/app/checkout/actions";
import { brl } from "@/lib/format";
import { maskCard, maskCep, maskCpf, maskExpiry, maskPhone } from "@/lib/masks";
import { computeTotals, onlyDigits, shippingOptions, type PaymentMethod } from "@/lib/pricing";
import { cardBrand, isValidCardNumber, isValidCpf, isValidExpiry } from "@/lib/validators";
import { PixIcon } from "../icons";
import { useCart } from "../cart-provider";
import { CouponField } from "../coupon-field";
import { FormField } from "../form-field";

type Fields = {
  name: string; email: string; cpf: string; phone: string;
  cep: string; street: string; number: string; complement: string; district: string; city: string; state: string;
  shipping: string; payment: PaymentMethod; installments: string;
  cardNumber: string; cardName: string; cardExpiry: string; cardCvv: string;
};

type CepStatus = "idle" | "loading" | "error" | "ok";

const initialState: CheckoutState = { status: "idle" };

export function CheckoutForm({ user }: { user: { name: string; email: string; phone: string } | null }) {
  const { items, coupon, ready, clear } = useCart();
  const router = useRouter();
  const [state, action, pending] = useActionState(placeOrder, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [cepStatus, setCepStatus] = useState<CepStatus>("idle");
  const numberRef = useRef<HTMLInputElement>(null);
  const lastCep = useRef("");

  const [f, setF] = useState<Fields>({
    name: user?.name ?? "", email: user?.email ?? "", cpf: "", phone: user?.phone ?? "",
    cep: "", street: "", number: "", complement: "", district: "", city: "", state: "",
    shipping: "pac", payment: "pix", installments: "1",
    cardNumber: "", cardName: "", cardExpiry: "", cardCvv: "",
  });

  const set = (key: keyof Fields, mask?: (v: string) => string) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = mask ? mask(e.target.value) : e.target.value;
    setF((prev) => ({ ...prev, [key]: value }));
    setClientErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Pedido criado: limpa o carrinho e vai para a confirmação
  useEffect(() => {
    if (state.status === "success") {
      clear();
      router.replace(`/pedido/${state.orderId}`);
    }
  }, [state, clear, router]);

  // Preenche o endereço pelo CEP (ViaCEP, API pública dos Correios)
  useEffect(() => {
    const cep = onlyDigits(f.cep);
    if (cep.length !== 8 || cep === lastCep.current) return;
    lastCep.current = cep;
    const ctrl = new AbortController();
    setCepStatus("loading");
    fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string }) => {
        if (data.erro) throw new Error("not found");
        setF((prev) => ({ ...prev, street: data.logradouro || prev.street, district: data.bairro || prev.district, city: data.localidade || prev.city, state: data.uf || prev.state }));
        setCepStatus("ok");
        numberRef.current?.focus();
      })
      .catch((err: Error) => err.name !== "AbortError" && setCepStatus("error"));
    return () => ctrl.abort();
  }, [f.cep]);

  const totals = computeTotals({ items, couponCode: coupon, cep: f.cep, shippingId: f.shipping, payment: f.payment });
  const options = shippingOptions(f.cep, totals.subtotal - totals.couponDiscount);
  const errors = { ...(state.status === "error" ? state.fieldErrors : {}), ...clientErrors };
  const installmentsMax = totals.installments.count;

  if (!ready) return <div className="h-[600px] animate-pulse rounded-3xl bg-white" />;

  if (totals.lines.length === 0 && state.status !== "success") {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-card">
        <p className="mb-2 text-6xl" aria-hidden="true">🛒</p>
        <p className="mb-4 font-display text-lg font-semibold text-petrol">Seu carrinho está vazio</p>
        <Link href="/categoria/promocoes" className="btn btn-primary">Ver ofertas</Link>
      </div>
    );
  }

  /** Validação do cartão no navegador. O número completo nunca é enviado ao servidor. */
  function validateBeforeSubmit(e: React.FormEvent<HTMLFormElement>) {
    const errs: Record<string, string> = {};
    if (!isValidCpf(f.cpf)) errs.cpf = "CPF inválido.";
    if (f.payment === "cartao") {
      if (!isValidCardNumber(f.cardNumber)) errs.cardNumber = "Número de cartão inválido.";
      if (f.cardName.trim().split(" ").length < 2) errs.cardName = "Nome como está no cartão.";
      if (!isValidExpiry(f.cardExpiry)) errs.cardExpiry = "Validade inválida.";
      if (!/^\d{3,4}$/.test(f.cardCvv)) errs.cardCvv = "CVV inválido.";
    }
    setClientErrors(errs);
    if (Object.keys(errs).length > 0) {
      e.preventDefault();
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus();
    }
  }

  return (
    <form action={action} onSubmit={validateBeforeSubmit} noValidate className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="coupon" value={coupon ?? ""} />
      <input type="hidden" name="cardBrand" value={f.payment === "cartao" ? cardBrand(f.cardNumber) : ""} />
      <input type="hidden" name="cardLast4" value={f.payment === "cartao" ? onlyDigits(f.cardNumber).slice(-4) : ""} />

      <div className="space-y-5">
        <Step n={1} title="Seus dados" icon={<User className="size-5" />}>
          {!user && (
            <p className="mb-4 rounded-xl bg-petrol-soft px-4 py-3 text-sm">
              Já tem conta?{" "}
              <Link href="/conta/entrar?next=/checkout" className="font-semibold text-petrol underline">Entre</Link> para acompanhar seu pedido. Ou continue como visitante.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField className="sm:col-span-2" label="Nome completo" name="name" autoComplete="name" required value={f.name} onChange={set("name")} error={errors.name} />
            <FormField label="E-mail" name="email" type="email" autoComplete="email" required value={f.email} onChange={set("email")} error={errors.email} />
            <FormField label="CPF" name="cpf" inputMode="numeric" required placeholder="000.000.000-00" value={f.cpf} onChange={set("cpf", maskCpf)} error={errors.cpf} hint="Para a nota fiscal" />
            <FormField label="Celular" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" required placeholder="(11) 90000-0000" value={f.phone} onChange={set("phone", maskPhone)} error={errors.phone} />
          </div>
        </Step>

        <Step n={2} title="Entrega" icon={<MapPin className="size-5" />}>
          <div className="grid gap-4 sm:grid-cols-6">
            <FormField
              className="sm:col-span-2"
              label="CEP"
              name="cep"
              inputMode="numeric"
              autoComplete="postal-code"
              required
              placeholder="00000-000"
              value={f.cep}
              onChange={set("cep", maskCep)}
              error={errors.cep ?? (cepStatus === "error" ? "CEP não encontrado. Preencha o endereço manualmente." : undefined)}
              hint={cepStatus === "loading" ? "Buscando endereço…" : <a href="https://buscacepinter.correios.com.br/" target="_blank" rel="noopener noreferrer" className="underline">Não sei meu CEP</a>}
            />
            <FormField className="sm:col-span-4" label="Rua / Avenida" name="street" autoComplete="address-line1" required value={f.street} onChange={set("street")} error={errors.street} />
            <FormField className="sm:col-span-2" label="Número" name="number" required value={f.number} onChange={set("number")} error={errors.number} ref={numberRef} />
            <FormField className="sm:col-span-4" label="Complemento" name="complement" autoComplete="address-line2" placeholder="Apto, bloco…" value={f.complement} onChange={set("complement")} />
            <FormField className="sm:col-span-2" label="Bairro" name="district" required value={f.district} onChange={set("district")} error={errors.district} />
            <FormField className="sm:col-span-3" label="Cidade" name="city" autoComplete="address-level2" required value={f.city} onChange={set("city")} error={errors.city} />
            <FormField className="sm:col-span-1" label="UF" name="state" autoComplete="address-level1" required maxLength={2} value={f.state} onChange={set("state", (v) => v.toUpperCase().replace(/[^A-Z]/g, ""))} error={errors.state} />
          </div>

          <fieldset className="mt-5">
            <legend className="mb-2 text-sm font-medium">Forma de entrega</legend>
            {options.length === 0 ? (
              <p className="rounded-xl bg-cream px-4 py-3 text-sm text-muted">Informe o CEP para ver as opções de frete.</p>
            ) : (
              <div className="space-y-2">
                {options.map((o) => (
                  <Choice key={o.id} name="shipping" value={o.id} checked={f.shipping === o.id} onChange={set("shipping")}>
                    <span className="flex-1">
                      <span className="block font-semibold text-petrol">{o.name}</span>
                      <span className="text-xs text-muted">{o.deadline}</span>
                    </span>
                    <span className={`font-display font-bold ${o.price === 0 ? "text-emerald-700" : "text-petrol"}`}>{o.price === 0 ? "Grátis" : brl(o.price)}</span>
                  </Choice>
                ))}
              </div>
            )}
            {errors.shipping && <p className="mt-1 text-xs font-medium text-red-600">{errors.shipping}</p>}
          </fieldset>
        </Step>

        <Step n={3} title="Pagamento" icon={<CreditCard className="size-5" />}>
          <fieldset>
            <legend className="sr-only">Forma de pagamento</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              <Choice name="payment" value="pix" checked={f.payment === "pix"} onChange={set("payment")}>
                <PixIcon className="size-5 text-teal-600" />
                <span><b className="block text-petrol">Pix</b><span className="text-xs font-semibold text-emerald-700">5% OFF</span></span>
              </Choice>
              <Choice name="payment" value="cartao" checked={f.payment === "cartao"} onChange={set("payment")}>
                <CreditCard className="size-5 text-petrol" />
                <span><b className="block text-petrol">Cartão</b><span className="text-xs text-muted">até {installmentsMax}x sem juros</span></span>
              </Choice>
              <Choice name="payment" value="boleto" checked={f.payment === "boleto"} onChange={set("payment")}>
                <Receipt className="size-5 text-petrol" />
                <span><b className="block text-petrol">Boleto</b><span className="text-xs text-muted">vence em 3 dias</span></span>
              </Choice>
            </div>
          </fieldset>

          <div className="mt-4">
            {f.payment === "pix" && (
              <p className="rounded-xl bg-mint px-4 py-3 text-sm">
                Você economiza <b>{brl(totals.pixDiscount)}</b>. O QR Code e o código copia-e-cola aparecem após finalizar. Aprovação em segundos.
              </p>
            )}
            {f.payment === "boleto" && <p className="rounded-xl bg-cream px-4 py-3 text-sm">O boleto é gerado após finalizar e pode levar até 2 dias úteis para compensar.</p>}
            {f.payment === "cartao" && (
              <div className="grid gap-4 sm:grid-cols-4">
                {/* Sem atributo name: os dados do cartão não são enviados ao servidor (em produção vão direto ao gateway) */}
                <FormField className="sm:col-span-4" id="f-cardNumber" label="Número do cartão" name="" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={f.cardNumber} onChange={set("cardNumber", maskCard)} error={errors.cardNumber} hint={f.cardNumber.length > 4 ? cardBrand(f.cardNumber) : undefined} />
                <FormField className="sm:col-span-4" id="f-cardName" label="Nome impresso no cartão" name="" autoComplete="cc-name" value={f.cardName} onChange={set("cardName", (v) => v.toUpperCase())} error={errors.cardName} />
                <FormField className="sm:col-span-2" id="f-cardExpiry" label="Validade" name="" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={f.cardExpiry} onChange={set("cardExpiry", maskExpiry)} error={errors.cardExpiry} />
                <FormField className="sm:col-span-2" id="f-cardCvv" label="CVV" name="" inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={f.cardCvv} onChange={set("cardCvv", (v) => onlyDigits(v).slice(0, 4))} error={errors.cardCvv} />
                <label className="sm:col-span-4">
                  <span className="mb-1 block text-sm font-medium">Parcelas</span>
                  <select name="installments" value={Math.min(Number(f.installments), installmentsMax)} onChange={set("installments")} className="h-12 w-full rounded-xl border-2 border-line bg-white px-3 outline-none focus:border-brand">
                    {Array.from({ length: installmentsMax }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}x de {brl(totals.total / n)} sem juros</option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            {f.payment !== "cartao" && <input type="hidden" name="installments" value="1" />}
          </div>
        </Step>
      </div>

      <aside className="space-y-4 rounded-3xl bg-white p-5 shadow-card lg:sticky lg:top-40">
        <h2 className="text-lg font-bold text-petrol">Resumo do pedido</h2>
        <ul className="max-h-64 space-y-3 overflow-y-auto">
          {totals.lines.map((l) => (
            <li key={l.product.slug} className="flex items-center gap-3 text-sm">
              <span className={`relative grid size-12 shrink-0 place-items-center rounded-xl text-2xl ${l.product.tint}`}>
                {l.product.emoji}
                <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-petrol text-[10px] font-bold text-white">{l.qty}</span>
              </span>
              <span className="line-clamp-2 flex-1">{l.product.name}</span>
              <span className="font-semibold">{brl(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <CouponField />
        <dl className="space-y-2 border-t border-line pt-3 text-sm">
          <Row label="Subtotal" value={brl(totals.subtotal)} />
          {totals.couponDiscount > 0 && <Row label={`Cupom ${totals.coupon?.code}`} value={`−${brl(totals.couponDiscount)}`} green />}
          <Row label="Frete" value={totals.shipping ? (totals.shippingPrice === 0 ? "Grátis" : brl(totals.shippingPrice)) : "—"} green={totals.shipping && totals.shippingPrice === 0} />
          {totals.pixDiscount > 0 && <Row label="Desconto Pix (5%)" value={`−${brl(totals.pixDiscount)}`} green />}
          <div className="flex items-end justify-between border-t border-line pt-3">
            <dt className="font-semibold">Total</dt>
            <dd className="font-display text-2xl font-bold text-petrol">{brl(totals.total)}</dd>
          </div>
        </dl>

        {state.status === "error" && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.message}</p>
        )}
        {Object.keys(clientErrors).length > 0 && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">Confira os campos destacados.</p>
        )}

        <button type="submit" disabled={pending || state.status === "success"} className="btn btn-primary h-14 w-full text-lg disabled:opacity-70">
          {pending ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-5" />}
          {pending ? "Processando…" : "Finalizar pedido"}
        </button>
        <p className="text-center text-xs text-muted">
          Ao finalizar, você concorda com os <Link href="/ajuda/termos-de-uso" className="underline">termos de uso</Link>.
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
        <span className="ml-auto text-muted" aria-hidden="true">{icon}</span>
      </h2>
      {children}
    </section>
  );
}

function Choice({ name, value, checked, onChange, children }: { name: string; value: string; checked: boolean; onChange: (e: ChangeEvent<HTMLInputElement>) => void; children: ReactNode }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm transition ${checked ? "border-brand bg-brand-soft/40" : "border-line hover:border-brand/50"}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="size-4 accent-brand" />
      {children}
    </label>
  );
}

function Row({ label, value, green = false }: { label: string; value: string; green?: boolean }) {
  return (
    <div className={`flex justify-between ${green ? "text-emerald-700" : ""}`}>
      <dt className={green ? "" : "text-muted"}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
