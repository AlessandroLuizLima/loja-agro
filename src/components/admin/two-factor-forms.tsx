"use client";

import { Check, Copy, Loader2, ShieldOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { confirmTwoFactorAction, disableTwoFactorAction, type TwoFactorState } from "@/app/admin/actions/two-factor";

const codeInput = "h-12 w-full rounded-xl border-2 border-line bg-white px-4 font-mono text-lg tracking-widest outline-none focus:border-brand";

/** Passo 2 da ativação: digita o código do aplicativo; em seguida mostra os códigos de recuperação uma única vez. */
export function ConfirmTwoFactorForm({ cancelAction }: { cancelAction: () => Promise<void> }) {
  const [state, action, pending] = useActionState<TwoFactorState, FormData>(confirmTwoFactorAction, {});
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (state.codes) {
    const codes = state.codes;
    return (
      <div className="rounded-2xl border-2 border-emerald-300 bg-mint/50 p-4">
        <p className="flex items-center gap-2 font-display font-bold text-emerald-800">
          <Check className="size-5" /> Verificação em duas etapas ativada
        </p>
        <p className="mt-2 text-sm">
          Guarde estes <b>códigos de recuperação</b> num lugar seguro (anote no papel ou salve num gerenciador de senhas). Se perder o celular, cada código permite entrar uma vez.{" "}
          <b>Eles não aparecem de novo.</b>
        </p>
        <ul className="my-3 grid grid-cols-2 gap-2 font-mono text-sm sm:grid-cols-4">
          {codes.map((c) => (
            <li key={c} className="rounded-lg bg-white px-3 py-2 text-center">
              {c}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(codes.join("\n")).then(() => setCopied(true))}
            className="btn h-10 border-2 border-line bg-white px-4 text-sm text-petrol"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copiados" : "Copiar códigos"}
          </button>
          <button type="button" onClick={() => router.refresh()} className="btn btn-primary h-10 px-4 text-sm">
            Já guardei os códigos
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <label className="min-w-0 flex-1 basis-48">
        <span className="mb-1 block text-sm font-medium">Código de 6 números que aparece no aplicativo</span>
        <input name="code" required inputMode="numeric" autoComplete="one-time-code" maxLength={7} placeholder="000000" className={codeInput} />
      </label>
      <button type="submit" disabled={pending} className="btn btn-primary h-12 px-6 text-sm disabled:opacity-70">
        {pending && <Loader2 className="size-4 animate-spin" />} Confirmar e ativar
      </button>
      <button type="submit" formAction={cancelAction} formNoValidate className="h-12 px-2 text-sm font-semibold text-muted hover:underline">
        Cancelar
      </button>
      {state.error && (
        <p role="alert" className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function DisableTwoFactorForm() {
  const [state, action, pending] = useActionState<TwoFactorState, FormData>(disableTwoFactorAction, {});
  return (
    <details className="mt-4 rounded-xl border-2 border-line p-3 open:border-red-200">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-muted">
        <ShieldOff className="size-4" /> Desativar verificação em duas etapas
      </summary>
      <form action={action} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label>
          <span className="mb-1 block text-sm font-medium">Sua senha</span>
          <input name="password" type="password" required autoComplete="current-password" className="h-12 w-full rounded-xl border-2 border-line px-3 outline-none focus:border-red-400" />
        </label>
        <label>
          <span className="mb-1 block text-sm font-medium">Código do aplicativo</span>
          <input name="code" required autoComplete="one-time-code" maxLength={20} className={codeInput} />
        </label>
        <button type="submit" disabled={pending} className="btn h-12 bg-red-600 px-5 text-sm text-white hover:bg-red-700 disabled:opacity-70">
          {pending && <Loader2 className="size-4 animate-spin" />} Desativar
        </button>
        {state.error && (
          <p role="alert" className="font-medium text-red-700 sm:col-span-3">
            {state.error}
          </p>
        )}
      </form>
    </details>
  );
}
