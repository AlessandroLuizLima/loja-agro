"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signIn, type AuthState } from "@/app/(loja)/conta/actions";
import { FormField } from "../form-field";
import { PasswordField } from "./password-field";

type SignInAction = (prev: AuthState, formData: FormData) => Promise<AuthState>;

/** `action`: o painel passa o próprio login (adminSignIn); a loja usa o login de cliente. */
export function SignInForm({ defaultNext = "/conta", allowSignUp = true, action: signInAction = signIn }: { defaultNext?: string; allowSignUp?: boolean; action?: SignInAction }) {
  const next = useSearchParams().get("next") ?? defaultNext;
  const [state, action, pending] = useActionState<AuthState, FormData>(signInAction, {});

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
      {allowSignUp && (
      <p className="mt-6 text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href={`/conta/cadastrar?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-dark hover:underline">
          Cadastre-se grátis
        </Link>
      </p>
      )}
    </>
  );
}
