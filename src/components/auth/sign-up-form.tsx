"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signUp, type AuthState } from "@/app/(loja)/conta/actions";
import { maskPhone } from "@/lib/masks";
import { FormField } from "../form-field";
import { PasswordField } from "./password-field";

export function SignUpForm() {
  const next = useSearchParams().get("next") ?? "/conta";
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});
  const e = state.fieldErrors ?? {};

  return (
    <>
      {/* key: o React 19 limpa o form após a action; remontar devolve os valores digitados */}
      <form action={action} className="space-y-4" key={JSON.stringify(state)} noValidate>
        <input type="hidden" name="next" value={next} />
        <FormField label="Nome completo" name="name" autoComplete="name" required defaultValue={state.values?.name} error={e.name} />
        <FormField label="E-mail" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} error={e.email} />
        <FormField
          label="Celular / WhatsApp (opcional)"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="(11) 90000-0000"
          defaultValue={state.values?.phone}
          error={e.phone}
          onInput={(ev) => (ev.currentTarget.value = maskPhone(ev.currentTarget.value))}
        />
        <PasswordField label="Senha" name="password" autoComplete="new-password" required error={e.password} hint="Mínimo de 8 caracteres, com letras e números." />
        <PasswordField label="Confirme a senha" name="confirm" autoComplete="new-password" required error={e.confirm} />
        <div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="terms" className="mt-0.5 size-5 accent-brand" aria-invalid={!!e.terms || undefined} />
            <span>
              Li e aceito os{" "}
              <Link href="/ajuda/termos-de-uso" target="_blank" className="font-semibold text-brand-dark underline">
                termos de uso
              </Link>{" "}
              e a{" "}
              <Link href="/ajuda/politica-de-privacidade" target="_blank" className="font-semibold text-brand-dark underline">
                política de privacidade
              </Link>
              .
            </span>
          </label>
          {e.terms && <p className="mt-1 text-xs font-medium text-red-600">{e.terms}</p>}
        </div>
        <button type="submit" disabled={pending} className="btn btn-primary h-13 w-full text-base disabled:opacity-70">
          {pending && <Loader2 className="size-5 animate-spin" />} Criar conta
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href={`/conta/entrar?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-dark hover:underline">
          Entrar
        </Link>
      </p>
    </>
  );
}
