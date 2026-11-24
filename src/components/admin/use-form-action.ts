"use client";

import { startTransition, useActionState, type FormEvent } from "react";

/**
 * Como useActionState, mas sem o React limpar o formulário depois do envio:
 * se o servidor apontar um erro, o lojista não perde o que digitou (nem a foto escolhida).
 */
export function useFormAction<S>(action: (prev: Awaited<S>, formData: FormData) => Promise<S>, initial: Awaited<S>) {
  const [state, dispatch, pending] = useActionState<S, FormData>(action, initial);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => dispatch(formData));
  };
  return [state, onSubmit, pending] as const;
}
