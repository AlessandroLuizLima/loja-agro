"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { deleteAccount, type DeleteAccountState } from "@/app/(loja)/conta/actions";

/** Exclusão da conta pelo próprio cliente (LGPD), com senha e confirmação digitada. */
export function DeleteAccount() {
  const [state, action, pending] = useActionState<DeleteAccountState, FormData>(deleteAccount, {});
  return (
    <details className="group mt-3 rounded-xl border-2 border-line p-3 open:border-red-200">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-muted group-open:text-red-700">
        <Trash2 className="size-4" /> Excluir minha conta
      </summary>
      <form action={action} className="mt-3 space-y-3 text-sm">
        <p className="text-muted">
          Sua conta e seus dados pessoais (nome, e-mail, telefone e endereços) serão apagados. Os pedidos continuam no registro da loja, sem nenhum dado que identifique você. Não dá
          para desfazer.
        </p>
        <label className="block">
          <span className="mb-1 block font-medium">Sua senha</span>
          <input name="password" type="password" autoComplete="current-password" required className="h-11 w-full rounded-xl border-2 border-line px-3 outline-none focus:border-red-400" />
        </label>
        <label className="block">
          <span className="mb-1 block font-medium">
            Digite <b>EXCLUIR</b> para confirmar
          </span>
          <input name="confirm" required autoComplete="off" className="h-11 w-full rounded-xl border-2 border-line px-3 uppercase outline-none focus:border-red-400" />
        </label>
        {state.error && (
          <p role="alert" className="font-medium text-red-700">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn h-11 w-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-70">
          {pending && <Loader2 className="size-4 animate-spin" />} Excluir conta definitivamente
        </button>
      </form>
    </details>
  );
}
