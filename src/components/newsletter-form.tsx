"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { subscribeNewsletter, type NewsletterState } from "@/app/actions";

const initial: NewsletterState = { status: "idle" };

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, initial);

  if (state.status === "success") {
    return (
      <div role="status" className="mx-auto max-w-md rounded-2xl bg-white p-5 shadow-card">
        <p className="font-display font-semibold text-petrol">Pronto! 🎉 Seu cupom é:</p>
        <p className="my-3 inline-block rounded-xl border-2 border-dashed border-brand bg-brand-soft px-4 py-2 font-display text-lg font-bold tracking-widest text-petrol">
          {state.coupon}
        </p>
        <p className="text-xs text-muted">Use no carrinho em compras acima de R$ 99.</p>
      </div>
    );
  }

  return (
    <form action={action} className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row" noValidate>
      <label htmlFor="nl-email" className="sr-only">
        Seu e-mail
      </label>
      <input
        id="nl-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="Digite seu melhor e-mail"
        aria-invalid={state.status === "error"}
        aria-describedby="nl-error"
        className="h-13 flex-1 rounded-full border-2 border-line bg-white px-5 outline-none transition focus:border-brand aria-invalid:border-red-400"
      />
      <button type="submit" disabled={pending} className="btn btn-primary h-13 disabled:opacity-70">
        {pending && <Loader2 className="size-4 animate-spin" />}
        Quero meu cupom
      </button>
      <p id="nl-error" className="text-sm font-medium text-red-600 sm:sr-only" aria-live="polite">
        {state.status === "error" ? state.message : ""}
      </p>
    </form>
  );
}
