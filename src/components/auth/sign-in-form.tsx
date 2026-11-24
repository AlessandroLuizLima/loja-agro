"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signIn, type AuthState } from "@/app/conta/actions";
import { FormField } from "../form-field";
import { PasswordField } from "./password-field";

export function SignInForm() {
  const next = useSearchParams().get("next") ?? "/conta";
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});

  return (
    <>
      <form action={action} className="space-y-4" key={state.error}>
        <input type="hidden" name="next" value={next} />
        <FormField label="E-mail" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} />
        <PasswordField label="Senha" name="password" autoComplete="current-password" required />
        {state.error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn btn-primary h-13 w-full text-base disabled:opacity-70">
          {pending && <Loader2 className="size-5 animate-spin" />} Entrar
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href={`/conta/cadastrar?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-dark hover:underline">
          Cadastre-se grátis
        </Link>
      </p>
    </>
  );
}
