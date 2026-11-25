"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { changeCustomerPassword, type PasswordState } from "@/app/(loja)/conta/actions";
import { PasswordField } from "../auth/password-field";

/** Minha conta > Alterar senha. */
export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changeCustomerPassword, {});
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} key={state.ok} className="grid gap-4 sm:grid-cols-3">
      <PasswordField label="Senha atual" name="current" autoComplete="current-password" required error={e.current} />
      <PasswordField label="Nova senha" name="password" autoComplete="new-password" required error={e.password} hint="8 ou mais, com letras e números." />
      <PasswordField label="Repita a nova senha" name="confirm" autoComplete="new-password" required error={e.confirm} />
      <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
        <button type="submit" disabled={pending} className="btn btn-primary h-11 px-6 text-sm disabled:opacity-70">
          {pending && <Loader2 className="size-4 animate-spin" />} Alterar senha
        </button>
        {state.error && <p className="text-sm font-medium text-red-700">{state.error}</p>}
        {state.ok && <p className="text-sm font-medium text-emerald-700">{state.ok}</p>}
      </div>
    </form>
  );
}
