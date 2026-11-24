"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { verifyTwoFactorLogin, type VerifyState } from "@/app/admin/actions/auth";

export function TwoFactorLoginForm({ defaultNext }: { defaultNext: string }) {
  const next = useSearchParams().get("next") ?? defaultNext;
  const [state, action, pending] = useActionState<VerifyState, FormData>(verifyTwoFactorLogin, {});
  return (
    <form action={action} className="space-y-4" key={state.error}>
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Código</span>
        <input
          name="code"
          required
          autoFocus
          autoComplete="one-time-code"
          inputMode="text"
          maxLength={20}
          placeholder="000000"
          className="h-14 w-full rounded-xl border-2 border-line bg-white px-4 text-center font-mono text-2xl tracking-[0.3em] outline-none focus:border-brand"
        />
      </label>
      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary h-13 w-full text-base disabled:opacity-70">
        {pending && <Loader2 className="size-5 animate-spin" />} Confirmar
      </button>
    </form>
  );
}
